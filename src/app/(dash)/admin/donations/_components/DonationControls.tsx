"use client";

import { useState, useTransition } from "react";
import { confirmDonation, type Result } from "@/actions/admin-ops";

const btn = "kicker px-3 py-1.5 border transition-colors disabled:opacity-50";

export function DonationControls({
  donationId,
  status,
}: {
  donationId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmed, setConfirmed] = useState(status === "confirmed");

  const run = () =>
    start(async () => {
      setMsg(null);
      const r: Result = await confirmDonation(donationId);
      if (r.ok) setConfirmed(true);
      setMsg({ ok: r.ok, text: r.ok ? "Confirmed" : r.error ?? "Error" });
    });

  if (confirmed) {
    return <span className="mono text-[11px] text-safe uppercase tracking-wide">✓ Confirmed</span>;
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className={`${btn} bg-safe text-white border-safe hover:bg-safe-deep`}
      >
        {pending ? "Confirming…" : "Mark confirmed"}
      </button>
      {msg && !msg.ok && <span className="mono text-[10px] text-danger">{msg.text}</span>}
    </div>
  );
}
