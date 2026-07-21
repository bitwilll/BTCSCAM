import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { ArticleRow, categoryMeta } from "@/components/content/cards";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Wire — Latest Crypto Scam News — BTCSCAM.COM",
  description: "Community-verified reporting on the scams, drainers and exchange failures moving right now.",
};

// The categories offered as filter chips (the news-facing sections).
const NEWS_FILTERS = [
  "news",
  "threat-intel",
  "exchange-watch",
  "field-guide",
  "data",
  "community-win",
  "investigation",
] as const;

type SearchParams = Promise<{ category?: string }>;

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const active =
    sp.category && NEWS_FILTERS.includes(sp.category as (typeof NEWS_FILTERS)[number])
      ? sp.category
      : undefined;

  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      ...(active ? { category: active } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { author: true },
  });

  // v4 filter chip: 8px 14px · Geist 700 16px · active = ink fill, paper text.
  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      className={`px-3.5 py-2 font-sans font-bold text-[16px] uppercase border hover:no-underline ${
        isActive
          ? "bg-ink text-paper border-ink"
          : "bg-white text-body-2 border-rule hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <Container className="py-8 lg:py-12 fade-up">
      <PageHeader
        kicker="The Wire"
        title="News"
        lede="Everything crossing the desk — scam alerts, threat intel, exchange watch and field guides, newest first."
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {chip("All", "/news", !active)}
        {NEWS_FILTERS.map((cat) =>
          chip(categoryMeta(cat).label, `/news?category=${cat}`, active === cat),
        )}
      </div>

      {/* THE LATEST river (v4) */}
      <div className="mt-9">
        <div className="flex items-center gap-[18px]">
          <span className="kicker text-ink">The Latest</span>
          <div className="flex-1 border-t border-ink" />
        </div>
        {articles.length > 0 ? (
          articles.map((a, i) => (
            <ArticleRow key={a.id} article={a} caseNo={`No. ${String(1207 - i)}`} />
          ))
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Nothing on the wire here yet"
              hint={
                active
                  ? `No published stories filed under ${categoryMeta(active).label}. Try another section.`
                  : "Check back shortly — the desk files new reports daily."
              }
            />
          </div>
        )}
      </div>

      <p className="eyebrow mt-12 border-t border-rule pt-4">{SITE.disclaimer}</p>
    </Container>
  );
}
