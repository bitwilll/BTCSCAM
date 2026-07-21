"use client";

import { useState, useTransition } from "react";
import { toggleProduct, setStock, type Result } from "@/actions/admin-ops";

const btn = "kicker px-2 py-1.5 border transition-colors disabled:opacity-50";
const cap = "mono text-[10px] uppercase tracking-wide text-ink-400";

export function ProductControls({
  productId,
  isActive,
  stock,
}: {
  productId: string;
  isActive: boolean;
  stock: number;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [stockValue, setStockValue] = useState(String(stock));

  const run = (fn: () => Promise<Result>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg({ ok: r.ok, text: r.ok ? "Saved" : r.error ?? "Error" });
    });

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => toggleProduct(productId))}
        className={`${btn} ${
          isActive
            ? "bg-up text-black border-up"
            : "bg-paper text-ink-600 border-line-strong hover:border-ink"
        }`}
      >
        {isActive ? "● Active" : "○ Inactive"}
      </button>

      <div>
        <span className={cap}>Stock</span>
        <div className="flex gap-1 mt-1">
          <input
            type="number"
            min={0}
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value)}
            disabled={pending}
            aria-label="Stock quantity"
            className="w-20 border border-line-strong bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setStock(productId, Number(stockValue)))}
            className={`${btn} bg-ink text-paper border-ink hover:bg-ink-800`}
          >
            Save
          </button>
        </div>
      </div>

      {msg && (
        <span className={`mono text-[10px] ${msg.ok ? "text-up" : "text-alert-strong"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
