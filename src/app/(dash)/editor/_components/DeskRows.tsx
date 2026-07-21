import Link from "next/link";
import { Tag } from "@/components/ui";
import { categoryMeta } from "@/components/content/cards";
import { compactUsd, timeAgo } from "@/lib/format";

type Tone = "black" | "red" | "red-soft" | "green" | "warn" | "neutral" | "outline" | "paper";

const ARTICLE_STATUS_TONE: Record<string, Tone> = {
  draft: "paper",
  review: "warn",
};

const REPORT_STATUS_TONE: Record<string, Tone> = {
  pending: "paper",
  triaging: "warn",
};

export type ArticleQueueItem = {
  id: string;
  title: string;
  category: string;
  kicker: string | null;
  status: string;
  authorName: string | null;
  updatedAt: Date | string;
};

/** A row in the editorial "Article queue" — links to the admin articles workspace. */
export function ArticleRow({ article }: { article: ArticleQueueItem }) {
  const meta = categoryMeta(article.category);
  return (
    <Link
      href="/admin/articles"
      className="flex items-center gap-4 px-4 py-3 border-t border-rule first:border-t-0 hover:bg-surface-dim hover:no-underline group"
    >
      <span className="w-20 shrink-0">
        <Tag tone={ARTICLE_STATUS_TONE[article.status] ?? "outline"}>{article.status}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[16px] text-ink truncate group-hover:text-accent">
          {article.title}
        </div>
        <div className="text-[14px] text-meta uppercase tracking-[.02em] truncate">
          {article.kicker || meta.label}
          {article.authorName ? ` · ${article.authorName}` : " · Unassigned"}
          {` · ${timeAgo(article.updatedAt)}`}
        </div>
      </div>
      <span className="text-[14px] font-bold text-faint group-hover:text-accent shrink-0">→</span>
    </Link>
  );
}

export type ReportQueueItem = {
  id: string;
  scamName: string;
  category: string;
  chain: string | null;
  amountLostUsd: number | null;
  status: string;
  createdAt: Date | string;
};

/** A row in the "Reports to triage" queue — links to the admin reports workspace. */
export function ReportRow({ report }: { report: ReportQueueItem }) {
  return (
    <Link
      href="/admin/reports"
      className="flex items-center gap-4 px-4 py-3 border-t border-rule first:border-t-0 hover:bg-surface-dim hover:no-underline group"
    >
      <span className="w-20 shrink-0">
        <Tag tone={REPORT_STATUS_TONE[report.status] ?? "outline"}>{report.status}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[16px] text-ink truncate group-hover:text-accent">
          {report.scamName}
        </div>
        <div className="text-[14px] text-meta uppercase tracking-[.02em] truncate capitalize">
          {report.category.replace(/-/g, " ")}
          {report.chain ? ` · ${report.chain}` : ""}
          {` · ${timeAgo(report.createdAt)}`}
        </div>
      </div>
      <span className="mono text-[14px] font-bold text-danger shrink-0">
        {report.amountLostUsd ? compactUsd(report.amountLostUsd) : "—"}
      </span>
    </Link>
  );
}
