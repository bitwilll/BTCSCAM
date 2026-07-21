import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { ArticleCard, categoryMeta } from "@/components/content/cards";
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
  const user = await getSession();

  const active =
    sp.category && NEWS_FILTERS.includes(sp.category as (typeof NEWS_FILTERS)[number])
      ? sp.category
      : undefined;

  const [articles, savedRows] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "published",
        ...(active ? { category: active } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: { author: true },
    }),
    user
      ? prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } })
      : Promise.resolve([]),
  ]);

  const savedSet = new Set(savedRows.map((r) => r.articleId));

  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      className={`kicker px-3 py-2 border transition-colors ${
        isActive
          ? "bg-ink text-paper border-ink"
          : "bg-paper text-ink-600 border-line-strong hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <Container className="py-8 lg:py-12">
      <PageHeader
        kicker="The Wire"
        title="News"
        lede="Everything crossing the desk — scam alerts, threat intel, exchange watch and field guides, newest first."
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {chip("All", "/news", !active)}
        {NEWS_FILTERS.map((cat) =>
          chip(categoryMeta(cat).label, `/news?category=${cat}`, active === cat),
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} saved={savedSet.has(a.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing on the wire here yet"
          hint={
            active
              ? `No published stories filed under ${categoryMeta(active).label}. Try another section.`
              : "Check back shortly — the desk files new reports daily."
          }
        />
      )}

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-12 border-t border-line pt-4">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
