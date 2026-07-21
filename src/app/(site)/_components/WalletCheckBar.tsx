"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// v4 front-page "CHECK BEFORE YOU SEND" inline bar → routes to /wallet-test?q=
export function WalletCheckBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function run() {
    router.push(q.trim() ? `/wallet-test?q=${encodeURIComponent(q.trim())}` : "/wallet-test");
  }

  return (
    <div className="border-t border-rule px-0.5 py-3.5 flex gap-2.5 items-center flex-wrap">
      <span className="font-bold text-[16px] tracking-[.05em] uppercase text-body-2">
        Check before you send:
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()}
        placeholder="Paste a wallet address or domain"
        aria-label="Wallet address or domain to check"
        className="min-w-[200px] border border-ink px-3.5 py-2.5 bg-paper text-[16px] outline-ink"
        style={{ flex: "1 1 260px" }}
      />
      <button
        onClick={run}
        className="px-[18px] py-2.5 kicker bg-ink text-paper border border-ink cursor-pointer hover:bg-action-hover"
      >
        Run check
      </button>
      <Link href="/report" className="kicker text-meta hover:text-ink">
        or report a scam →
      </Link>
    </div>
  );
}
