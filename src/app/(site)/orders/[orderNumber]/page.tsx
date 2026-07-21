import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, Tag, ButtonLink, Kicker } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { CopyButton } from "@/components/crypto/CopyButton";
import { usd, byline, dateline } from "@/lib/format";
import { TxHashForm } from "./_components/TxHashForm";

export const dynamic = "force-dynamic";

type TimelineEntry = { status: string; at: string; note: string };
type Shipping = { name?: string; address?: string; city?: string; country?: string; zip?: string };

const STATUS_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline"> = {
  pending_payment: "orange",
  paid: "green",
  processing: "black",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

const STATUS_HINT: Record<string, string> = {
  pending_payment: "Waiting for your crypto payment.",
  paid: "Payment confirmed on-chain. Preparing your order.",
  processing: "Your order is being packed.",
  shipped: "On its way — track it with the number below.",
  delivered: "Delivered. Thanks for funding the watch.",
  cancelled: "This order was cancelled.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} — BTCSCAM.COM`,
    description: "Order status and crypto payment tracking.",
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const [order, user] = await Promise.all([
    prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }),
    getSession(),
  ]);

  if (!order) notFound();

  const isOwner = Boolean(user && order.userId && order.userId === user.id);
  const timeline = (Array.isArray(order.timeline) ? order.timeline : []) as TimelineEntry[];
  const orderedTimeline = [...timeline].reverse();

  // ── Non-owner: minimal read-only status view ──
  if (!isOwner) {
    return (
      <Container className="py-10 max-w-2xl">
        <PageHeader kicker="Order" title={order.orderNumber} />
        <div className="flex items-center gap-3 mb-6">
          <Tag tone={STATUS_TONE[order.status] ?? "outline"}>{order.status.replace(/_/g, " ")}</Tag>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
            {STATUS_HINT[order.status] ?? ""}
          </span>
        </div>

        <Timeline entries={orderedTimeline} />

        <div className="mt-8 border border-dashed border-line-strong bg-paper-2 p-6">
          <p className="text-sm text-ink-600 leading-snug">
            You&apos;re viewing a limited status page. Log in as the account that placed this order to
            see items, shipping and payment details — or look it up with your email on the tracking
            page.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href={`/login?next=/orders/${order.orderNumber}`} variant="primary" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href={`/track?order=${order.orderNumber}`} variant="outline" size="sm">
              Track by email
            </ButtonLink>
          </div>
        </div>
      </Container>
    );
  }

  // ── Owner: full order view ──
  const shipping = (order.shipping ?? {}) as unknown as Shipping;
  const isPending = order.status === "pending_payment";

  return (
    <Container className="py-10">
      <nav className="mb-6 mono text-[11px] uppercase tracking-wide text-ink-500">
        <Link href="/orders" className="hover:text-btc-dark">
          Your Orders
        </Link>{" "}
        <span className="text-ink-400">/</span> {order.orderNumber}
      </nav>

      <div className="border-b-2 border-ink pb-6 mb-8">
        <Kicker color="orange">Order</Kicker>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <h1 className="font-display text-5xl text-ink leading-none">{order.orderNumber}</h1>
          <Tag tone={STATUS_TONE[order.status] ?? "outline"}>{order.status.replace(/_/g, " ")}</Tag>
        </div>
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
          Placed {byline(order.createdAt)} · {STATUS_HINT[order.status] ?? ""}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Payment instructions */}
          {isPending && (
            <section>
              <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
                Complete Your Payment
              </h2>
              <p className="text-sm text-ink-600 leading-snug mb-4">
                Send exactly <strong className="text-ink">{usd(order.totalUsd)}</strong> worth of{" "}
                <strong className="text-ink">{order.cryptoMethod}</strong> to the address below.
                {order.cryptoNetwork ? ` Network: ${order.cryptoNetwork}.` : ""} Then record your
                transaction hash so we can confirm it.
              </p>

              {order.cryptoMethod ? (
                <CryptoPay methods={[order.cryptoMethod]} />
              ) : (
                <div className="border border-dashed border-line-strong p-6 mono text-sm text-ink-500">
                  No payment method on file for this order.
                </div>
              )}

              {order.cryptoAddress && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border border-line-strong bg-paper-2 p-3">
                  <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
                    Send-to address
                  </span>
                  <code className="font-mono text-xs break-all text-ink">{order.cryptoAddress}</code>
                  <CopyButton value={order.cryptoAddress} label="Copy" />
                </div>
              )}

              <div className="mt-4">
                <TxHashForm orderNumber={order.orderNumber} existingTxHash={order.txHash} />
              </div>
            </section>
          )}

          {/* Tracking */}
          {order.status === "shipped" && order.trackingNumber && (
            <section className="border border-ink bg-paper-2 p-5">
              <div className="eyebrow mb-1">Shipment Tracking</div>
              <div className="font-display text-2xl text-ink">{order.trackingNumber}</div>
              {order.trackingCarrier && (
                <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1">
                  Carrier: {order.trackingCarrier}
                </div>
              )}
            </section>
          )}

          {/* Items */}
          <section>
            <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">Items</h2>
            <ul className="border-t border-line">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-line py-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-ink leading-tight">{item.name}</div>
                    <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-0.5">
                      {usd(item.priceUsd)} × {item.quantity}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-ink whitespace-nowrap">
                    {usd(item.priceUsd * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-4">
              <span className="kicker text-ink">Total</span>
              <span className="font-display text-3xl text-btc-dark">{usd(order.totalUsd)}</span>
            </div>
          </section>

          {/* Status timeline */}
          <section>
            <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
              Status Timeline
            </h2>
            <Timeline entries={orderedTimeline} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:border-l lg:border-line lg:pl-8 space-y-6">
          <div className="border border-line bg-paper-2 p-5">
            <div className="eyebrow mb-2">Shipping To</div>
            <div className="text-sm text-ink leading-relaxed">
              {shipping.name && <div className="font-semibold">{shipping.name}</div>}
              {shipping.address && <div>{shipping.address}</div>}
              <div>
                {[shipping.city, shipping.zip].filter(Boolean).join(", ")}
              </div>
              {shipping.country && <div>{shipping.country}</div>}
            </div>
            <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3 break-all">
              {order.email}
            </div>
          </div>

          <div className="border border-line bg-paper-2 p-5">
            <div className="eyebrow mb-2">Payment</div>
            <div className="flex items-center justify-between text-sm text-ink-600">
              <span>Method</span>
              <span className="font-mono text-ink">{order.cryptoMethod ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-ink-600 mt-1.5">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{usd(order.subtotalUsd)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-ink-600 mt-1.5">
              <span>Total</span>
              <span className="font-mono text-ink">{usd(order.totalUsd)}</span>
            </div>
            {order.txHash && (
              <div className="mt-3 border-t border-line pt-3">
                <div className="mono text-[10px] uppercase tracking-wide text-ink-500 mb-1">
                  Transaction hash
                </div>
                <code className="font-mono text-[11px] break-all text-ink">{order.txHash}</code>
              </div>
            )}
          </div>

          <ButtonLink href="/orders" variant="ghost" size="sm">
            ← All orders
          </ButtonLink>
        </aside>
      </div>
    </Container>
  );
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="mono text-sm text-ink-500">No status updates yet.</p>;
  }
  return (
    <ol className="border-l-2 border-line-strong pl-5 space-y-5">
      {entries.map((e, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-[27px] top-1 h-3 w-3 border-2 ${
              i === 0 ? "bg-btc border-btc-dark" : "bg-paper border-line-strong"
            }`}
            aria-hidden
          />
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={STATUS_TONE[e.status] ?? "outline"}>{e.status.replace(/_/g, " ")}</Tag>
            {e.at && (
              <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
                {dateline(e.at)}
              </span>
            )}
          </div>
          {e.note && <p className="text-sm text-ink-600 mt-1.5 break-words">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}
