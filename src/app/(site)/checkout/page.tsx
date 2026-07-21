import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Container, PageHeader } from "@/components/ui";
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
    <Container className="py-10">
      <PageHeader
        kicker="Checkout"
        title="Confirm & Pay In Crypto"
        lede="Enter where it ships, pick a coin, and we'll generate your payment address. Nothing is charged until you send."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Form + payment */}
        <div className="space-y-10">
          <CheckoutForm defaultEmail={user.email} />

          <section>
            <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
              Accepted Coins
            </h2>
            <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-4">
              Preview the wallets below. Your order confirmation shows the single address to send to.
            </p>
            <CryptoPay />
          </section>
        </div>

        {/* Order summary */}
        <aside className="lg:border-l lg:border-line lg:pl-8">
          <div className="border border-ink bg-paper-2 p-6">
            <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
              Order Summary
            </h2>
            <ul className="space-y-4">
              {items.map((item) => {
                const cover = toStrArray(item.product.imageLabels)[0] || item.product.category;
                return (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-ink leading-tight">{item.product.name}</div>
                      <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-0.5">
                        {cover} · ×{item.quantity}
                      </div>
                    </div>
                    <span className="font-mono text-sm text-ink whitespace-nowrap">
                      {usd(item.product.priceUsd * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="kicker text-ink">Total due</span>
              <span className="font-display text-3xl text-btc-dark">{usd(subtotal)}</span>
            </div>
            <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
              100% funds community investigations
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
