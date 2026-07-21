import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { PageHeader, SectionHeader } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { usd, toStrArray } from "@/lib/format";
import { CheckoutForm } from "./_components/CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout — BTCSCAM.COM",
  description: "Confirm shipping and pay with crypto. No cards, no processors.",
};

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  if (items.length === 0) redirect("/cart");

  const subtotal = items.reduce((sum, i) => sum + i.product.priceUsd * i.quantity, 0);

  return (
    <div className="mx-auto max-w-[1140px] px-6 py-10 fade-up">
      <PageHeader
        kicker="Checkout"
        title="Confirm and pay in crypto"
        lede="Enter where it ships, pick a coin, and we'll generate your payment address. Nothing is charged until you send."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* ── Form + payment ── */}
        <div className="space-y-10">
          <CheckoutForm defaultEmail={user.email} />

          <section>
            <SectionHeader title="Accepted coins" />
            <p className="mb-4 text-[16px] leading-[1.5] text-meta">
              Preview the wallets below. Your order confirmation shows the single address to send to.
            </p>
            <CryptoPay />
          </section>
        </div>

        {/* ── Order summary ── */}
        <aside>
          <div className="bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-[18px] border-b border-ink pb-2.5">
              <h2 className="kicker text-ink">Order summary</h2>
            </div>
            <ul>
              {items.map((item) => {
                const cover = toStrArray(item.product.imageLabels)[0] || item.product.category;
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-rule py-3 first:pt-0 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[16px] leading-tight text-ink">
                        {item.product.name}
                      </div>
                      <div className="mt-0.5 text-[14px] uppercase tracking-[.02em] text-meta">
                        {cover} · ×{item.quantity}
                      </div>
                    </div>
                    <span className="whitespace-nowrap font-bold text-[16px] text-ink">
                      {usd(item.product.priceUsd * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t-[3px] border-ink pt-3.5">
              <span className="font-bold text-[18px] uppercase tracking-[.02em] text-ink">Total</span>
              <span className="font-bold text-[21px] text-ink">{usd(subtotal)}</span>
            </div>
            <div className="mt-1.5 text-[16px] uppercase tracking-[.02em] text-meta">
              Free shipping over $50 · Crypto only
            </div>
            <div className="mt-2.5 text-[14px] text-meta">
              Ships worldwide · 30-day returns · 100% of profit funds the watchdesk
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
