"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CRYPTO_METHODS, CONSULT_TOPICS } from "@/lib/constants";

// Shared result shape for client-invoked actions (useActionState).
export type ServiceState = { ok: boolean; error?: string; message?: string } | null;

// ─── helpers ───
function field(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function optNumber(raw: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const CRYPTO_METHOD_VALUES = CRYPTO_METHODS.map((m) => m.method) as readonly string[];
const CONSULT_TOPIC_VALUES = CONSULT_TOPICS as readonly string[];

// ─────────────────────────────────────────────────────── recordDonation ──
// Public pledge: records intent to donate crypto (like the public newsletter
// signup). All donor fields are optional; anonymity is honored. We look up the
// receiving wallet from CryptoWallet by method so the address is never invented.

const donationSchema = z.object({
  donorName: z.string().max(80, "Name is too long").optional(),
  email: z.string().email("Enter a valid email").max(120).optional(),
  cryptoMethod: z
    .string()
    .refine((v) => CRYPTO_METHOD_VALUES.includes(v), "Choose a payment method"),
  amountUsd: z
    .number()
    .positive("Amount must be greater than zero")
    .max(100_000_000, "Amount is too large")
    .optional(),
  txHash: z.string().max(200, "Transaction hash is too long").optional(),
  message: z.string().max(500, "Message is too long (500 char max)").optional(),
  isAnonymous: z.boolean(),
});

export async function recordDonation(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const isAnonymous =
    formData.get("isAnonymous") === "on" || formData.get("isAnonymous") === "true";

  const parsed = donationSchema.safeParse({
    donorName: field(formData, "donorName") || undefined,
    email: field(formData, "email") || undefined,
    cryptoMethod: field(formData, "cryptoMethod"),
    amountUsd: optNumber(field(formData, "amountUsd")),
    txHash: field(formData, "txHash") || undefined,
    message: field(formData, "message") || undefined,
    isAnonymous,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const wallet = await prisma.cryptoWallet.findUnique({ where: { method: d.cryptoMethod } });
  if (!wallet || !wallet.isActive)
    return { ok: false, error: "That payment method is unavailable right now." };

  await prisma.donation.create({
    data: {
      donorName: d.isAnonymous ? null : d.donorName ?? null,
      email: d.email ?? null,
      message: d.message ?? null,
      amountUsd: d.amountUsd != null ? Math.round(d.amountUsd * 100) : null,
      cryptoMethod: d.cryptoMethod,
      cryptoAddress: wallet.address,
      txHash: d.txHash ?? null,
      isAnonymous: d.isAnonymous,
      status: "pledged",
    },
  });

  revalidatePath("/donate");
  revalidatePath("/film-fundraiser");

  return {
    ok: true,
    message: d.txHash
      ? "Pledge recorded — we'll confirm your transaction on-chain. Thank you."
      : "Pledge recorded. Send from your wallet using the address above — thank you for funding the watch.",
  };
}

// ────────────────────────────────────────────────── requestConsultation ──
// Public, free & confidential intake for victim-support / recovery / press /
// legal-orientation / business-security tracks. Redirects to a success page.

const consultationSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  email: z.string().email("Enter a valid email").max(120),
  topic: z.string().refine((v) => CONSULT_TOPIC_VALUES.includes(v), "Choose a track"),
  urgency: z.enum(["low", "normal", "high", "critical"]),
  message: z
    .string()
    .min(10, "Please add a little more detail (10+ characters)")
    .max(4000, "Message is too long"),
  walletInvolved: z.string().max(200, "That value is too long").optional(),
  amountUsd: z.number().positive().max(1_000_000_000).optional(),
});

export async function requestConsultation(
  _prev: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const parsed = consultationSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    topic: field(formData, "topic"),
    urgency: field(formData, "urgency") || "normal",
    message: field(formData, "message"),
    walletInvolved: field(formData, "walletInvolved") || undefined,
    amountUsd: optNumber(field(formData, "amountUsd")),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const c = parsed.data;

  await prisma.consultationRequest.create({
    data: {
      name: c.name,
      email: c.email,
      topic: c.topic,
      urgency: c.urgency,
      message: c.message,
      walletInvolved: c.walletInvolved ?? null,
      amountUsd: c.amountUsd != null ? BigInt(Math.round(c.amountUsd)) : null,
      status: "new",
    },
  });

  redirect("/consultation/success");
}
