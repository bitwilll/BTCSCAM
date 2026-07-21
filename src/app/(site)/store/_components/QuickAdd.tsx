"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/actions/store";

export function QuickAdd({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      {added ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="kicker text-safe">✓ In cart</span>
          <Link href="/cart" className="kicker text-accent hover:underline underline-offset-4">
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
          className="kicker inline-flex w-full cursor-pointer items-center justify-center border border-ink bg-ink px-[18px] py-[11px] text-paper hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      )}
      {err && <p className="mt-1.5 text-[14px] font-bold text-danger">{err}</p>}
    </div>
  );
}
