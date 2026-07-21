import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV, CONSULT_STATUSES } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { compactUsd, byline, timeAgo } from "@/lib/format";
import { ConsultControls } from "./_components/ConsultControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultations · Staff · BTCSCAM.COM",
  description: "Handle victim-support and security consultation requests.",
};

const STAFF_ROLES = ["copywriter", "editor", "manager", "admin"];

const STATUS_TONE: Record<string, "paper" | "orange" | "black" | "green"> = {
  new: "paper",
  scheduled: "orange",
  in_progress: "black",
  closed: "green",
};

const URGENCY_TONE: Record<string, "red" | "orange" | "paper" | "outline"> = {
  critical: "red",
  high: "orange",
  normal: "paper",
  low: "outline",
};

const th = "text-left kicker text-ink-500 px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-line";

export default async function ConsultationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePrivilege(PV.CONSULT_HANDLE);
  const { status } = await searchParams;
  const active = status && (CONSULT_STATUSES as readonly string[]).includes(status) ? status : undefined;

  const [requests, staff, counts] = await Promise.all([
    prisma.consultationRequest.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        assignedTo: { select: { displayName: true } },
        _count: { select: { messages: true } },
      },
      take: 200,
    }),
    prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, isActive: true },
      select: { id: true, displayName: true, role: true },
      orderBy: [{ role: "desc" }, { displayName: "asc" }],
    }),
    prisma.consultationRequest.groupBy({ by: ["status"], _count: true }),
  ]);

  const total = counts.reduce((n, c) => n + c._count, 0);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageHeader
        kicker="Client Services"
        title="Consultation Requests"
        lede="Victim-support, recovery-guidance and security requests. Assign, schedule and reply from the case thread."
      />

      <div className="flex flex-wrap gap-2 mb-6 -mt-2">
        <FilterTab label={`All (${total})`} href="/admin/consultations" activeState={!active} />
        {CONSULT_STATUSES.map((s) => (
          <FilterTab
            key={s}
            label={`${s.replace(/_/g, " ")} (${countFor(s)})`}
            href={`/admin/consultations?status=${s}`}
            activeState={active === s}
          />
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No consultation requests"
          hint={active ? `Nothing with status "${active.replace(/_/g, " ")}".` : "Incoming requests will appear here."}
        />
      ) : (
        <div className="border border-line-strong bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-2">
              <tr>
                <th className={th}>Requester</th>
                <th className={th}>Topic</th>
                <th className={th}>Urgency</th>
                <th className={th}>At Stake</th>
                <th className={th}>Thread</th>
                <th className={th}>Status</th>
                <th className={th}>Manage</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-paper-2/60">
                  <td className={td}>
                    <div className="font-bold text-ink">{r.name}</div>
                    <div className="mono text-[10px] text-ink-500 break-all">{r.email}</div>
                    <div className="mono text-[10px] text-ink-400 mt-1">
                      {byline(r.createdAt)} · updated {timeAgo(r.updatedAt)}
                    </div>
                  </td>
                  <td className={`${td} mono text-[11px] uppercase text-ink-600 whitespace-nowrap`}>
                    {r.topic.replace(/-/g, " ")}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Tag tone={URGENCY_TONE[r.urgency] ?? "paper"}>{r.urgency}</Tag>
                  </td>
                  <td className={`${td} font-display text-lg text-alert-strong whitespace-nowrap`}>
                    {r.amountUsd != null ? compactUsd(Number(r.amountUsd)) : "—"}
                  </td>
                  <td className={`${td} mono text-[11px] text-ink-600 whitespace-nowrap`}>
                    {r._count.messages} msg
                    {r.assignedTo && (
                      <span className="block text-ink-400">→ {r.assignedTo.displayName}</span>
                    )}
                  </td>
                  <td className={td}>
                    <Tag tone={STATUS_TONE[r.status] ?? "paper"}>{r.status.replace(/_/g, " ")}</Tag>
                  </td>
                  <td className={td}>
                    <ConsultControls
                      requestId={r.id}
                      status={r.status}
                      assignedToId={r.assignedToId ?? ""}
                      staff={staff}
                    />
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Link
                      href={`/admin/consultations/${r.id}`}
                      className="kicker text-btc-dark hover:text-ink"
                    >
                      Open →
                    </Link>
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
          : "bg-paper text-ink-600 border-line-strong hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );
}
