"use client";

import { useState, useTransition } from "react";
import { setUserRole } from "@/actions/admin-users";
import { ROLE_LABELS, ROLE_PRIVILEGES, type Role } from "@/lib/constants";

export function RoleForm({
  targetId,
  currentRole,
  assignableRoles,
  disabled,
  disabledReason,
}: {
  targetId: string;
  currentRole: Role;
  assignableRoles: Role[];
  disabled: boolean;
  disabledReason?: string;
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = role !== currentRole;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="flex-1">
          <span className="eyebrow block mb-1">Role</span>
          <select
            value={role}
            disabled={disabled || pending}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2.5 text-sm border border-line bg-paper text-ink focus:outline-none focus:border-ink disabled:opacity-50"
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
            {/* Keep the current role selectable even if it's above what the actor may assign */}
            {!assignableRoles.includes(currentRole) && (
              <option value={currentRole}>{ROLE_LABELS[currentRole]} (current)</option>
            )}
          </select>
        </label>
        <button
          type="button"
          disabled={disabled || pending || !dirty}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const r = await setUserRole(targetId, role);
              setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Saved." : r.error ?? "Error." });
            })
          }
          className="kicker bg-ink text-paper px-5 py-2.5 hover:bg-btc hover:text-black disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {pending ? "Saving…" : "Save Role"}
        </button>
      </div>

      <p className="mono text-[11px] text-ink-500 mt-2">
        Grants the {ROLE_PRIVILEGES[role]?.length ?? 0} baseline privileges for this role.
      </p>

      {disabled && disabledReason && (
        <p className="mono text-[11px] text-alert-strong mt-2">{disabledReason}</p>
      )}
      {msg && (
        <p className={`mono text-[11px] mt-2 ${msg.ok ? "text-up" : "text-alert-strong"}`}>{msg.text}</p>
      )}
    </div>
  );
}
