import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Avatar, Kicker, Tag } from "@/components/ui";
import { byline, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log · BTCSCAM.COM",
  description: "Immutable trail of privileged staff actions.",
};

// Colour-code the most common action families.
function actionTone(action: string): "red" | "warn" | "black" | "green" {
  if (action.includes("ban") || action.includes("revoke") || action.includes("deactivate")) return "red";
  if (action.includes("grant") || action.includes("role")) return "warn";
  if (action.includes("activate") || action.includes("unban")) return "green";
  return "black";
}

function metaSummary(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  const entries = Object.entries(meta as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
}

export default async function AuditLogPage() {
  await requirePrivilege(PV.AUDIT_VIEW);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });

  return (
    <div>
      <div className="border-b border-ink pb-5 mb-6">
        <Kicker color="accent">Access Control</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">Audit Log</h1>
        <p className="mono text-[11px] uppercase tracking-wide text-meta mt-3">
          Last {logs.length} privileged actions · newest first
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="border border-dashed border-faint bg-surface-dim p-10 text-center">
          <p className="font-display text-2xl text-body-2">Nothing logged yet</p>
          <p className="mono text-sm text-meta mt-2">
            Privileged actions (role changes, bans, settings edits) will appear here.
          </p>
        </div>
      ) : (
        <ol className="border border-rule divide-y divide-rule">
          {logs.map((log) => {
            const summary = metaSummary(log.meta);
            return (
              <li key={log.id} className="bg-surface-dim px-4 py-3.5 flex items-start gap-3">
                <Avatar name={log.actor?.displayName ?? "System"} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{log.actor?.displayName ?? "System"}</span>
                    <Tag tone={actionTone(log.action)}>{log.action}</Tag>
                    {log.targetType && (
                      <span className="mono text-[11px] text-meta">
                        {log.targetType}
                        {log.targetId ? ` · ${log.targetId.slice(0, 10)}` : ""}
                      </span>
                    )}
                  </div>
                  {summary && <p className="mono text-[11px] text-body-2 mt-1.5 break-words">{summary}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="mono text-[11px] text-meta">{timeAgo(log.createdAt)}</div>
                  <div className="mono text-[10px] text-faint uppercase tracking-wide mt-0.5">{byline(log.createdAt)}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
