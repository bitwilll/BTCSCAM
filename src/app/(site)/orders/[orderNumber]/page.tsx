import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Tag, ButtonLink, Kicker, SectionHeader } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { CopyButton } from "@/components/crypto/CopyButton";
import { usd, byline, dateline } from "@/lib/format";
import { TxHashForm } from "./_components/TxHashForm";

export const dynamic = "force-dynamic";

type TimelineEntry = { status: string; at: string; note: string };
type Shipping = { name?: string; address?: string; city?: string; country?: string; zip?: string };

const STATUS_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline"> = {
  pending_payment: "warn",
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
      <div className="mx-auto max-w-[720px] px-6 py-10 fade-up">
        <header className="mb-8 border-b border-ink pb-6">
          <Kicker color="muted">Order</Kicker>
          <h1
            className="mono mt-2 font-bold text-ink"
            style={{ fontSize: "clamp(28px,4vw,40px)", lineHeight: 1.05 }}
          >
            {order.orderNumber}
          </h1>
        </header>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Tag tone={STATUS_TONE[order.status] ?? "outline"}>{order.status.replace(/_/g, " ")}</Tag>
          <span className="text-[14px] uppercase tracking-[.02em] text-meta">
            {STATUS_HINT[order.status] ?? ""}
          </span>
        </div>

        <Timeline entries={orderedTimeline} />

        <div className="mt-8 border border-rule bg-surface-dim p-6">
          <p className="text-[16px] leading-[1.55] text-body-2">
            You&apos;re viewing a limited status page. Log in as the account that placed this order to
            see items, shipping and payment details — or look it up with your email on the tracking
            page.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href={`/login?next=/orders/${order.orderNumber}`} variant="primary" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href={`/track?order=${order.orderNumber}`} variant="ghost" size="sm">
              Track by email
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  // ── Owner: full order view ──
  const shipping = (order.shipping ?? {}) as unknown as Shipping;
  const isPending = order.status === "pending_payment";

  return (
    <div className="mx-auto max-w-[1140px] px-6 py-10 fade-up">
      <nav className="mb-6 kicker text-meta">
        <Link href="/orders" className="hover:text-ink">
          Your orders
        </Link>{" "}
        <span className="text-faint">/</span> <span className="mono">{order.orderNumber}</span>
      </nav>

      <header className="mb-8 border-b border-ink pb-6">
        <Kicker color="muted">Order</Kicker>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1
            className="mono font-bold text-ink"
            style={{ fontSize: "clamp(28px,4vw,40px)", lineHeight: 1.05 }}
          >
            {order.orderNumber}
          </h1>
          <Tag tone={STATUS_TONE[order.status] ?? "outline"}>{order.status.replace(/_/g, " ")}</Tag>
        </div>
        <p className="mt-3 text-[14px] uppercase tracking-[.02em] text-meta">
          Placed {byline(order.createdAt)} · {STATUS_HINT[order.status] ?? ""}
        </p>
        {isPending && (
          <div className="mt-4 inline-flex items-center gap-2 border border-safe px-[18px] py-3.5 font-bold text-[16px] uppercase tracking-[.02em] text-safe">
            ✓ Order placed — confirmation in your desk
          </div>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* ── Payment instructions ── */}
          {isPending && (
            <section>
              <SectionHeader title="Complete your payment" />
              <p className="mb-4 text-[16px] leading-[1.55] text-body-2">
                Send exactly <strong className="text-ink">{usd(order.totalUsd)}</strong> worth of{" "}
                <strong className="text-ink">{order.cryptoMethod}</strong> to the address below.
                {order.cryptoNetwork ? ` Network: ${order.cryptoNetwork}.` : ""} Then record your
                transaction hash so we can confirm it.
              </p>

              {order.cryptoMethod ? (
                <CryptoPay methods={[order.cryptoMethod]} />
              ) : (
                <div className="border border-rule bg-surface-dim p-6 text-[16px] text-meta">
                  No payment method on file for this order.
                </div>
              )}

              {order.cryptoAddress && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border border-ink bg-surface-dim p-3.5">
                  <span className="text-[14px] uppercase tracking-[.02em] text-meta">
                    Send-to address
                  </span>
                  <code className="mono break-all text-[13px] text-ink">{order.cryptoAddress}</code>
                  <CopyButton value={order.cryptoAddress} label="Copy" />
                </div>
              )}

              <div className="mt-4">
                <TxHashForm orderNumber={order.orderNumber} existingTxHash={order.txHash} />
              </div>
            </section>
          )}

          {/* ── Tracking ── */}
          {order.status === "shipped" && order.trackingNumber && (
            <section className="border border-ink p-5">
              <div className="eyebrow mb-1">Shipment tracking</div>
              <div className="mono font-bold text-[24px] text-ink">{order.trackingNumber}</div>
              {order.trackingCarrier && (
                <div className="mt-1 text-[14px] uppercase tracking-[.02em] text-meta">
                  Carrier: {order.trackingCarrier}
                </div>
              )}
            </section>
          )}

          {/* ── Items ── */}
          <section>
            <SectionHeader title="Items" />
            <ul>
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-rule py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[16px] leading-tight text-ink">{item.name}</div>
                    <div className="mt-0.5 text-[14px] uppercase tracking-[.02em] text-meta">
                      {usd(item.priceUsd)} × {item.quantity}
                    </div>
                  </div>
                  <span className="whitespace-nowrap font-bold text-[16px] text-ink">
                    {usd(item.priceUsd * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t-[3px] border-ink pt-3.5">
              <span className="font-bold text-[18px] uppercase tracking-[.02em] text-ink">Total</span>
              <span className="font-bold text-[21px] text-ink">{usd(order.totalUsd)}</span>
            </div>
          </section>

          {/* ── Status timeline ── */}
          <section>
            <SectionHeader title="Status timeline" />
            <Timeline entries={orderedTimeline} />
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">
          <div className="border border-rule bg-surface-dim p-5">
            <div className="eyebrow mb-2">Shipping to</div>
            <div className="text-[16px] leading-[1.55] text-ink">
              {shipping.name && <div className="font-bold">{shipping.name}</div>}
              {shipping.address && <div>{shipping.address}</div>}
              <div>{[shipping.city, shipping.zip].filter(Boolean).join(", ")}</div>
              {shipping.country && <div>{shipping.country}</div>}
            </div>
            <div className="mt-3 break-all text-[14px] uppercase tracking-[.02em] text-meta">
              {order.email}
            </div>
          </div>

          <div className="border border-rule bg-surface-dim p-5">
            <div className="eyebrow mb-2">Payment</div>
            <div className="flex items-center justify-between text-[16px] text-body-2">
              <span>Method</span>
              <span className="font-bold text-ink">{order.cryptoMethod ?? "—"}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[16px] text-body-2">
              <span>Subtotal</span>
              <span className="font-bold text-ink">{usd(order.subtotalUsd)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[16px] text-body-2">
              <span>Total</span>
              <span className="font-bold text-ink">{usd(order.totalUsd)}</span>
            </div>
            {order.txHash && (
              <div className="mt-3 border-t border-rule pt-3">
                <div className="eyebrow mb-1">Transaction hash</div>
                <code className="mono break-all text-[12px] text-ink">{order.txHash}</code>
              </div>
            )}
          </div>

          <Link href="/orders" className="kicker inline-block text-meta hover:text-ink">
            ← All orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

// v4: bordered status rows with Tags (current row ink-ruled on dim surface)
function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-[16px] text-meta">No status updates yet.</p>;
  }
  return (
    <div className="grid gap-2">
      {entries.map((e, i) => (
        <div
          key={i}
          className={`flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border p-3.5 ${
            i === 0 ? "border-ink bg-surface-dim" : "border-rule"
          }`}
        >
          <Tag tone={STATUS_TONE[e.status] ?? "outline"}>{e.status.replace(/_/g, " ")}</Tag>
          {e.at && (
            <span className="text-[14px] uppercase tracking-[.02em] text-meta">{dateline(e.at)}</span>
          )}
          {e.note && (
            <span className="w-full break-words text-[16px] leading-[1.5] text-body-2 sm:w-auto sm:flex-1">
              {e.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
