import Link from "next/link";
import { Kicker, MediaPlaceholder, SeverityTag } from "@/components/ui";
import { SaveButton } from "./SaveButton";
import { byline as fmtByline, num } from "@/lib/format";

export const CATEGORY_META: Record<string, { label: string; color: "ink" | "orange" | "red" | "green" | "muted" }> = {
  news: { label: "News", color: "muted" },
  "threat-intel": { label: "Threat Intel", color: "red" },
  "field-guide": { label: "Field Guide", color: "orange" },
  data: { label: "Data", color: "ink" },
  "community-win": { label: "Community Win", color: "green" },
  "exchange-watch": { label: "Exchange Watch", color: "orange" },
  investigation: { label: "Investigation", color: "orange" },
  magazine: { label: "Magazine", color: "ink" },
  scamcast: { label: "ScamCast", color: "orange" },
  "rug-report": { label: "The Rug Report", color: "red" },
};

export function categoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { label: cat.replace(/-/g, " "), color: "ink" as const };
}

export type ArticleLike = {
  id: string;
  slug: string;
  title: string;
  dek?: string | null;
  kicker?: string | null;
  category: string;
  coverLabel?: string | null;
  coverImageUrl?: string | null;
  readMinutes: number;
  severity?: string;
  author?: { displayName: string } | null;
  publishedAt?: Date | string | null;
};

export function ArticleCard({
  article,
  saved = false,
  showSave = true,
  compact = false,
}: {
  article: ArticleLike;
  saved?: boolean;
  showSave?: boolean;
  compact?: boolean;
}) {
  const meta = categoryMeta(article.category);
  return (
    <article className="group flex flex-col">
      {!compact && (
        <Link href={`/article/${article.slug}`} className="block mb-3">
          <MediaPlaceholder
            src={article.coverImageUrl}
            label={article.coverLabel || `[ ${meta.label} ]`}
            ratio="16/10"
          />
        </Link>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Kicker color={meta.color}>{article.kicker || meta.label}</Kicker>
        {article.severity && article.severity !== "none" && <SeverityTag severity={article.severity} />}
      </div>
      <h3 className="font-extrabold text-ink leading-tight text-lg group-hover:text-btc-dark">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h3>
      {article.dek && <p className="mt-2 text-sm text-ink-600 leading-snug">{article.dek}</p>}
      <div className="mt-3 flex items-center justify-between mono text-[11px] text-ink-500 uppercase tracking-wide">
        <span>{article.readMinutes} min read</span>
        {showSave && <SaveButton articleId={article.id} initialSaved={saved} />}
      </div>
    </article>
  );
}

export function TopStoryItem({ article }: { article: ArticleLike }) {
  const meta = categoryMeta(article.category);
  return (
    <article className="py-4 border-b border-line last:border-0">
      <Kicker color={meta.color}>{article.kicker || meta.label}</Kicker>
      <h3 className="font-extrabold text-ink leading-tight mt-1.5 hover:text-btc-dark">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h3>
      {(article.author || article.publishedAt) && (
        <p className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-2">
          {article.author ? `By ${article.author.displayName}` : ""}
          {article.author && article.publishedAt ? " · " : ""}
          {article.publishedAt ? fmtByline(article.publishedAt) : ""}
        </p>
      )}
    </article>
  );
}

export type ScamLike = {
  slug: string;
  name: string;
  type: string;
  chains: unknown;
  verifiedCount: number;
};

export function ThreatBoardRow({ rank, scam }: { rank: number; scam: ScamLike }) {
  const chains = Array.isArray(scam.chains) ? scam.chains.join(", ") : "";
  return (
    <Link
      href={`/database/${scam.slug}`}
      className="flex items-center gap-4 py-3 border-b border-line last:border-0 group"
    >
      <span className="font-display text-2xl text-ink-400 w-8 shrink-0">{String(rank).padStart(2, "0")}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-ink truncate group-hover:text-btc-dark">{scam.name}</div>
        <div className="mono text-[11px] text-ink-500 uppercase tracking-wide capitalize">
          {scam.type.replace(/-/g, " ")} {chains && `· ${chains}`}
        </div>
      </div>
      <span className="mono text-[11px] text-btc-dark uppercase tracking-wide shrink-0">
        {num(scam.verifiedCount)} Verified
      </span>
    </Link>
  );
}
