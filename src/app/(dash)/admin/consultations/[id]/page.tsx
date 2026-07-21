import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Tag, Avatar, StatBlock } from "@/components/ui";
import { compactUsd, byline, timeAgo, dateline } from "@/lib/format";
import { ConsultReply } from "./_components/ConsultReply";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultation Case · Staff · BTCSCAM.COM",
  description: "Consultation case detail and message thread.",
};

const STATUS_TONE: Record<string, "paper" | "warn" | "black" | "green"> = {
  new: "paper",
  scheduled: "warn",
  in_progress: "black",
  closed: "green",
};

const URGENCY_TONE: Record<string, "red" | "warn" | "paper" | "outline"> = {
  critical: "red",
  high: "warn",
  normal: "paper",
  low: "outline",
};

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePrivilege(PV.CONSULT_HANDLE);
  const { id } = await params;

  const request = await prisma.consultationRequest.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { displayName: true, title: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { displayName: true } } },
      },
    },
  });

  if (!request) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/consultations" className="kicker text-meta hover:text-ink">
        ← Back to consultations
      </Link>

      <header className="border-b border-ink pb-6 mb-8 mt-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Tag tone={STATUS_TONE[request.status] ?? "paper"}>{request.status.replace(/_/g, " ")}</Tag>
          <Tag tone={URGENCY_TONE[request.urgency] ?? "paper"}>{request.urgency} urgency</Tag>
          <span className="mono text-[11px] uppercase tracking-wide text-meta">
            {request.topic.replace(/-/g, " ")}
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">{request.name}</h1>
        <div className="mt-3 mono text-[11px] uppercase tracking-wide text-meta flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-body-2 break-all">{request.email}</span>
          <span>Filed {byline(request.createdAt)}</span>
          <span>Updated {timeAgo(request.updatedAt)}</span>
          <span>
            {request.assignedTo ? `Assigned to ${request.assignedTo.displayName}` : "Unassigned"}
          </span>
        </div>
      </header>

      {/* Case facts */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatBlock
          label="Amount at Stake"
          value={request.amountUsd != null ? compactUsd(Number(request.amountUsd)) : "—"}
          tone={request.amountUsd != null ? "red" : "ink"}
        />
        <StatBlock label="Messages" value={request.messages.length} />
        <StatBlock
          label="Scheduled"
          value={request.scheduledAt ? "Yes" : "—"}
          sub={request.scheduledAt ? dateline(request.scheduledAt) : undefined}
        />
      </div>

      {request.walletInvolved && (
        <div className="border border-rule bg-surface-dim p-4 mb-8">
          <div className="eyebrow mb-1">Wallet involved</div>
          <div className="mono text-sm text-ink break-all">{request.walletInvolved}</div>
        </div>
      )}

      {/* Original message */}
      <section className="mb-8">
        <h2 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-4">Original Request</h2>
        <div className="border-l-2 border-ink pl-4 text-body-2 whitespace-pre-line leading-relaxed">
          {request.message}
        </div>
      </section>

      {/* Thread */}
      <section className="mb-8">
        <h2 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-4">Message Thread</h2>
        {request.messages.length === 0 ? (
          <p className="mono text-sm text-meta">No replies yet — start the conversation below.</p>
        ) : (
          <ul className="space-y-4">
            {request.messages.map((m) => (
              <li
                key={m.id}
                className={`p-4 border ${
                  m.fromStaff ? "border-ink bg-surface-dim" : "border-rule bg-paper"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={m.author?.displayName ?? request.name} size={28} />
                  <div>
                    <div className="kicker text-ink">
                      {m.fromStaff ? m.author?.displayName ?? "Staff" : request.name}
                      {m.fromStaff && <span className="text-accent"> · Staff</span>}
                    </div>
                    <div className="mono text-[10px] text-faint">
                      {byline(m.createdAt)} · {timeAgo(m.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-body-2 whitespace-pre-line leading-relaxed">{m.body}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reply */}
      <section className="border-t border-rule pt-6">
        <ConsultReply requestId={request.id} />
      </section>
    </div>
  );
}
