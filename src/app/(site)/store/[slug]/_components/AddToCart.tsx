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
        <div className="flex items-center border border-ink">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => {
              setQty((q) => clamp(q - 1));
              setAdded(false);
            }}
            className="kicker px-3 py-2.5 text-ink hover:bg-ink hover:text-paper transition-colors"
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
            className="w-14 border-x border-ink bg-paper-2 py-2.5 text-center font-mono text-sm text-ink focus:outline-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => {
              setQty((q) => clamp(q + 1));
              setAdded(false);
            }}
            className="kicker px-3 py-2.5 text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            +
          </button>
        </div>

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
          className="kicker inline-flex items-center justify-center gap-2 bg-btc px-6 py-3.5 text-sm text-black transition-colors hover:bg-btc-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      </div>

      {added && (
        <div className="mt-4 flex items-center gap-3 border border-line bg-paper-2 px-4 py-3">
          <span className="kicker text-up">✓ Added to cart</span>
          <Link href="/cart" className="kicker text-btc-dark hover:text-ink">
            Go to cart →
          </Link>
        </div>
      )}
      {err && <p className="mono text-[12px] text-alert-strong mt-3">{err}</p>}
    </div>
  );
}
