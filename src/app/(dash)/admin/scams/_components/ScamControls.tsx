"use client";

import { useState, useTransition } from "react";
import { setScamStatus, type Result } from "@/actions/admin-ops";
import { SCAM_STATUSES } from "@/lib/constants";

const SCAM_SEVERITIES = ["elevated", "high", "critical"] as const;

const sel =
  "mt-1 w-full border border-ink bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const cap = "mono text-[10px] uppercase tracking-wide text-faint";

export function ScamControls({
  scamId,
  status,
  severity,
}: {
  scamId: string;
  status: string;
  severity: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [curStatus, setCurStatus] = useState(status);
  const [curSeverity, setCurSeverity] = useState(severity);

  const save = (nextStatus: string, nextSeverity: string) =>
    start(async () => {
      setMsg(null);
      const r: Result = await setScamStatus(scamId, nextStatus, nextSeverity);
      setMsg({ ok: r.ok, text: r.ok ? "Saved" : r.error ?? "Error" });
    });

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <label className="block">
        <span className={cap}>Status</span>
        <select
          value={curStatus}
          disabled={pending}
          onChange={(e) => {
            setCurStatus(e.target.value);
            save(e.target.value, curSeverity);
          }}
          className={sel}
          aria-label="Scam status"
        >
          {SCAM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={cap}>Severity</span>
        <select
          value={curSeverity}
          disabled={pending}
          onChange={(e) => {
            setCurSeverity(e.target.value);
            save(curStatus, e.target.value);
          }}
          className={sel}
          aria-label="Scam severity"
        >
          {SCAM_SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {msg && (
        <span className={`mono text-[10px] ${msg.ok ? "text-safe" : "text-danger"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
