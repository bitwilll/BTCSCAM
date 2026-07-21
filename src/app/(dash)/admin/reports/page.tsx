import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV, REPORT_STATUSES } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { compactUsd, byline } from "@/lib/format";
import { ReportControls } from "./_components/ReportControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report Triage · Staff · BTCSCAM.COM",
  description: "Triage, assign and resolve incoming community scam reports.",
};

const STAFF_ROLES = ["copywriter", "editor", "manager", "admin"];

const STATUS_TONE: Record<string, "outline" | "warn" | "green" | "black" | "red" | "paper"> = {
  pending: "paper",
  triaging: "warn",
  verified: "green",
  published: "black",
  rejected: "red",
  duplicate: "outline",
};

const th = "text-left kicker text-meta px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-rule";

export default async function ReportsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requirePrivilege(PV.REPORT_TRIAGE);
  const { status } = await searchParams;
  const active = status && (REPORT_STATUSES as readonly string[]).includes(status) ? status : undefined;
  const canAssign = can(user, PV.REPORT_ASSIGN);

  const [reports, staff, scams, counts] = await Promise.all([
    prisma.scamReport.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        submittedBy: { select: { displayName: true } },
        assignedTo: { select: { displayName: true } },
      },
      take: 200,
    }),
    prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, isActive: true },
      select: { id: true, displayName: true, role: true },
      orderBy: [{ role: "desc" }, { displayName: "asc" }],
    }),
    prisma.scamEntry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.scamReport.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = counts.reduce((n, c) => n + c._count, 0);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHeader
        kicker="Report Triage"
        title="Incoming Scam Reports"
        lede="Verify, assign and resolve reports submitted by the community. Every action is written to the audit log."
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 -mt-2">
        <FilterTab label={`All (${total})`} href="/admin/reports" activeState={!active} />
        {REPORT_STATUSES.map((s) => (
          <FilterTab
            key={s}
            label={`${s} (${countFor(s)})`}
            href={`/admin/reports?status=${s}`}
            activeState={active === s}
          />
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports here"
          hint={active ? `Nothing with status "${active}".` : "Community reports will appear here as they come in."}
        />
      ) : (
        <div className="border border-ink bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-surface-dim">
              <tr>
                <th className={th}>Report</th>
                <th className={th}>Category</th>
                <th className={th}>Chain</th>
                <th className={th}>Lost</th>
                <th className={th}>Status</th>
                <th className={th}>Reporter</th>
                <th className={th}>Assigned</th>
                <th className={th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-surface-dim">
                  <td className={td}>
                    <div className="font-bold text-ink leading-tight max-w-[220px]">{r.scamName}</div>
                    <div className="mono text-[11px] text-meta mt-1 line-clamp-2 max-w-[220px]">
                      {r.description}
                    </div>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="mono text-[10px] text-accent hover:text-ink break-all"
                      >
                        {r.url}
                      </a>
                    )}
                    <div className="mono text-[10px] text-faint mt-1">{byline(r.createdAt)}</div>
                  </td>
                  <td className={`${td} mono text-[11px] uppercase text-body-2 whitespace-nowrap`}>
                    {r.category.replace(/-/g, " ")}
                  </td>
                  <td className={`${td} mono text-[11px] text-body-2 whitespace-nowrap`}>
                    {r.chain || "—"}
                  </td>
                  <td className={`${td} mono font-bold text-[16px] text-danger whitespace-nowrap`}>
                    {r.amountLostUsd != null ? compactUsd(Number(r.amountLostUsd)) : "—"}
                  </td>
                  <td className={td}>
                    <Tag tone={STATUS_TONE[r.status] ?? "paper"}>{r.status}</Tag>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <div className="text-ink font-semibold text-xs">
                      {r.submittedBy?.displayName ?? "Guest"}
                    </div>
                    {r.reporterEmail && (
                      <div className="mono text-[10px] text-meta break-all">{r.reporterEmail}</div>
                    )}
                  </td>
                  <td className={`${td} mono text-[11px] text-body-2 whitespace-nowrap`}>
                    {r.assignedTo?.displayName ?? "—"}
                  </td>
                  <td className={td}>
                    <ReportControls
                      reportId={r.id}
                      status={r.status}
                      assignedToId={r.assignedToId ?? ""}
                      linkedScamId={r.linkedScamId ?? ""}
                      staff={staff}
                      scams={scams}
                      canAssign={canAssign}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  label,
  href,
  activeState,
}: {
  label: string;
  href: string;
  activeState: boolean;
}) {
  return (
    <Link
      href={href}
      className={`kicker px-3 py-1.5 border capitalize ${
        activeState
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-body-2 border-ink hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );
}
