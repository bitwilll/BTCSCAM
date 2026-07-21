import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, Tag } from "@/components/ui";
import { usd, byline, dateline } from "@/lib/format";
import { TrackForm } from "./_components/TrackForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track An Order — BTCSCAM.COM",
  description: "Look up any store order's status with your order number and email.",
};

type TimelineEntry = { status: string; at: string; note: string };

const STATUS_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline"> = {
  pending_payment: "orange",
  paid: "green",
  processing: "black",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

const STATUS_HINT: Record<string, string> = {
  pending_payment: "Waiting for crypto payment.",
  paid: "Payment confirmed on-chain. Preparing the order.",
  processing: "Order is being packed.",
  shipped: "On its way.",
  delivered: "Delivered.",
  cancelled: "This order was cancelled.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order: orderParam, email: emailParam } = await searchParams;
  const orderNumber = orderParam?.trim() || "";
  const email = emailParam?.trim().toLowerCase() || "";
  const lookedUp = Boolean(orderNumber && email);

  const order = lookedUp
    ? await prisma.order.findFirst({
        where: { orderNumber, email },
        include: { items: true },
      })
    : null;

  const timeline = order
    ? [...((Array.isArray(order.timeline) ? order.timeline : []) as TimelineEntry[])].reverse()
    : [];

  return (
    <Container className="py-10 max-w-3xl">
      <PageHeader
        kicker="Order Tracking"
        title="Track An Order"
        lede="No account needed — enter the order number from your confirmation and the email you used at checkout."
      />

      <div className="grid gap-10 md:grid-cols-[320px_1fr]">
        <div>
          <TrackForm defaultOrder={orderNumber} defaultEmail={emailParam ?? ""} />
        </div>

        <div>
          {!lookedUp ? (
            <div className="border border-dashed border-line-strong bg-paper-2 p-8 text-center">
              <p className="mono text-sm text-ink-500">
                Enter your order number and email to see live status.
              </p>
            </div>
          ) : !order ? (
            <div className="border border-dashed border-alert-strong bg-paper-2 p-8">
              <p className="font-display text-2xl text-ink-700">No match found</p>
              <p className="mono text-sm text-ink-500 mt-2">
                We couldn&apos;t find an order with number{" "}
                <span className="text-ink">{orderNumber}</span> and that email. Double-check both and
                try again.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4 mb-5">
                <span className="font-display text-3xl text-ink">{order.orderNumber}</span>
                <Tag tone={STATUS_TONE[order.status] ?? "outline"}>
                  {order.status.replace(/_/g, " ")}
                </Tag>
              </div>
              <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-2">
                Placed {byline(order.createdAt)} · {usd(order.totalUsd)}
              </p>
              <p className="text-sm text-ink-600 mb-6">{STATUS_HINT[order.status] ?? ""}</p>

              {order.status === "shipped" && order.trackingNumber && (
                <div className="border border-ink bg-paper-2 p-4 mb-6">
                  <div className="eyebrow mb-1">Tracking Number</div>
                  <div className="font-display text-xl text-ink">{order.trackingNumber}</div>
                  {order.trackingCarrier && (
                    <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1">
                      {order.trackingCarrier}
                    </div>
                  )}
                </div>
              )}

              <h2 className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4">
                Status Timeline
              </h2>
              {timeline.length === 0 ? (
                <p className="mono text-sm text-ink-500">No status updates yet.</p>
              ) : (
                <ol className="border-l-2 border-line-strong pl-5 space-y-5">
                  {timeline.map((e, i) => (
                    <li key={i} className="relative">
                      <span
                        className={`absolute -left-[27px] top-1 h-3 w-3 border-2 ${
                          i === 0 ? "bg-btc border-btc-dark" : "bg-paper border-line-strong"
                        }`}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag tone={STATUS_TONE[e.status] ?? "outline"}>
                          {e.status.replace(/_/g, " ")}
                        </Tag>
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
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
