import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageHeader, Tag, SectionHeader } from "@/components/ui";
import { usd, byline, dateline } from "@/lib/format";
import { TrackForm } from "./_components/TrackForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track An Order — BTCSCAM.COM",
  description: "Look up any store order's status with your order number and email.",
};

type TimelineEntry = { status: string; at: string; note: string };

const STATUS_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline"> = {
  pending_payment: "warn",
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
    <div className="mx-auto max-w-[900px] px-6 py-10 fade-up">
      <PageHeader
        kicker="Order tracking"
        title="Track an order"
        lede="No account needed — enter the order number from your confirmation and the email you used at checkout."
      />

      <div className="grid gap-10 md:grid-cols-[320px_1fr]">
        <div>
          <TrackForm defaultOrder={orderNumber} defaultEmail={emailParam ?? ""} />
        </div>

        <div>
          {!lookedUp ? (
            <div className="border border-rule bg-surface-dim p-8 text-center">
              <p className="text-[16px] text-meta">
                Enter your order number and email to see live status.
              </p>
            </div>
          ) : !order ? (
            <div className="border border-danger p-6">
              <p className="font-display text-[24px] text-ink">No match found</p>
              <p className="mt-2 text-[16px] leading-[1.55] text-body-2">
                We couldn&apos;t find an order with number{" "}
                <span className="mono font-bold text-ink">{orderNumber}</span> and that email.
                Double-check both and try again.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-ink pb-4">
                <span className="mono font-bold text-[24px] text-ink">{order.orderNumber}</span>
                <Tag tone={STATUS_TONE[order.status] ?? "outline"}>
                  {order.status.replace(/_/g, " ")}
                </Tag>
              </div>
              <p className="mb-2 text-[14px] uppercase tracking-[.02em] text-meta">
                Placed {byline(order.createdAt)} ·{" "}
                <span className="font-bold text-ink">{usd(order.totalUsd)}</span>
              </p>
              <p className="mb-6 text-[16px] leading-[1.5] text-body-2">
                {STATUS_HINT[order.status] ?? ""}
              </p>

              {order.status === "shipped" && order.trackingNumber && (
                <div className="mb-6 border border-ink p-4">
                  <div className="eyebrow mb-1">Tracking number</div>
                  <div className="mono font-bold text-[21px] text-ink">{order.trackingNumber}</div>
                  {order.trackingCarrier && (
                    <div className="mt-1 text-[14px] uppercase tracking-[.02em] text-meta">
                      {order.trackingCarrier}
                    </div>
                  )}
                </div>
              )}

              <SectionHeader title="Status timeline" />
              {timeline.length === 0 ? (
                <p className="text-[16px] text-meta">No status updates yet.</p>
              ) : (
                <div className="grid gap-2">
                  {timeline.map((e, i) => (
                    <div
                      key={i}
                      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border p-3.5 ${
                        i === 0 ? "border-ink bg-surface-dim" : "border-rule"
                      }`}
                    >
                      <Tag tone={STATUS_TONE[e.status] ?? "outline"}>
                        {e.status.replace(/_/g, " ")}
                      </Tag>
                      {e.at && (
                        <span className="text-[14px] uppercase tracking-[.02em] text-meta">
                          {dateline(e.at)}
                        </span>
                      )}
                      {e.note && (
                        <span className="w-full break-words text-[16px] leading-[1.5] text-body-2 sm:w-auto sm:flex-1">
                          {e.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
