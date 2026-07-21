"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/actions/store";

export function AddToCart({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const clamp = (n: number) => Math.max(1, Math.min(99, n));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {/* v4 ghost stepper: square − / + */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => {
              setQty((q) => clamp(q - 1));
              setAdded(false);
            }}
            className="h-[42px] w-[42px] cursor-pointer border border-ink bg-transparent font-bold text-[16px] text-ink hover:bg-surface-alt"
          >
            −
          </button>
          <label className="sr-only" htmlFor="qty">
            Quantity
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) => {
              setQty(clamp(Number(e.target.value) || 1));
              setAdded(false);
            }}
            className="h-[42px] w-14 border border-ink bg-paper text-center font-bold text-[16px] text-ink focus:outline-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => {
              setQty((q) => clamp(q + 1));
              setAdded(false);
            }}
            className="h-[42px] w-[42px] cursor-pointer border border-ink bg-transparent font-bold text-[16px] text-ink hover:bg-surface-alt"
          >
            +
          </button>
        </div>

        {/* ink ADD button (v4) */}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              const r = await addToCart(productId, qty);
              if (r.ok) setAdded(true);
              else setErr(r.error ?? "Could not add to cart.");
            })
          }
          className="kicker inline-flex cursor-pointer items-center justify-center border border-ink bg-ink px-6 py-[13px] text-paper hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      </div>

      {added && (
        <div className="mt-4 inline-flex flex-wrap items-center gap-3 border border-safe px-[18px] py-3.5">
          <span className="kicker text-safe">✓ Added to cart</span>
          <Link href="/cart" className="kicker text-accent hover:underline underline-offset-4">
            Go to cart →
          </Link>
        </div>
      )}
      {err && <p className="mt-3 text-[14px] font-bold text-danger">{err}</p>}
    </div>
  );
}
