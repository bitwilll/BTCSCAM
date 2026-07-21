import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV, ROLE_LABELS, type Role } from "@/lib/constants";
import { ButtonLink, Kicker, SectionHeader, StatBlock, EmptyState } from "@/components/ui";
import { num } from "@/lib/format";
import {
  ArticleRow,
  ReportRow,
  type ArticleQueueItem,
  type ReportQueueItem,
} from "./_components/DeskRows";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor Desk · BTCSCAM Staff",
  description: "Editorial overview — drafts, articles in review, and scam reports awaiting triage.",
};

const CYCLE_DAYS = 30;

export default async function EditorDeskPage() {
  const user = await getSession();
  const cycleStart = new Date(Date.now() - CYCLE_DAYS * 24 * 60 * 60 * 1000);

  const [
    draftCount,
    reviewCount,
    publishedCount,
    reportPendingCount,
    articleRows,
    reportRows,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "draft" } }),
    prisma.article.count({ where: { status: "review" } }),
    prisma.article.count({
      where: { status: "published", publishedAt: { gte: cycleStart } },
    }),
    prisma.scamReport.count({ where: { status: { in: ["pending", "triaging"] } } }),
    prisma.article.findMany({
      where: { status: { in: ["draft", "review"] } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { author: { select: { displayName: true } } },
    }),
    prisma.scamReport.findMany({
      where: { status: { in: ["pending", "triaging"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const articles: ArticleQueueItem[] = articleRows.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    kicker: a.kicker,
    status: a.status,
    authorName: a.author?.displayName ?? null,
    updatedAt: a.updatedAt,
  }));

  const reports: ReportQueueItem[] = reportRows.map((r) => ({
    id: r.id,
    scamName: r.scamName,
    category: r.category,
    chain: r.chain,
    amountLostUsd: r.amountLostUsd != null ? Number(r.amountLostUsd) : null,
    status: r.status,
    createdAt: r.createdAt,
  }));

  // Friendly heads-up if this staffer can view the desk but lacks acting privileges.
  const gaps: string[] = [];
  if (!can(user, PV.ARTICLE_EDIT_ANY)) gaps.push("edit others' articles");
  if (!can(user, PV.ARTICLE_PUBLISH)) gaps.push("publish articles");
  if (!can(user, PV.REPORT_TRIAGE)) gaps.push("triage reports");

  return (
    <>
      {/* Header */}
      <header className="border-b-2 border-ink pb-5 mb-8">
        <Kicker color="orange">Editorial</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">Editor Desk</h1>
        <p className="mt-2 text-ink-600 max-w-2xl">
          Drafts, stories in review, and community reports awaiting triage. Open a queue item to act
          on it in the admin workspace.
        </p>
        {user && (
          <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
            Signed in as {user.displayName} · {ROLE_LABELS[user.role as Role] ?? user.role}
          </p>
        )}
      </header>

      {gaps.length > 0 && (
        <div className="border border-line bg-paper-2 px-4 py-3 mb-8 mono text-[11px] uppercase tracking-wide text-ink-600">
          <span className="text-btc-dark">Heads up —</span> your account can view this desk but
          cannot {gaps.join(", ")}. Those controls will be unavailable on the linked pages.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatBlock label="Drafts" value={num(draftCount)} sub="awaiting review" />
        <StatBlock label="In Review" value={num(reviewCount)} sub="ready to edit" tone="orange" />
        <StatBlock label="Published" value={num(publishedCount)} sub={`last ${CYCLE_DAYS} days`} />
        <StatBlock
          label="Reports"
          value={num(reportPendingCount)}
          sub="pending + triaging"
          tone="red"
        />
      </div>

      {/* Queues */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-10">
        <section>
          <SectionHeader title="Article Queue" action={{ label: "Open Articles", href: "/admin/articles" }} />
          {articles.length > 0 ? (
            <div>
              {articles.map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Queue is clear"
              hint="No drafts or stories in review right now."
              action={<ButtonLink href="/admin/articles" variant="outline" size="sm">Manage Articles</ButtonLink>}
            />
          )}
        </section>

        <section>
          <SectionHeader title="Reports To Triage" action={{ label: "Open Reports", href: "/admin/reports" }} />
          {reports.length > 0 ? (
            <div>
              {reports.map((r) => (
                <ReportRow key={r.id} report={r} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing to triage"
              hint="No reports are pending or in triage."
              action={<ButtonLink href="/admin/reports" variant="outline" size="sm">Manage Reports</ButtonLink>}
            />
          )}
        </section>
      </div>

      {/* Quick links */}
      <section className="mt-12">
        <SectionHeader title="Quick Links" />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/articles" variant="dark" size="sm">Articles</ButtonLink>
          <ButtonLink href="/admin/reports" variant="dark" size="sm">Reports</ButtonLink>
          <ButtonLink href="/admin/scams" variant="outline" size="sm">Scam Database</ButtonLink>
        </div>
      </section>
    </>
  );
}
