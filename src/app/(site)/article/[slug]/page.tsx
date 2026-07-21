import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, Kicker, MediaPlaceholder, SectionHeader, SeverityTag } from "@/components/ui";
import { ArticleCard, categoryMeta } from "@/components/content/cards";
import { SaveButton } from "@/components/content/SaveButton";
import { byline } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, dek: true },
  });
  if (!article) return { title: "Article not found — BTCSCAM.COM" };
  return {
    title: `${article.title} — BTCSCAM.COM`,
    description: article.dek ?? SITE.tagline,
  };
}

// Split the stored markdown-ish body into simple block elements.
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="font-display text-2xl text-ink mt-8 mb-3">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-3xl text-ink mt-10 mb-3">
          {block.slice(3)}
        </h2>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await getSession();

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!article) notFound();

  const [related, savedRows] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "published",
        category: article.category,
        id: { not: article.id },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { author: true },
    }),
    user
      ? prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } })
      : Promise.resolve([]),
  ]);

  const savedSet = new Set(savedRows.map((r) => r.articleId));
  const meta = categoryMeta(article.category);

  return (
    <>
      <Container className="py-8 lg:py-12">
        <div className="mb-6">
          <Link href="/news" className="kicker text-ink-500 hover:text-btc-dark">
            ← Back to The Wire
          </Link>
        </div>

        <article>
          {/* Header */}
          <header className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Kicker color={meta.color}>{article.kicker || meta.label}</Kicker>
              <SeverityTag severity={article.severity} />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink leading-[0.9]">
              {article.title}
            </h1>

            {article.dek && (
              <p className="mt-4 text-lg sm:text-xl text-ink-600">{article.dek}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
              <div className="mono text-[11px] uppercase tracking-wide text-ink-500 flex flex-wrap gap-x-3 gap-y-1">
                {article.author && (
                  <span className="text-ink-700 font-semibold">By {article.author.displayName}</span>
                )}
                {article.author?.title && <span>{article.author.title}</span>}
                {article.publishedAt && <span>{byline(article.publishedAt)}</span>}
                <span>{article.readMinutes} min read</span>
              </div>
              <SaveButton articleId={article.id} initialSaved={savedSet.has(article.id)} />
            </div>
          </header>

          {/* Cover */}
          <div className="mt-6">
            <MediaPlaceholder
              src={article.coverImageUrl}
              label={article.coverLabel || `[ photo: ${meta.label} ]`}
              ratio="16/8"
            />
            {article.sourceName && (
              <p className="mono text-[11px] text-ink-500 mt-2 uppercase tracking-wide">
                Source:{" "}
                {article.sourceUrl ? (
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-btc-dark underline">
                    {article.sourceName}
                  </a>
                ) : (
                  article.sourceName
                )}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="prose-bs max-w-3xl mt-8">{renderBody(article.body)}</div>

          {/* Disclaimer */}
          <p className="max-w-3xl mono text-[11px] uppercase tracking-wide text-ink-400 mt-10 border-t border-line pt-4">
            {SITE.disclaimer}
          </p>
        </article>
      </Container>

      {/* Related */}
      {related.length > 0 && (
        <div className="bg-paper-2 border-y border-line py-10">
          <Container>
            <SectionHeader
              title={`More In ${meta.label}`}
              action={{ label: "Open The Wire", href: "/news" }}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} saved={savedSet.has(a.id)} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
