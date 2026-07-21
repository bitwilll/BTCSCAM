import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, SectionHeader, Kicker, MediaPlaceholder, SeverityTag, EmptyState } from "@/components/ui";
import { ArticleCard, categoryMeta } from "@/components/content/cards";
import { byline } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Magazine — Investigations & Field Guides — BTCSCAM.COM",
  description: "Long-form investigations, deep field guides and the reporting behind the headlines.",
};

const MAG_CATEGORIES = ["investigation", "magazine", "field-guide"];

export default async function MagazinePage() {
  const user = await getSession();

  const [pieces, savedRows] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published", category: { in: MAG_CATEGORIES } },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 24,
      include: { author: true },
    }),
    user
      ? prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } })
      : Promise.resolve([]),
  ]);

  const savedSet = new Set(savedRows.map((r) => r.articleId));

  const [featured, ...rest] = pieces;
  const picks = rest.slice(0, 2);
  const more = rest.slice(2);
  const featuredMeta = featured ? categoryMeta(featured.category) : null;

  return (
    <>
      <Container className="py-8 lg:py-12">
        <PageHeader
          kicker="The Magazine"
          title="Long Reads"
          lede="The investigations, dossiers and field guides worth an hour of your attention — reported, sourced, and community-verified."
        />

        {featured && featuredMeta ? (
          <article className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start border-b border-line pb-12 mb-12">
            <Link href={`/article/${featured.slug}`} className="block order-1 lg:order-2">
              <MediaPlaceholder
                label={featured.coverLabel || `[ cover: ${featuredMeta.label} ]`}
                ratio="4/3"
              />
            </Link>
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-3">
                <Kicker color={featuredMeta.color}>{featured.kicker || featuredMeta.label}</Kicker>
                <SeverityTag severity={featured.severity} />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ink leading-[0.92]">
                <Link href={`/article/${featured.slug}`} className="hover:text-btc-dark">
                  {featured.title}
                </Link>
              </h2>
              {featured.dek && <p className="mt-4 text-lg text-ink-600">{featured.dek}</p>}
              <div className="mt-4 mono text-[11px] uppercase tracking-wide text-ink-500 flex flex-wrap gap-x-3 gap-y-1">
                {featured.author && (
                  <span className="text-ink-700 font-semibold">By {featured.author.displayName}</span>
                )}
                {featured.author?.title && <span>{featured.author.title}</span>}
                {featured.publishedAt && <span>{byline(featured.publishedAt)}</span>}
                <span>{featured.readMinutes} min read</span>
              </div>
              <Link
                href={`/article/${featured.slug}`}
                className="inline-block mt-5 kicker text-btc-dark hover:text-ink"
              >
                Read the full story →
              </Link>
            </div>
          </article>
        ) : (
          <EmptyState
            title="The issue is being typeset"
            hint="No long-form pieces are published yet. Check back soon."
          />
        )}

        {picks.length > 0 && (
          <section className="mb-12">
            <SectionHeader title="Editor's Picks" />
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {picks.map((a) => (
                <ArticleCard key={a.id} article={a} saved={savedSet.has(a.id)} />
              ))}
            </div>
          </section>
        )}

        {more.length > 0 && (
          <section>
            <SectionHeader title="Field Notes" action={{ label: "All News", href: "/news" }} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {more.map((a) => (
                <ArticleCard key={a.id} article={a} saved={savedSet.has(a.id)} compact />
              ))}
            </div>
          </section>
        )}
      </Container>

      <div className="bg-ink text-paper py-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <span className="kicker text-btc">{SITE.mission}</span>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-400">{SITE.disclaimer}</span>
        </Container>
      </div>
    </>
  );
}
