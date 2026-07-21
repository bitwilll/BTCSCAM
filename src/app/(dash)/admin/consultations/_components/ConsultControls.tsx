"use client";

import { useState, useTransition } from "react";
import { setConsultStatus, assignConsult, type Result } from "@/actions/admin-ops";
import { CONSULT_STATUSES } from "@/lib/constants";

const sel =
  "mt-1 w-full border border-ink bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const cap = "mono text-[10px] uppercase tracking-wide text-faint";

type StaffOption = { id: string; displayName: string; role: string };

export function ConsultControls({
  requestId,
  status,
  assignedToId,
  staff,
}: {
  requestId: string;
  status: string;
  assignedToId: string;
  staff: StaffOption[];
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
    <div className="flex flex-col gap-2 min-w-[190px]">
      <label className="block">
        <span className={cap}>Status</span>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => run(() => setConsultStatus(requestId, e.target.value))}
          className={sel}
          aria-label="Consultation status"
        >
          {CONSULT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={cap}>Assigned to</span>
        <select
          defaultValue={assignedToId}
          disabled={pending}
          onChange={(e) => run(() => assignConsult(requestId, e.target.value))}
          className={sel}
          aria-label="Assign consultation"
        >
          <option value="">— Unassigned —</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName} ({u.role})
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
