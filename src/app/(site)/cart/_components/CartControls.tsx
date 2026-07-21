"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/actions/store";

// v4 drawer stepper: 30px square ghost − / +, 700 16px qty, red REMOVE text button.
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
    <div className="mt-2 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={pending}
        onClick={() => commit(qty - 1)}
        className="h-[30px] w-[30px] cursor-pointer border border-ink bg-transparent font-bold text-[14px] text-ink hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>
      <span className="min-w-[22px] text-center font-bold text-[16px] text-ink">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={pending}
        onClick={() => commit(qty + 1)}
        className="h-[30px] w-[30px] cursor-pointer border border-ink bg-transparent font-bold text-[14px] text-ink hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="ml-1.5 cursor-pointer font-bold text-[14px] uppercase tracking-[.02em] text-danger hover:text-[#A02320] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Remove
      </button>
      {err && <span className="text-[14px] font-bold text-danger">{err}</span>}
    </div>
  );
}
