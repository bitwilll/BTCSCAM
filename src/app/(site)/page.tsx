import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, Kicker, MediaPlaceholder, SectionHeader, StatBlock, Tag } from "@/components/ui";
import { ArticleCard, TopStoryItem, ThreatBoardRow, categoryMeta } from "@/components/content/cards";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { byline, compactUsd } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSession();

  const [lead, developing, topStories, wire, threatBoard, todaysNumberSetting, savedRows] =
    await Promise.all([
      prisma.article.findFirst({
        where: { status: "published", isFeatured: true },
        orderBy: { publishedAt: "desc" },
        include: { author: true },
      }),
      prisma.article.findFirst({
        where: { status: "published", isDeveloping: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.article.findMany({
        where: { status: "published", isFeatured: false },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { author: true },
      }),
      prisma.article.findMany({
        where: { status: "published", category: { in: ["field-guide", "data", "community-win", "exchange-watch"] } },
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),
      prisma.scamEntry.findMany({ orderBy: { verifiedCount: "desc" }, take: 5 }),
      prisma.siteSetting.findUnique({ where: { key: "todays_number" } }),
      user
        ? prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } })
        : Promise.resolve([]),
    ]);

  const savedSet = new Set(savedRows.map((r) => r.articleId));
  const leadMeta = lead ? categoryMeta(lead.category) : null;
  const todaysNumber = todaysNumberSetting?.value ?? "$43.2M";

  return (
    <>
      {/* Developing strip */}
      {developing && (
        <div className="bg-paper-2 border-b border-line">
          <Container className="py-2.5 flex items-center gap-3">
            <Tag tone="red">Developing</Tag>
            <Link href={`/article/${developing.slug}`} className="font-bold text-ink hover:text-btc-dark truncate">
              {developing.title}
            </Link>
          </Container>
        </div>
      )}

      {/* Hero */}
      <Container className="py-8 lg:py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
          {/* Lead */}
          <div>
            {lead ? (
              <article>
                <div className="flex items-center gap-2 mb-3">
                  {lead.severity !== "none" && <Tag tone={lead.severity === "critical" ? "red" : "orange"}>{lead.severity}</Tag>}
                  <Kicker color={leadMeta!.color}>{lead.kicker || leadMeta!.label}</Kicker>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ink leading-[0.9]">
                  <Link href={`/article/${lead.slug}`} className="hover:text-btc-dark">
                    {lead.title}
                  </Link>
                </h1>
                {lead.dek && <p className="mt-4 text-lg sm:text-xl text-ink-600 max-w-2xl">{lead.dek}</p>}
                <div className="mt-4 mono text-[11px] uppercase tracking-wide text-ink-500 flex flex-wrap gap-x-3 gap-y-1">
                  {lead.author && <span className="text-ink-700 font-semibold">By {lead.author.displayName}</span>}
                  {lead.author?.title && <span>{lead.author.title}</span>}
                  {lead.publishedAt && <span>{byline(lead.publishedAt)}</span>}
                  <span>{lead.readMinutes} min read</span>
                </div>
                <Link href={`/article/${lead.slug}`} className="block mt-5">
                  <MediaPlaceholder
                    src={lead.coverImageUrl}
                    label={lead.coverLabel || "[ photo: lead investigation ]"}
                    ratio="16/8"
                  />
                </Link>
                <div className="mt-5">
                  <Link href={`/article/${lead.slug}`} className="kicker text-btc-dark hover:text-ink">
                    Continue Reading →
                  </Link>
                </div>
              </article>
            ) : (
              <div className="hatch h-64 flex items-center justify-center">
                <span className="kicker text-ink-500">No lead story yet — seed the database</span>
              </div>
            )}
          </div>

          {/* Right rail */}
          <aside className="lg:border-l lg:border-line lg:pl-8">
            <SectionHeader title="Top Stories" />
            <div>
              {topStories.map((a) => (
                <TopStoryItem key={a.id} article={a} />
              ))}
            </div>
            <div className="mt-6">
              <StatBlock label="Today's Number" value={todaysNumber} sub="currently at risk across tracked active scams" tone="red" />
            </div>
          </aside>
        </div>
      </Container>

      {/* Latest from the wire */}
      <div className="bg-paper-2 border-y border-line py-10">
        <Container>
          <SectionHeader title="Latest From The Wire" action={{ label: "Open Scam Database", href: "/database" }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {wire.map((a) => (
              <ArticleCard key={a.id} article={a} saved={savedSet.has(a.id)} />
            ))}
          </div>
        </Container>
      </div>

      {/* Threat board */}
      <Container className="py-12">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
          <div>
            <SectionHeader title="Threat Board — Most Community-Verified" action={{ label: "Open Full Database", href: "/database" }} />
            <div>
              {threatBoard.map((s, i) => (
                <ThreatBoardRow key={s.id} rank={i + 1} scam={s} />
              ))}
            </div>
          </div>
          {/* The Rug Report CTA */}
          <div className="bg-dark text-paper p-8 flex flex-col justify-center">
            <Kicker color="orange">The Rug Report</Kicker>
            <h2 className="font-display text-4xl text-paper mt-3 leading-none">
              The Sunday debrief on every scam that mattered this week.
            </h2>
            <p className="text-paper/70 mt-3">…and how to not be next.</p>
            <div className="mt-5">
              <NewsletterSignup list="rug-report" variant="dark" />
            </div>
            <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-3">
              84,120 readers · Free · Unsubscribe anytime
            </p>
          </div>
        </div>
      </Container>

      {/* Mission strip */}
      <div className="bg-ink text-paper py-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <span className="kicker text-btc">{SITE.mission}</span>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-400">{SITE.disclaimer}</span>
        </Container>
      </div>
    </>
  );
}
