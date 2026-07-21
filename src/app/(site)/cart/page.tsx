import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeader, EmptyState, ButtonLink } from "@/components/ui";
import { usd } from "@/lib/format";
import { CartControls } from "./_components/CartControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart — BTCSCAM.COM",
  description: "Review the merch funding the watch before crypto checkout.",
};

export default async function CartPage() {
  const user = await getSession();

  if (!user) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-10 fade-up">
        <PageHeader kicker="The store" title="Your cart" />
        <EmptyState
          title="Sign in to start a cart"
          hint="Your cart is tied to your account so it follows you across devices. Log in or create a free account to shop."
          action={
            <div className="flex gap-3">
              <ButtonLink href="/login?next=/cart" variant="primary" size="md">
                Log in
              </ButtonLink>
              <ButtonLink href="/store" variant="ghost" size="md">
                Browse store
              </ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.priceUsd * i.quantity, 0);
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 fade-up">
      <PageHeader
        kicker="The store"
        title="Your cart"
        lede={
          items.length > 0
            ? `${totalUnits} item${totalUnits === 1 ? "" : "s"} funding the community watch.`
            : undefined
        }
      />

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[16px] text-meta">Cart&rsquo;s empty. The swag funds the watch.</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/store" variant="primary" size="md">
              Browse the store
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          {/* ── Rows per the v4 cart drawer spec ── */}
          <div>
            {items.map((item) => {
              const lineTotal = item.product.priceUsd * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 border-b border-rule py-3.5 last:border-b-0"
                >
                  <Link
                    href={`/store/${item.product.slug}`}
                    className={`h-16 w-16 flex-none border border-ink ${
                      item.product.imageUrl ? "bg-surface-alt bg-cover bg-center" : "hatch"
                    }`}
                    style={
                      item.product.imageUrl
                        ? { backgroundImage: `url(${item.product.imageUrl})` }
                        : undefined
                    }
                    aria-label={item.product.name}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/store/${item.product.slug}`}
                      className="font-bold text-[16px] leading-tight text-ink hover:underline underline-offset-4"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-0.5 text-[14px] uppercase tracking-[.02em] text-meta">
                      {item.product.category} · {usd(item.product.priceUsd)} each
                    </div>
                    <CartControls itemId={item.id} quantity={item.quantity} />
                  </div>
                  <span className="flex-none font-bold text-[18px] text-ink">{usd(lineTotal)}</span>
                </div>
              );
            })}
          </div>

          {/* ── Footer per drawer spec: heavy rule, TOTAL, notes, ink CHECKOUT ── */}
          <div className="border-t-[3px] border-ink pt-[18px]">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-[18px] uppercase tracking-[.02em] text-ink">Total</span>
              <span className="font-bold text-[21px] text-ink">{usd(subtotal)}</span>
            </div>
            <div className="mt-1.5 text-[16px] uppercase tracking-[.02em] text-meta">
              Free shipping over $50 · Crypto only — BTC · LN · USDC
            </div>
            <ButtonLink href="/checkout" variant="primary" size="lg" full className="mt-3.5">
              Checkout →
            </ButtonLink>
            <div className="mt-2.5 text-center text-[14px] text-meta">
              Ships worldwide · 30-day returns · 100% of profit funds the watchdesk
            </div>
          </div>

          <div className="mt-7">
            <Link href="/store" className="kicker text-meta hover:text-ink">
              ← Keep shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
