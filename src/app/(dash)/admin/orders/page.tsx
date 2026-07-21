import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV, ORDER_STATUSES } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { usd, num, byline } from "@/lib/format";
import { OrderControls } from "./_components/OrderControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders · Staff · BTCSCAM.COM",
  description: "Fulfil crypto store orders — advance status and attach tracking.",
};

const STATUS_TONE: Record<string, "paper" | "orange" | "green" | "black" | "red" | "outline"> = {
  pending_payment: "paper",
  paid: "orange",
  processing: "orange",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

const th = "text-left kicker text-ink-500 px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-line";

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePrivilege(PV.ORDER_MANAGE);
  const { status } = await searchParams;
  const active = status && (ORDER_STATUSES as readonly string[]).includes(status) ? status : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      include: { items: { select: { id: true, quantity: true } } },
      take: 200,
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = counts.reduce((n, c) => n + c._count, 0);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHeader
        kicker="Fulfilment"
        title="Store Orders"
        lede="Track crypto-settled orders from payment to delivery. Status changes append to each order's timeline."
      />

      <div className="flex flex-wrap gap-2 mb-6 -mt-2">
        <FilterTab label={`All (${total})`} href="/admin/orders" activeState={!active} />
        {ORDER_STATUSES.map((s) => (
          <FilterTab
            key={s}
            label={`${s.replace(/_/g, " ")} (${countFor(s)})`}
            href={`/admin/orders?status=${s}`}
            activeState={active === s}
          />
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders here"
          hint={active ? `Nothing with status "${active.replace(/_/g, " ")}".` : "New store orders will land here."}
        />
      ) : (
        <div className="border border-line-strong bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-2">
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Items</th>
                <th className={th}>Total</th>
                <th className={th}>Pay</th>
                <th className={th}>Status</th>
                <th className={th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemCount = o.items.reduce((n, it) => n + it.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-paper-2/60">
                    <td className={td}>
                      <div className="mono font-bold text-ink">{o.orderNumber}</div>
                      <div className="mono text-[10px] text-ink-400 mt-1">{byline(o.createdAt)}</div>
                      {o.trackingNumber && (
                        <div className="mono text-[10px] text-btc-dark mt-1">
                          {o.trackingCarrier} · {o.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className={`${td} mono text-[11px] text-ink-600 break-all max-w-[180px]`}>
                      {o.email}
                    </td>
                    <td className={`${td} font-display text-lg text-ink whitespace-nowrap`}>
                      {num(itemCount)}
                    </td>
                    <td className={`${td} font-display text-lg text-ink whitespace-nowrap`}>
                      {usd(o.totalUsd)}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      {o.cryptoMethod ? (
                        <Tag tone="paper">{o.cryptoMethod}</Tag>
                      ) : (
                        <span className="mono text-[11px] text-ink-400">—</span>
                      )}
                    </td>
                    <td className={td}>
                      <Tag tone={STATUS_TONE[o.status] ?? "paper"}>{o.status.replace(/_/g, " ")}</Tag>
                    </td>
                    <td className={td}>
                      <OrderControls
                        orderId={o.id}
                        status={o.status}
                        trackingCarrier={o.trackingCarrier ?? ""}
                        trackingNumber={o.trackingNumber ?? ""}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  label,
  href,
  activeState,
}: {
  label: string;
  href: string;
  activeState: boolean;
}) {
  return (
    <Link
      href={href}
      className={`kicker px-3 py-1.5 border capitalize ${
        activeState
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink-600 border-line-strong hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );
}
