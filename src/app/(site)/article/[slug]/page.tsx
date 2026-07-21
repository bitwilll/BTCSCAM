import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Avatar, MediaPlaceholder, SeverityTag, StatBlock } from "@/components/ui";
import { categoryMeta } from "@/components/content/cards";
import { SaveButton } from "@/components/content/SaveButton";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { CopyLinkButton } from "./_components/CopyLinkButton";
import { byline, compactUsd } from "@/lib/format";
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

// ── v4 body parser ────────────────────────────────────────────────────────
// "## "  → Fraunces h2 · "### " (+ following "- " lines) → orange-top
// checklist card · "> " → blockquote · bare "- " lines → prose-bs ul · else p.
type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "checklist"; title: string; items: string[] }
  | { kind: "list"; items: string[] };

function parseBody(body: string): Block[] {
  const raw = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const blocks: Block[] = [];

  for (let i = 0; i < raw.length; i++) {
    const block = raw[i];
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (block.startsWith("### ")) {
      const title = lines[0].slice(4).trim();
      let items = lines
        .slice(1)
        .filter((l) => l.startsWith("- "))
        .map((l) => l.slice(2).trim());
      if (items.length === 0 && i + 1 < raw.length) {
        const next = raw[i + 1]
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (next.length > 0 && next.every((l) => l.startsWith("- "))) {
          items = next.map((l) => l.slice(2).trim());
          i++;
        }
      }
      blocks.push({ kind: "checklist", title, items });
      continue;
    }
    if (block.startsWith("## ")) {
      blocks.push({ kind: "h2", text: block.slice(3).trim() });
      continue;
    }
    if (block.startsWith("> ")) {
      blocks.push({ kind: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join(" ") });
      continue;
    }
    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "list", items: lines.map((l) => l.slice(2).trim()) });
      continue;
    }
    blocks.push({ kind: "p", text: block });
  }
  return blocks;
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((b, i) => {
    switch (b.kind) {
      case "h2":
        return <h2 key={i}>{b.text}</h2>;
      case "quote":
        return <blockquote key={i}>“{b.text}”</blockquote>;
      case "list":
        return (
          <ul key={i}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        );
      case "checklist":
        return (
          <div
            key={i}
            className="bg-paper text-ink border border-ink px-7 py-[26px]"
            style={{ marginTop: 34, borderTop: "4px solid var(--brand)" }}
          >
            <div className="kicker text-meta">{b.title}</div>
            <div className="flex flex-col gap-3 mt-3.5">
              {b.items.map((it, j) => (
                <div key={j} className="flex gap-3 text-[16px] leading-[1.5]">
                  <span className="flex-none w-1.5 h-1.5 bg-brand mt-2" aria-hidden="true" />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <p key={i}>{b.text}</p>;
    }
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

  const [related, suggestedRaw, savedRows, dbAgg, dbCount] = await Promise.all([
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
    prisma.article.findMany({
      where: { status: "published", id: { not: article.id } },
      orderBy: { viewCount: "desc" },
      take: 6,
      include: { author: true },
    }),
    user
      ? prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } })
      : Promise.resolve([]),
    prisma.scamEntry.aggregate({ _sum: { amountAtRiskUsd: true } }),
    prisma.scamEntry.count(),
  ]);

  const savedSet = new Set(savedRows.map((r) => r.articleId));
  const relatedIds = new Set(related.map((r) => r.id));
  const suggested = suggestedRaw.filter((a) => !relatedIds.has(a.id)).slice(0, 3);
  const lossTotal = compactUsd(Number(dbAgg._sum.amountAtRiskUsd ?? 0));
  const meta = categoryMeta(article.category);
  const kickerLabel = article.kicker || meta.label;
  const blocks = parseBody(article.body);

  return (
    <div className="max-w-[1360px] mx-auto px-6 pt-8 fade-up">
      {/* ── centered breadcrumb (v4) ── */}
      <div className="text-center text-[14px] text-meta tracking-[.05em] uppercase">
        <Link href="/" className="text-ink font-bold hover:underline underline-offset-4">
          Front page
        </Link>{" "}
        / {kickerLabel}
      </div>

      {/* ── two-column flex: article 2.1 / rail 1 (v4) ── */}
      <div className="flex flex-wrap gap-10 mt-[18px]">
        <article className="min-w-0 max-w-[840px]" style={{ flex: "2.1 1 560px" }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <SeverityTag severity={article.severity} />
            <span className="kicker text-meta">{kickerLabel}</span>
          </div>

          <h1
            className="mt-3.5 font-display text-ink"
            style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.12, textWrap: "balance" }}
          >
            {article.title}
          </h1>

          {article.dek && (
            <p
              className="mt-[18px] text-[18px] leading-[1.6] text-body-2"
              style={{ textWrap: "pretty" }}
            >
              {article.dek}
            </p>
          )}

          {/* byline bar: ink rule above, hairline below (v4) */}
          <div className="mt-5 flex justify-between items-center gap-3.5 flex-wrap border-t border-ink border-b border-rule py-3.5">
            <div className="flex gap-3 items-center min-w-0">
              <Avatar name={article.author?.displayName ?? "The Watchdesk"} size={44} />
              <div className="min-w-0">
                <div className="font-bold text-[16px] uppercase text-ink">
                  {article.author?.displayName ?? "The Watchdesk"}
                </div>
                <div className="mt-0.5 text-[14px] text-meta">
                  {article.author?.title ? `${article.author.title} · ` : ""}
                  {article.publishedAt ? `${byline(article.publishedAt)} · ` : ""}
                  {article.readMinutes} min read
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <SaveButton articleId={article.id} initialSaved={savedSet.has(article.id)} />
              <CopyLinkButton />
            </div>
          </div>

          {/* painting hero 16/8.5 + credit (v4) */}
          <div className="mt-[22px]">
            <MediaPlaceholder
              src={article.coverImageUrl}
              label={article.coverLabel || `[ photo: ${meta.label} ]`}
              ratio="16/8.5"
            />
            {(article.coverImageUrl || article.sourceName) && (
              <div className="mt-2 text-[14px] text-meta">
                {article.coverImageUrl && "Painting: Renaissance archive"}
                {article.coverImageUrl && article.sourceName && " · "}
                {article.sourceName && (
                  <>
                    Source:{" "}
                    {article.sourceUrl ? (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-4"
                      >
                        {article.sourceName}
                      </a>
                    ) : (
                      article.sourceName
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* body */}
          <div className="prose-bs mt-5">{renderBlocks(blocks)}</div>

          {/* inline Rug Report strip: masthead + double rule top (v4) */}
          <div className="mt-10 bg-masthead rule-double-top px-6 py-[22px] flex items-center flex-wrap gap-x-6 gap-y-3.5">
            <div className="min-w-0" style={{ flex: "1 1 260px" }}>
              <div className="kicker text-accent">The Rug Report</div>
              <div className="mt-1 font-display text-[21px] leading-[1.3] text-ink">
                Every scam that mattered this week, each Sunday.
              </div>
            </div>
            <div className="min-w-0" style={{ flex: "1 1 300px" }}>
              <NewsletterSignup list="rug-report" variant="light" cta="Subscribe" />
            </div>
          </div>

          <p className="eyebrow mt-8">{SITE.disclaimer}</p>
        </article>

        {/* ── right rail: READ NEXT + dark stat (v4) ── */}
        <aside className="min-w-0" style={{ flex: "1 1 280px" }}>
          <div className="lg:sticky lg:top-[86px]">
            <div className="flex items-center gap-[18px]">
              <span className="kicker text-meta">Read Next</span>
              <div className="flex-1 border-t border-ink" />
            </div>
            {related.length > 0 ? (
              related.map((a) => (
                <Link
                  key={a.id}
                  href={`/article/${a.slug}`}
                  className="block py-4 border-b border-rule group hover:no-underline"
                >
                  <div className="kicker text-accent">
                    {a.kicker || categoryMeta(a.category).label}
                  </div>
                  <span className="block mt-2 font-display text-[21px] leading-[1.3] text-ink group-hover:underline underline-offset-4 decoration-1">
                    {a.title}
                  </span>
                  <div className="mt-2 text-[14px] text-meta">{a.readMinutes} min read</div>
                </Link>
              ))
            ) : (
              <p className="py-4 text-[14px] text-meta border-b border-rule">
                Nothing else filed under {meta.label} yet.
              </p>
            )}
            <div className="mt-6">
              <StatBlock
                dark
                label="From the Database"
                value={lossTotal}
                sub={`currently at risk across ${dbCount} tracked scams`}
              />
              <Link
                href="/database"
                className="inline-block relative z-10 ml-5 kicker text-paper border-b border-brand pb-0.5 hover:no-underline"
                style={{ marginTop: "-44px", position: "relative" }}
              >
                Check the database →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MORE TO READ (v4) ── */}
      {suggested.length > 0 && (
        <div className="mt-16 border-t border-ink pt-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="kicker text-ink">More to read</span>
            <Link href="/" className="kicker text-accent hover:underline underline-offset-4">
              Front page →
            </Link>
          </div>
          <div
            className="grid gap-7 mt-[22px] pb-2"
            style={{ gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}
          >
            {suggested.map((s) => (
              <Link key={s.id} href={`/article/${s.slug}`} className="block group hover:no-underline">
                <MediaPlaceholder
                  src={s.coverImageUrl}
                  label={s.coverLabel || `[ ${categoryMeta(s.category).label} ]`}
                  ratio="16/10"
                />
                <div className="mt-3 kicker text-accent">
                  {s.kicker || categoryMeta(s.category).label}
                </div>
                <span className="block mt-1.5 font-display text-[21px] leading-[1.3] text-ink group-hover:underline underline-offset-4 decoration-1">
                  {s.title}
                </span>
                <div className="mt-2 text-[14px] text-meta">
                  By {s.author?.displayName ?? "The Watchdesk"} · {s.readMinutes} min read
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}
