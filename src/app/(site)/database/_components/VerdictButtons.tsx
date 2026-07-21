"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { verifyScam } from "@/actions/engagement";
import { num } from "@/lib/format";

// v4 "COMMUNITY VERDICT": I CAN CONFIRM (green ghost w/ check, wired to verifyScam)
// + DISPUTE (muted ghost → /report?scam=).
export function VerdictButtons({
  scamId,
  slug,
  initialCount,
  initialVerified = false,
}: {
  scamId: string;
  slug: string;
  initialCount: number;
  initialVerified?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [verified, setVerified] = useState(initialVerified);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
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
          className={`inline-flex items-center px-3 py-[7px] font-sans font-bold text-[15px] border cursor-pointer disabled:cursor-not-allowed ${
            verified
              ? "bg-safe text-white border-safe"
              : "bg-transparent text-safe border-safe hover:bg-safe hover:text-white"
          } disabled:opacity-80`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mr-1.5 -mb-px"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          I CAN CONFIRM · {num(count)}
        </button>
        <Link
          href={`/report?scam=${slug}`}
          className="inline-flex items-center px-3 py-[7px] font-sans font-bold text-[15px] bg-transparent text-meta border border-meta hover:bg-surface-alt hover:no-underline"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mr-1.5 -mb-px"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          DISPUTE
        </Link>
      </div>
      {err && <span className="mono text-[12px] text-danger">{err}</span>}
    </div>
  );
}
