import Link from "next/link";
import { Tag } from "@/components/ui";
import { categoryMeta } from "@/components/content/cards";
import { compactUsd, timeAgo } from "@/lib/format";

type Tone = "black" | "orange" | "red" | "green" | "outline" | "paper";

const ARTICLE_STATUS_TONE: Record<string, Tone> = {
  draft: "paper",
  review: "orange",
};

const REPORT_STATUS_TONE: Record<string, Tone> = {
  pending: "paper",
  triaging: "orange",
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
      className="flex items-center gap-4 py-3 border-b border-line last:border-0 group"
    >
      <span className="w-20 shrink-0">
        <Tag tone={ARTICLE_STATUS_TONE[article.status] ?? "outline"}>{article.status}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-btc-dark">
          {article.title}
        </div>
        <div className="mono text-[11px] text-ink-500 uppercase tracking-wide truncate">
          {article.kicker || meta.label}
          {article.authorName ? ` · ${article.authorName}` : " · Unassigned"}
          {` · ${timeAgo(article.updatedAt)}`}
        </div>
      </div>
      <span className="mono text-[11px] text-ink-400 group-hover:text-btc-dark shrink-0">→</span>
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
      className="flex items-center gap-4 py-3 border-b border-line last:border-0 group"
    >
      <span className="w-20 shrink-0">
        <Tag tone={REPORT_STATUS_TONE[report.status] ?? "outline"}>{report.status}</Tag>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-btc-dark">
          {report.scamName}
        </div>
        <div className="mono text-[11px] text-ink-500 uppercase tracking-wide truncate capitalize">
          {report.category.replace(/-/g, " ")}
          {report.chain ? ` · ${report.chain}` : ""}
          {` · ${timeAgo(report.createdAt)}`}
        </div>
      </div>
      <span className="mono text-[11px] text-alert-strong shrink-0">
        {report.amountLostUsd ? compactUsd(report.amountLostUsd) : "—"}
      </span>
    </Link>
  );
}
