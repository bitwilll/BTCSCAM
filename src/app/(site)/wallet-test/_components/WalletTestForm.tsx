"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { testWallet, type WalletTestResult } from "@/actions/wallet-test";
import { SeverityTag } from "@/components/ui";

export function WalletTestForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [res, setRes] = useState<WalletTestResult | null>(null);
  const [pending, start] = useTransition();

  function run() {
    if (!q.trim()) return;
    start(async () => setRes(await testWallet(q)));
  }

  return (
    <div>
      <div className="mt-[22px] flex gap-2.5 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="bc1q… · 0x… · T… · paste the full address"
          aria-label="Wallet address or domain to check"
          className="min-w-0 border border-ink px-[18px] py-[15px] bg-white mono font-medium text-[16px] outline-ink"
          style={{ flex: "1 1 320px" }}
        />
        <button
          onClick={run}
          disabled={pending}
          className="px-[26px] py-[15px] kicker bg-ink text-paper border border-ink cursor-pointer hover:bg-action-hover disabled:opacity-60"
        >
          {pending ? "CHECKING…" : "TEST IT"}
        </button>
      </div>

      {res?.state === "invalid" && (
        <div
          role="alert"
          className="mt-[18px] border border-gold text-warn-fg bg-warn px-[18px] py-3.5 font-bold text-[16px]"
        >
          That doesn&apos;t look like a full address — paste the whole string.
        </div>
      )}

      {res?.state === "flagged" && (
        <div role="alert" className="mt-[18px] border border-danger bg-white">
          <div className="bg-danger text-white px-[18px] py-3 flex gap-2.5 items-center flex-wrap">
            <span className="inline-flex items-center gap-2 font-bold text-[18px] tracking-[.05em]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              FLAGGED — DO NOT SEND
            </span>
            <span className="text-[14px] opacity-90 uppercase tracking-[.05em]">
              Matches a tracked cluster
            </span>
          </div>
          <div className="p-[18px] flex gap-x-6 gap-y-3 items-center flex-wrap">
            <div className="min-w-0" style={{ flex: "1 1 260px" }}>
              <div className="font-display text-[21px]">{res.hit.name}</div>
              <div className="mt-1 text-[14px] text-meta capitalize">
                {res.hit.type.replace(/-/g, " ")} · {res.hit.status}
              </div>
            </div>
            <SeverityTag severity={res.hit.severity} />
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/database/${res.hit.slug}`}
                className="px-4 py-[11px] font-bold text-[14px] uppercase tracking-[.05em] bg-ink text-paper border border-ink hover:bg-action-hover hover:no-underline"
              >
                Open dossier →
              </Link>
              <Link
                href={`/report?scam=${encodeURIComponent(res.hit.name)}`}
                className="px-4 py-[11px] font-bold text-[14px] uppercase tracking-[.05em] bg-transparent text-ink border border-ink hover:bg-surface-alt hover:no-underline"
              >
                Report a sighting
              </Link>
            </div>
          </div>
        </div>
      )}

      {res?.state === "clean" && (
        <div role="status" className="mt-[18px] border border-safe bg-white p-[18px]">
          <div className="inline-flex items-center gap-2 font-bold text-[16px] tracking-[.05em] text-safe uppercase">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            No match in the database
          </div>
          <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-[70ch]">
            Clean is not a guarantee — new scam wallets appear hourly. Verify the full address
            character by character and send a test amount first.
          </p>
          <div className="mt-3.5 flex gap-[18px] flex-wrap">
            <Link href="/alerts" className="kicker text-accent hover:no-underline hover:text-ink">
              Watch live alerts →
            </Link>
            <Link href="/database" className="kicker text-accent hover:no-underline hover:text-ink">
              Search the database →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
