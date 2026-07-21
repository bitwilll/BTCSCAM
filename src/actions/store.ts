"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { orderNumber } from "@/lib/format";
import { CRYPTO_METHODS } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string; message?: string };
export type CheckoutState = { error?: string } | null;

type TimelineEntry = { status: string; at: string; note: string };

const VALID_METHODS: string[] = CRYPTO_METHODS.map((m) => m.method);

// ─── Cart ───────────────────────────────────────────────────────────────────

const addSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(99),
});

export async function addToCart(productId: string, qty = 1): Promise<ActionResult> {
  const user = await requireUser(`/store`);
  const parsed = addSchema.safeParse({ productId, qty });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive) return { ok: false, error: "That product is unavailable." };

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: { quantity: { increment: parsed.data.qty } },
    create: { userId: user.id, productId: parsed.data.productId, quantity: parsed.data.qty },
  });

  revalidatePath("/cart");
  return { ok: true, message: "added" };
}

const qtySchema = z.coerce.number().int().max(99);

export async function updateCartItem(itemId: string, qty: number): Promise<ActionResult> {
  const user = await requireUser("/cart");
  const parsed = qtySchema.safeParse(qty);
  if (!parsed.success) return { ok: false, error: "Invalid quantity." };

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== user.id) return { ok: false, error: "Item not found." };

  if (parsed.data <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parsed.data } });
  }

  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(itemId: string): Promise<ActionResult> {
  const user = await requireUser("/cart");
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== user.id) return { ok: false, error: "Item not found." };

  await prisma.cartItem.delete({ where: { id: item.id } });
  revalidatePath("/cart");
  return { ok: true };
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  address: z.string().trim().min(3, "Enter a street address"),
  city: z.string().trim().min(1, "Enter a city"),
  country: z.string().trim().min(1, "Enter a country"),
  zip: z.string().trim().min(1, "Enter a postal / ZIP code"),
  cryptoMethod: z
    .string()
    .refine((v) => VALID_METHODS.includes(v), "Choose a payment method"),
});

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await requireUser("/checkout");

  const parsed = shippingSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    zip: formData.get("zip"),
    cryptoMethod: formData.get("cryptoMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  if (items.length === 0) return { error: "Your cart is empty." };

  const subtotal = items.reduce((sum, i) => sum + i.product.priceUsd * i.quantity, 0);
  const total = subtotal; // crypto-only checkout — no card fees / tax added here

  const { name, email, address, city, country, zip, cryptoMethod } = parsed.data;
  const wallet = await prisma.cryptoWallet.findUnique({ where: { method: cryptoMethod } });

  const oNum = orderNumber();
  const timeline: TimelineEntry[] = [
    { status: "pending_payment", at: new Date().toISOString(), note: "Order placed" },
  ];

  await prisma.order.create({
    data: {
      orderNumber: oNum,
      status: "pending_payment",
      email,
      subtotalUsd: subtotal,
      totalUsd: total,
      cryptoMethod,
      cryptoAddress: wallet?.address ?? null,
      cryptoNetwork: wallet?.network ?? null,
      shipping: { name, address, city, country, zip },
      timeline,
      userId: user.id,
      items: {
        createMany: {
          data: items.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            priceUsd: i.product.priceUsd,
            quantity: i.quantity,
          })),
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { userId: user.id } });

  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect(`/orders/${oNum}`);
}

// ─── Post-order ───────────────────────────────────────────────────────────────

const txSchema = z.object({
  orderNumber: z.string().trim().min(1),
  txHash: z.string().trim().min(6, "Enter the full transaction hash").max(200),
});

export async function submitTxHash(orderNumberValue: string, txHash: string): Promise<ActionResult> {
  const user = await requireUser("/orders");
  const parsed = txSchema.safeParse({ orderNumber: orderNumberValue, txHash });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const order = await prisma.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.userId && order.userId !== user.id) return { ok: false, error: "This is not your order." };

  const existing = (Array.isArray(order.timeline) ? order.timeline : []) as TimelineEntry[];
  const timeline: TimelineEntry[] = [
    ...existing,
    {
      status: order.status,
      at: new Date().toISOString(),
      note: `Transaction hash submitted for verification: ${parsed.data.txHash}`,
    },
  ];

  await prisma.order.update({
    where: { id: order.id },
    data: { txHash: parsed.data.txHash, timeline },
  });

  revalidatePath(`/orders/${parsed.data.orderNumber}`);
  revalidatePath("/orders");
  return { ok: true, message: "recorded" };
}
