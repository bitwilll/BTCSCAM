import Link from "next/link";
import { Tag } from "@/components/ui";
import { compactUsd, timeAgo, usd } from "@/lib/format";

type Tone = "black" | "orange" | "red" | "green" | "outline" | "paper";

const ORDER_STATUS_TONE: Record<string, Tone> = {
  paid: "green",
  processing: "orange",
};

const CONSULT_STATUS_TONE: Record<string, Tone> = {
  new: "orange",
  scheduled: "paper",
  in_progress: "outline",
};

const URGENCY_TONE: Record<string, Tone> = {
  low: "outline",
  normal: "paper",
  high: "orange",
  critical: "red",
};

export type OrderQueueItem = {
  id: string;
  orderNumber: string;
  email: string;
  totalUsd: number;
  status: string;
  itemCount: number;
  createdAt: Date | string;
};

/** A row in the "Orders to fulfill" queue — links to the admin orders workspace. */
export function OrderRow({ order }: { order: OrderQueueItem }) {
  return (
    <Link
      href="/admin/orders"
      className="flex items-center gap-4 py-3 border-b border-line last:border-0 group"
    >
      <span className="w-24 shrink-0">
        <Tag tone={ORDER_STATUS_TONE[order.status] ?? "outline"}>{order.status}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-btc-dark">
          {order.orderNumber}
          <span className="font-normal text-ink-500"> · {order.email}</span>
        </div>
        <div className="mono text-[11px] text-ink-500 uppercase tracking-wide truncate">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {timeAgo(order.createdAt)}
        </div>
      </div>
      <span className="mono text-[11px] text-ink font-semibold shrink-0">{usd(order.totalUsd)}</span>
    </Link>
  );
}

export type ConsultQueueItem = {
  id: string;
  name: string;
  topic: string;
  urgency: string;
  status: string;
  amountUsd: number | null;
  createdAt: Date | string;
};

/** A row in the "Consultations" queue — links to the per-request admin detail page. */
export function ConsultationRow({ consult }: { consult: ConsultQueueItem }) {
  return (
    <Link
      href={`/admin/consultations/${consult.id}`}
      className="flex items-center gap-4 py-3 border-b border-line last:border-0 group"
    >
      <span className="w-20 shrink-0">
        <Tag tone={URGENCY_TONE[consult.urgency] ?? "paper"}>{consult.urgency}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-btc-dark">{consult.name}</div>
        <div className="mono text-[11px] text-ink-500 uppercase tracking-wide truncate capitalize">
          {consult.topic.replace(/-/g, " ")}
          {` · ${consult.status.replace(/_/g, " ")}`}
          {consult.amountUsd ? ` · ${compactUsd(consult.amountUsd)} at risk` : ""}
          {` · ${timeAgo(consult.createdAt)}`}
        </div>
      </div>
      <span className="mono text-[11px] text-ink-400 group-hover:text-btc-dark shrink-0">→</span>
    </Link>
  );
}
