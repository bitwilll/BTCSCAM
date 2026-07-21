import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Container, PageHeader, EmptyState, ButtonLink, Tag } from "@/components/ui";
import { usd, byline } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Orders — BTCSCAM.COM",
  description: "Track your store orders and crypto payments.",
};

const STATUS_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline"> = {
  pending_payment: "orange",
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
    <Container className="py-10">
      <PageHeader
        kicker="My Desk"
        title="Your Orders"
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
        <div className="border-t border-line">
          {orders.map((order) => {
            const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}`}
                className="group flex flex-col gap-3 border-b border-line py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl text-ink group-hover:text-btc-dark">
                      {order.orderNumber}
                    </span>
                    <Tag tone={STATUS_TONE[order.status] ?? "outline"}>
                      {order.status.replace(/_/g, " ")}
                    </Tag>
                  </div>
                  <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1.5">
                    {byline(order.createdAt)} · {units} item{units === 1 ? "" : "s"}
                    {order.cryptoMethod ? ` · ${order.cryptoMethod}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-display text-2xl text-ink">{usd(order.totalUsd)}</span>
                  <span className="kicker text-btc-dark group-hover:text-ink">View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
