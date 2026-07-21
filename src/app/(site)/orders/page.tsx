import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { PageHeader, EmptyState, ButtonLink, Tag } from "@/components/ui";
import { usd, byline } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Orders — BTCSCAM.COM",
  description: "Track your store orders and crypto payments.",
};

const STATUS_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline"> = {
  pending_payment: "warn",
  paid: "green",
  processing: "black",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

export default async function OrdersPage() {
  const user = await requireUser("/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10 fade-up">
      <PageHeader
        kicker="My desk"
        title="Your orders"
        lede="Every order and its crypto payment status, newest first."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          hint="When you buy from the store, your orders and payment tracking show up here."
          action={
            <ButtonLink href="/store" variant="primary" size="md">
              Visit the store
            </ButtonLink>
          }
        />
      ) : (
        <div>
          {orders.map((order) => {
            const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}`}
                className="group flex flex-wrap items-center justify-between gap-3 border-b border-rule px-1 py-4 hover:bg-surface-dim hover:no-underline"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="mono font-bold text-[18px] text-ink group-hover:underline underline-offset-4">
                      {order.orderNumber}
                    </span>
                    <Tag tone={STATUS_TONE[order.status] ?? "outline"}>
                      {order.status.replace(/_/g, " ")}
                    </Tag>
                  </div>
                  <div className="mt-1.5 text-[14px] uppercase tracking-[.02em] text-meta">
                    {byline(order.createdAt)} · {units} item{units === 1 ? "" : "s"}
                    {order.cryptoMethod ? ` · ${order.cryptoMethod}` : ""}
                  </div>
                </div>
                <div className="flex flex-none items-center gap-4">
                  <span className="font-bold text-[18px] text-ink">{usd(order.totalUsd)}</span>
                  <span className="kicker text-accent group-hover:text-ink">View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
