"use client";

import { useState, useTransition } from "react";
import { setOrderStatus, addTracking, type Result } from "@/actions/admin-ops";
import { ORDER_STATUSES } from "@/lib/constants";

const sel =
  "mt-1 w-full border border-ink bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const inp =
  "border border-ink bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const cap = "mono text-[10px] uppercase tracking-wide text-faint";
const btn = "kicker px-2 py-1.5 border transition-colors disabled:opacity-50";

export function OrderControls({
  orderId,
  status,
  trackingCarrier,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  trackingCarrier: string;
  trackingNumber: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [note, setNote] = useState("");
  const [carrier, setCarrier] = useState(trackingCarrier);
  const [number, setNumber] = useState(trackingNumber);

  const run = (fn: () => Promise<Result>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg({ ok: r.ok, text: r.ok ? "Saved" : r.error ?? "Error" });
    });

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <label className="block">
        <span className={cap}>Status</span>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => run(() => setOrderStatus(orderId, e.target.value, note))}
          className={sel}
          aria-label="Order status"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={cap}>Note (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={pending}
          placeholder="Timeline note…"
          aria-label="Timeline note"
          className={`${inp} w-full mt-1`}
        />
      </label>

      <div>
        <span className={cap}>Tracking</span>
        <div className="flex flex-wrap gap-1 mt-1">
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            disabled={pending}
            placeholder="Carrier"
            aria-label="Tracking carrier"
            className={`${inp} w-24`}
          />
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            disabled={pending}
            placeholder="Number"
            aria-label="Tracking number"
            className={`${inp} w-28`}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => addTracking(orderId, carrier, number))}
            className={`${btn} bg-ink text-paper border-ink hover:bg-action-hover`}
          >
            Save
          </button>
        </div>
      </div>

      {msg && (
        <span className={`mono text-[10px] ${msg.ok ? "text-safe" : "text-danger"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
