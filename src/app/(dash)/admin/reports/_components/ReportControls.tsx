"use client";

import { useState, useTransition } from "react";
import {
  setReportStatus,
  assignReport,
  linkReportScam,
  type Result,
} from "@/actions/admin-ops";
import { REPORT_STATUSES } from "@/lib/constants";

const sel =
  "w-full mt-1 border border-line-strong bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const lbl = "block";
const cap = "mono text-[10px] uppercase tracking-wide text-ink-400";

type StaffOption = { id: string; displayName: string; role: string };
type ScamOption = { id: string; name: string };

export function ReportControls({
  reportId,
  status,
  assignedToId,
  linkedScamId,
  staff,
  scams,
  canAssign,
}: {
  reportId: string;
  status: string;
  assignedToId: string;
  linkedScamId: string;
  staff: StaffOption[];
  scams: ScamOption[];
  canAssign: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = (fn: () => Promise<Result>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg({ ok: r.ok, text: r.ok ? "Saved" : r.error ?? "Error" });
    });

  return (
    <div className="flex flex-col gap-2 min-w-[210px]">
      <label className={lbl}>
        <span className={cap}>Status</span>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => run(() => setReportStatus(reportId, e.target.value))}
          className={sel}
          aria-label="Report status"
        >
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {canAssign && (
        <label className={lbl}>
          <span className={cap}>Assigned to</span>
          <select
            defaultValue={assignedToId}
            disabled={pending}
            onChange={(e) => run(() => assignReport(reportId, e.target.value))}
            className={sel}
            aria-label="Assign report"
          >
            <option value="">— Unassigned —</option>
            {staff.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName} ({u.role})
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={lbl}>
        <span className={cap}>Linked scam</span>
        <select
          defaultValue={linkedScamId}
          disabled={pending}
          onChange={(e) => run(() => linkReportScam(reportId, e.target.value))}
          className={sel}
          aria-label="Link to scam entry"
        >
          <option value="">— None —</option>
          {scams.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {msg && (
        <span className={`mono text-[10px] ${msg.ok ? "text-up" : "text-alert-strong"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
