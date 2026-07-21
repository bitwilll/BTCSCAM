"use client";

import { useState, useTransition } from "react";
import { setUserActive, setUserBan } from "@/actions/admin-users";

export function UserModActions({
  targetId,
  isBanned,
  isActive,
  canBan,
  canManage,
}: {
  targetId: string;
  isBanned: boolean;
  isActive: boolean;
  canBan: boolean;
  canManage: boolean;
}) {
  const [banned, setBanned] = useState(isBanned);
  const [active, setActive] = useState(isActive);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggleBan() {
    const next = !banned;
    start(async () => {
      setMsg(null);
      const r = await setUserBan(targetId, next);
      if (r.ok) setBanned(next);
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Saved." : r.error ?? "Error." });
    });
  }

  function toggleActive() {
    const next = !active;
    start(async () => {
      setMsg(null);
      const r = await setUserActive(targetId, next);
      if (r.ok) setActive(next);
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Saved." : r.error ?? "Error." });
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* Ban */}
        <div className="flex items-center justify-between gap-4 border border-rule bg-surface-dim p-4">
          <div>
            <div className="kicker text-ink">Account status</div>
            <p className="mono text-[11px] text-meta mt-1">
              {banned ? "Suspended — cannot sign in." : "In good standing."}
            </p>
          </div>
          <button
            type="button"
            disabled={!canBan || pending}
            onClick={toggleBan}
            className={`kicker px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              banned ? "bg-ink text-paper hover:bg-action-hover" : "bg-danger text-white hover:bg-ink"
            }`}
          >
            {pending ? "…" : banned ? "Reinstate" : "Ban User"}
          </button>
        </div>

        {/* Activation */}
        <div className="flex items-center justify-between gap-4 border border-rule bg-surface-dim p-4">
          <div>
            <div className="kicker text-ink">Activation</div>
            <p className="mono text-[11px] text-meta mt-1">
              {active ? "Active — session allowed." : "Deactivated — sessions invalid."}
            </p>
          </div>
          <button
            type="button"
            disabled={!canManage || pending}
            onClick={toggleActive}
            className={`kicker px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              active ? "bg-ink text-paper hover:bg-danger" : "bg-ink text-paper hover:bg-action-hover"
            }`}
          >
            {pending ? "…" : active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {!canBan && !canManage && (
        <p className="mono text-[11px] text-danger mt-3">
          You cannot moderate this account.
        </p>
      )}
      {msg && (
        <p className={`mono text-[11px] mt-3 ${msg.ok ? "text-safe" : "text-danger"}`}>{msg.text}</p>
      )}
    </div>
  );
}
