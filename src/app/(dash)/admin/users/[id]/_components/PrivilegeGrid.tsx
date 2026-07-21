"use client";

import { useState, useTransition } from "react";
import { grantPrivilege, resetPrivilege, revokePrivilege } from "@/actions/admin-users";
import {
  ALL_PRIVILEGES,
  PRIVILEGE_LABELS,
  ROLE_PRIVILEGES,
  type Privilege,
  type Role,
} from "@/lib/constants";

type Source = "role" | "granted" | "revoked" | "off";

export function PrivilegeGrid({
  targetId,
  role,
  extraPrivileges,
  revokedPrivileges,
  canGrant,
}: {
  targetId: string;
  role: Role;
  extraPrivileges: string[];
  revokedPrivileges: string[];
  canGrant: boolean;
}) {
  const [extra, setExtra] = useState<string[]>(extraPrivileges);
  const [revoked, setRevoked] = useState<string[]>(revokedPrivileges);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const roleBase = new Set(ROLE_PRIVILEGES[role] ?? []);

  function statusOf(p: Privilege): { source: Source; effective: boolean } {
    const inRole = roleBase.has(p);
    const isGranted = extra.includes(p);
    const isRevoked = revoked.includes(p);
    const effective = (inRole || isGranted) && !isRevoked;
    let source: Source;
    if (isRevoked && inRole) source = "revoked";
    else if (isGranted && !inRole) source = "granted";
    else if (inRole) source = "role";
    else source = "off";
    return { source, effective };
  }

  function run(p: Privilege, kind: "grant" | "revoke" | "reset") {
    setErr(null);
    setBusy(p);
    start(async () => {
      const action = kind === "grant" ? grantPrivilege : kind === "revoke" ? revokePrivilege : resetPrivilege;
      const r = await action(targetId, p);
      if (!r.ok) {
        setErr(r.error ?? "Error");
      } else if (kind === "grant") {
        setExtra((x) => Array.from(new Set([...x, p])));
        setRevoked((x) => x.filter((v) => v !== p));
      } else if (kind === "revoke") {
        setRevoked((x) => Array.from(new Set([...x, p])));
        setExtra((x) => x.filter((v) => v !== p));
      } else {
        setExtra((x) => x.filter((v) => v !== p));
        setRevoked((x) => x.filter((v) => v !== p));
      }
      setBusy(null);
    });
  }

  const badge = {
    role: { label: "Role default", cls: "bg-ink text-paper" },
    granted: { label: "Granted", cls: "bg-btc text-black" },
    revoked: { label: "Revoked", cls: "bg-alert-strong text-white" },
    off: { label: "Off", cls: "bg-paper text-ink-500 border border-line" },
  } as const;

  return (
    <div>
      {!canGrant && (
        <p className="mono text-[11px] text-alert-strong mb-3">
          You do not have permission to change this user&apos;s privileges. Displaying effective set only.
        </p>
      )}
      {err && <p className="mono text-[11px] text-alert-strong mb-3">{err}</p>}

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="bg-paper-2 border-b border-line-strong">
              <th className="eyebrow px-4 py-3">Privilege</th>
              <th className="eyebrow px-4 py-3">Source</th>
              <th className="eyebrow px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ALL_PRIVILEGES.map((p) => {
              const { source, effective } = statusOf(p);
              const b = badge[source];
              const rowBusy = pending && busy === p;
              return (
                <tr key={p} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3">
                    <div className={`font-semibold ${effective ? "text-ink" : "text-ink-500 line-through"}`}>
                      {PRIVILEGE_LABELS[p] ?? p}
                    </div>
                    <div className="mono text-[11px] text-ink-500">{p}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`kicker inline-flex items-center px-2 py-[3px] leading-none ${b.cls}`}>
                      {b.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canGrant ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={rowBusy || source === "granted"}
                          onClick={() => run(p, "grant")}
                          className="kicker px-2 py-1 border border-line text-ink-600 hover:border-btc-dark hover:text-btc-dark disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Explicitly grant"
                        >
                          Grant
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy || source === "revoked" || (source === "off")}
                          onClick={() => run(p, "revoke")}
                          className="kicker px-2 py-1 border border-line text-ink-600 hover:border-alert-strong hover:text-alert-strong disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Revoke (overrides role default)"
                        >
                          Revoke
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy || (!extra.includes(p) && !revoked.includes(p))}
                          onClick={() => run(p, "reset")}
                          className="kicker px-2 py-1 border border-line text-ink-600 hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Clear override, revert to role default"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <div className="text-right mono text-[11px] text-ink-500">
                        {effective ? "granted" : "—"}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mt-3">
        <Legend cls="bg-ink text-paper" label="Role default" />
        <Legend cls="bg-btc text-black" label="Explicitly granted" />
        <Legend cls="bg-alert-strong text-white" label="Revoked" />
        <Legend cls="bg-paper text-ink-500 border border-line" label="Not granted" />
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block w-3 h-3 ${cls}`} />
      <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">{label}</span>
    </span>
  );
}
