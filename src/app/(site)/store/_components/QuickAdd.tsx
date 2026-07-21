"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/actions/store";

export function QuickAdd({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mt-3">
      {added ? (
        <div className="flex items-center justify-between gap-2">
          <span className="kicker text-up">✓ In cart</span>
          <Link href="/cart" className="kicker text-btc-dark hover:text-ink">
            View cart →
          </Link>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              const r = await addToCart(productId, 1);
              if (r.ok) setAdded(true);
              else setErr(r.error ?? "Could not add to cart.");
            })
          }
          className="kicker inline-flex w-full items-center justify-center gap-2 border border-ink bg-transparent px-3 py-1.5 text-[11px] text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      )}
      {err && <p className="mono text-[11px] text-alert-strong mt-1.5">{err}</p>}
    </div>
  );
}
