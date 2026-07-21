import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, EmptyState, ButtonLink, MediaPlaceholder } from "@/components/ui";
import { usd, toStrArray } from "@/lib/format";
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
      <Container className="py-10">
        <PageHeader kicker="The Store" title="Your Cart" />
        <EmptyState
          title="Sign in to start a cart"
          hint="Your cart is tied to your account so it follows you across devices. Log in or create a free account to shop."
          action={
            <div className="flex gap-3">
              <ButtonLink href="/login?next=/cart" variant="primary" size="md">
                Log in
              </ButtonLink>
              <ButtonLink href="/store" variant="outline" size="md">
                Browse store
              </ButtonLink>
            </div>
          }
        />
      </Container>
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
    <Container className="py-10">
      <PageHeader
        kicker="The Store"
        title="Your Cart"
        lede={
          items.length > 0
            ? `${totalUnits} item${totalUnits === 1 ? "" : "s"} funding the community watch.`
            : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          hint="Nothing in here yet. Grab a tee, a pin or the print annual — every order bankrolls an investigation."
          action={
            <ButtonLink href="/store" variant="primary" size="md">
              Browse the store
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Line items */}
          <div className="border-t border-line">
            {items.map((item) => {
              const cover = toStrArray(item.product.imageLabels)[0] || `[ ${item.product.category} ]`;
              const lineTotal = item.product.priceUsd * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 border-b border-line py-5 sm:flex-row sm:items-center"
                >
                  <div className="w-full sm:w-28 shrink-0">
                    <MediaPlaceholder label={cover} ratio="4/3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold leading-tight text-ink">{item.product.name}</h3>
                    <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1 capitalize">
                      {item.product.category} · {usd(item.product.priceUsd)} each
                    </div>
                    <div className="mt-2 font-display text-xl text-ink">{usd(lineTotal)}</div>
                  </div>
                  <CartControls itemId={item.id} quantity={item.quantity} />
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="lg:border-l lg:border-line lg:pl-8">
            <div className="border border-ink bg-paper-2 p-6">
              <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
                Order Summary
              </h2>
              <div className="flex items-center justify-between text-sm text-ink-600">
                <span>Subtotal</span>
                <span className="font-mono text-ink">{usd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink-600 mt-2">
                <span>Shipping</span>
                <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
                  Calculated at fulfillment
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="kicker text-ink">Total due</span>
                <span className="font-display text-3xl text-btc-dark">{usd(subtotal)}</span>
              </div>
              <div className="mt-6">
                <ButtonLink href="/checkout" variant="primary" size="lg" full>
                  Proceed to checkout
                </ButtonLink>
              </div>
              <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3 text-center">
                Crypto only · No cards
              </p>
            </div>
            <div className="mt-4">
              <ButtonLink href="/store" variant="ghost" size="sm">
                ← Keep shopping
              </ButtonLink>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
