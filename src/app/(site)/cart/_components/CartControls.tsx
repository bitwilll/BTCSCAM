"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/actions/store";

export function CartControls({ itemId, quantity }: { itemId: string; quantity: number }) {
  const router = useRouter();
  const [qty, setQty] = useState(quantity);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const commit = (next: number) => {
    const clamped = Math.max(0, Math.min(99, next));
    setQty(clamped);
    start(async () => {
      setErr(null);
      const r = await updateCartItem(itemId, clamped);
      if (!r.ok) {
        setErr(r.error ?? "Could not update.");
        setQty(quantity);
        return;
      }
      router.refresh();
    });
  };

  const remove = () =>
    start(async () => {
      setErr(null);
      const r = await removeCartItem(itemId);
      if (!r.ok) {
        setErr(r.error ?? "Could not remove.");
        return;
      }
      router.refresh();
    });

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex items-center border border-line-strong">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={pending}
          onClick={() => commit(qty - 1)}
          className="kicker px-2.5 py-1.5 text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          −
        </button>
        <span className="w-10 border-x border-line-strong py-1.5 text-center font-mono text-sm text-ink">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={pending}
          onClick={() => commit(qty + 1)}
          className="kicker px-2.5 py-1.5 text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="kicker text-ink-500 hover:text-alert-strong transition-colors disabled:opacity-50"
      >
        Remove
      </button>
      {err && <p className="mono text-[11px] text-alert-strong">{err}</p>}
    </div>
  );
}
