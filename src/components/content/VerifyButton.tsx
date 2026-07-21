"use client";

import { useState, useTransition } from "react";
import { verifyScam } from "@/actions/engagement";
import { num } from "@/lib/format";

export function VerifyButton({
  scamId,
  initialCount,
  initialVerified = false,
}: {
  scamId: string;
  initialCount: number;
  initialVerified?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [verified, setVerified] = useState(initialVerified);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await verifyScam(scamId);
            if (r.ok) {
              setVerified(true);
              setCount((c) => c + 1);
            } else setErr(r.error ?? "Error");
          })
        }
        disabled={pending || verified}
        className={`kicker inline-flex items-center gap-2 px-3 py-2 border ${
          verified
            ? "border-up text-up bg-up/5"
            : "border-ink text-ink hover:bg-ink hover:text-paper"
        } disabled:opacity-60`}
      >
        {verified ? "✓ Verified" : "+ Verify"}
        <span className="mono">{num(count)}</span>
      </button>
      {err && <span className="mono text-[11px] text-alert">{err}</span>}
    </div>
  );
}
