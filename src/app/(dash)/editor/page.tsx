import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV, ROLE_LABELS, type Role } from "@/lib/constants";
import { ButtonLink, Kicker, SectionHeader, EmptyState } from "@/components/ui";
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

  const statTiles: { label: string; value: string; sub: string; tone?: "accent" | "red" }[] = [
    { label: "Drafts", value: num(draftCount), sub: "awaiting review" },
    { label: "In review", value: num(reviewCount), sub: "ready to edit", tone: "accent" },
    { label: "Published", value: num(publishedCount), sub: `last ${CYCLE_DAYS} days` },
    { label: "Reports", value: num(reportPendingCount), sub: "pending + triaging", tone: "red" },
  ];

  return (
    <div>
      {/* Header */}
      <header className="border-b border-ink pb-5 mb-8">
        <Kicker color="accent">Editorial</Kicker>
        <h1 className="font-display text-ink mt-2" style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1 }}>
          Editor desk
        </h1>
        <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-2xl">
          Drafts, stories in review, and community reports awaiting triage. Open a queue item to act
          on it in the admin workspace.
        </p>
        {user && (
          <p className="eyebrow mt-3">
            Signed in as {user.displayName} · {ROLE_LABELS[user.role as Role] ?? user.role}
          </p>
        )}
      </header>

      {gaps.length > 0 && (
        <div className="bg-warn text-warn-fg px-4 py-3 mb-8 text-[14px] uppercase tracking-[.05em]">
          <span className="font-bold">Heads up —</span> your account can view this desk but
          cannot {gaps.join(", ")}. Those controls will be unavailable on the linked pages.
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statTiles.map((s) => (
          <div key={s.label} className="bg-white shadow-card p-4">
            <div className="kicker text-meta">{s.label}</div>
            <div className={`mono font-black text-[32px] mt-1 ${s.tone === "red" ? "text-danger" : s.tone === "accent" ? "text-accent" : "text-ink"}`}>
              {s.value}
            </div>
            <div className="text-[14px] text-meta mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Queues */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-10">
        <section>
          <SectionHeader title="Article Queue" action={{ label: "Open Articles", href: "/admin/articles" }} />
          {articles.length > 0 ? (
            <div className="border border-ink bg-white">
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
            <div className="border border-ink bg-white">
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
          <ButtonLink href="/admin/articles" variant="ghost" size="sm">Articles</ButtonLink>
          <ButtonLink href="/admin/reports" variant="ghost" size="sm">Reports</ButtonLink>
          <ButtonLink href="/admin/scams" variant="ghost" size="sm">Scam database</ButtonLink>
        </div>
      </section>
    </div>
  );
}
