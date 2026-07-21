import Link from "next/link";
import { Kicker, MediaPlaceholder, SeverityTag } from "@/components/ui";
import { SaveButton } from "./SaveButton";
import { byline as fmtByline, num } from "@/lib/format";

export const CATEGORY_META: Record<string, { label: string; color: "ink" | "accent" | "red" | "green" | "muted" }> = {
  news: { label: "News", color: "accent" },
  "threat-intel": { label: "Threat Intel", color: "accent" },
  "field-guide": { label: "Field Guide", color: "accent" },
  data: { label: "Data", color: "accent" },
  "community-win": { label: "Community Win", color: "green" },
  "exchange-watch": { label: "Exchange Watch", color: "accent" },
  investigation: { label: "Investigation", color: "accent" },
  magazine: { label: "Magazine", color: "accent" },
  scamcast: { label: "ScamCast", color: "accent" },
  "rug-report": { label: "The Rug Report", color: "red" },
};

export function categoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { label: cat.replace(/-/g, " "), color: "accent" as const };
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

// v4 "THE LATEST" row: kicker line → Fraunces title → dek → meta, 150×100 thumb right.
export function ArticleRow({
  article,
  caseNo,
  showDek = true,
}: {
  article: ArticleLike;
  caseNo?: string;
  showDek?: boolean;
}) {
  const meta = categoryMeta(article.category);
  return (
    <Link
      href={`/article/${article.slug}`}
      className="flex gap-[22px] items-start py-[22px] border-b border-rule group hover:no-underline"
    >
      <div className="min-w-0 flex-1">
        <div className="flex gap-3 items-baseline flex-wrap">
          {caseNo && <span className="mono font-medium text-[14px] text-faint">{caseNo}</span>}
          <Kicker color={meta.color}>{article.kicker || meta.label}</Kicker>
          {article.severity && article.severity !== "none" && (
            <SeverityTag severity={article.severity} />
          )}
        </div>
        <span
          className="block mt-2 font-display text-[24px] leading-[1.25] text-ink group-hover:underline underline-offset-4 decoration-1"
        >
          {article.title}
        </span>
        {showDek && article.dek && (
          <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-[52ch]">{article.dek}</p>
        )}
        <div className="mt-2.5 text-[14px] text-meta">
          {article.author ? `By ${article.author.displayName}` : ""}
          {article.author && article.publishedAt ? " · " : ""}
          {article.publishedAt ? fmtByline(article.publishedAt) : ""} · {article.readMinutes} min
          read
        </div>
      </div>
      <div
        className="flex-none w-[150px] h-[100px] bg-surface-alt bg-cover bg-center max-sm:w-[104px] max-sm:h-[70px]"
        style={article.coverImageUrl ? { backgroundImage: `url(${article.coverImageUrl})` } : undefined}
        aria-hidden="true"
      />
    </Link>
  );
}

// Card layout for grids (store-adjacent contexts) — kept for compatibility.
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
        <Link href={`/article/${article.slug}`} className="block mb-3 hover:no-underline">
          <MediaPlaceholder
            src={article.coverImageUrl}
            label={article.coverLabel || `[ ${meta.label} ]`}
            ratio="16/10"
          />
        </Link>
      )}
      <div className="flex items-center gap-2.5 mb-2">
        <Kicker color={meta.color}>{article.kicker || meta.label}</Kicker>
        {article.severity && article.severity !== "none" && <SeverityTag severity={article.severity} />}
      </div>
      <h3 className="font-display text-[21px] leading-[1.3] text-ink">
        <Link
          href={`/article/${article.slug}`}
          className="hover:underline underline-offset-4 decoration-1 hover:no-underline group-hover:underline"
        >
          {article.title}
        </Link>
      </h3>
      {article.dek && <p className="mt-2 text-[16px] leading-[1.6] text-body-2">{article.dek}</p>}
      <div className="mt-3 flex items-center justify-between text-[14px] text-meta">
        <span>{article.readMinutes} min read</span>
        {showSave && <SaveButton articleId={article.id} initialSaved={saved} />}
      </div>
    </article>
  );
}

// v4 "MOST READ": big Fraunces numeral + title.
export function TopStoryItem({ article, rank }: { article: ArticleLike; rank?: number }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="flex gap-4 items-baseline py-4 border-b border-rule group hover:no-underline"
    >
      {rank !== undefined && (
        <span className="flex-none font-display text-[32px] leading-none text-faint">{rank}</span>
      )}
      <span className="font-display text-[18px] leading-[1.35] text-ink min-w-0 group-hover:underline underline-offset-4 decoration-1">
        {article.title}
      </span>
    </Link>
  );
}

export type ScamLike = {
  slug: string;
  name: string;
  type: string;
  chains: unknown;
  verifiedCount: number;
  severity?: string;
};

export function ThreatBoardRow({ rank, scam }: { rank: number; scam: ScamLike }) {
  const chains = Array.isArray(scam.chains) ? scam.chains.join(", ") : "";
  return (
    <Link
      href={`/database/${scam.slug}`}
      className="flex items-center gap-4 py-3 border-b border-rule last:border-0 group hover:bg-surface-dim hover:no-underline"
    >
      <span className="font-display text-[24px] text-faint w-8 shrink-0">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[18px] text-ink truncate group-hover:underline underline-offset-4 decoration-1">
          {scam.name}
        </div>
        <div className="text-[14px] text-meta capitalize">
          {scam.type.replace(/-/g, " ")} {chains && `· ${chains}`}
        </div>
      </div>
      <span className="text-[14px] font-bold tracking-[.05em] uppercase text-accent shrink-0">
        {num(scam.verifiedCount)} Verified
      </span>
    </Link>
  );
}
