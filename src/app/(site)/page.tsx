import Link from "next/link";
import { prisma } from "@/lib/db";
import { Kicker, SeverityTag, StatBlock } from "@/components/ui";
import { ArticleRow, TopStoryItem } from "@/components/content/cards";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { WalletCheckBar } from "./_components/WalletCheckBar";
import { NewsCarousel, type HeroSlide } from "@/components/site/NewsCarousel";
import { byline, compactUsd, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lead, recentForHero, latest, mostRead, homeAlerts, dbAgg, dbCount] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "published", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    }),
    // Newest published stories with a cover image — these auto-rotate in the hero.
    prisma.article.findMany({
      where: { status: "published", isFeatured: false, coverImageUrl: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { author: true },
    }),
    prisma.article.findMany({
      where: { status: "published", isFeatured: false },
      orderBy: { publishedAt: "desc" },
      take: 7,
      include: { author: true },
    }),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      take: 4,
    }),
    prisma.scamEntry.findMany({
      where: { severity: { in: ["critical", "high"] } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.scamEntry.aggregate({ _sum: { amountAtRiskUsd: true } }),
    prisma.scamEntry.count(),
  ]);

  const lossTotal = compactUsd(Number(dbAgg._sum.amountAtRiskUsd ?? 0));

  // Hero carousel: the featured investigation first, then the newest cover-image
  // stories (the Coldcard hack and other breaking items), de-duplicated to 6.
  const heroSeen = new Set<string>();
  const heroSlides: HeroSlide[] = [lead, ...recentForHero]
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .filter((a) => (heroSeen.has(a.slug) ? false : (heroSeen.add(a.slug), true)))
    .slice(0, 6)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      dek: a.dek,
      kicker: a.kicker || "Report",
      severity: a.severity,
      image: a.coverImageUrl,
      byline: `By ${a.author?.displayName ?? "The Watchdesk"} · ${a.readMinutes} min read`,
      credit:
        a.coverImageUrl && (a.coverLabel || "").toLowerCase().includes("painting")
          ? "Painting: Renaissance archive"
          : null,
    }));

  return (
    <div className="max-w-[1140px] mx-auto px-6 fade-up">
      {/* ── Full-bleed hero: auto-rotating latest-headlines carousel (6s) ── */}
      {heroSlides.length > 0 && <NewsCarousel slides={heroSlides} />}

      {/* ── DANGEROUS RIGHT NOW + wallet check (v4) ── */}
      <div className="mt-[52px] border-t border-b border-ink">
        <div className="flex items-baseline justify-between gap-3 pt-3 px-0.5 flex-wrap">
          <span className="kicker">
            <span
              className="inline-block w-2 h-2 bg-danger rounded-full mr-1"
              aria-hidden="true"
            />{" "}
            Dangerous right now
          </span>
          <Link href="/alerts" className="kicker text-meta hover:text-ink">
            All alerts →
          </Link>
        </div>
        <div
          className="grid py-2.5 pb-4"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}
        >
          {homeAlerts.map((s) => (
            <Link
              key={s.id}
              href={`/database/${s.slug}`}
              className="py-2 pr-[18px] pl-0.5 hover:no-underline group"
            >
              <div className="flex gap-2.5 items-baseline justify-between">
                <SeverityTag severity={s.severity} />
                <span className="text-[14px] text-meta">{timeAgo(s.updatedAt)}</span>
              </div>
              <div className="mt-1.5 font-display text-[21px] leading-[1.3] text-ink group-hover:underline underline-offset-4 decoration-1">
                {s.name}
              </div>
            </Link>
          ))}
        </div>
        <WalletCheckBar />
      </div>

      {/* ── heavy double divider (v4) ── */}
      <div className="mt-[68px] rule-stack">
        <div />
      </div>

      {/* ── THE LATEST + MOST READ ── */}
      <div className="flex gap-11 flex-wrap mt-2">
        <div className="min-w-0" style={{ flex: "2.2 1 480px" }}>
          <div className="flex items-center gap-[18px] mt-4">
            <span className="kicker">The Latest</span>
            <div className="flex-1 border-t border-ink" />
          </div>
          {latest.map((a, i) => (
            <ArticleRow
              key={a.id}
              article={a}
              caseNo={`No. ${String(1207 - i)}`}
              showDek={i < 3}
            />
          ))}
        </div>

        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div className="flex items-center gap-[18px] mt-4">
            <span className="kicker">Most Read</span>
            <div className="flex-1 border-t border-ink" />
          </div>
          {mostRead.map((a, i) => (
            <TopStoryItem key={a.id} article={a} rank={i + 1} />
          ))}
          <div className="mt-6">
            <StatBlock
              dark
              label="From the Database"
              value={lossTotal}
              sub={`currently at risk across ${dbCount} tracked scams`}
            />
            <Link
              href="/database"
              className="inline-block -mt-3 relative z-10 ml-5 kicker text-paper border-b border-brand pb-0.5 hover:no-underline"
              style={{ marginTop: "-44px", position: "relative" }}
            >
              Open the database →
            </Link>
          </div>
        </div>
      </div>

      {/* ── The Rug Report CTA (double-ruled box, v4) ── */}
      <div
        className="mx-auto mt-[68px] max-w-[820px] text-center"
        style={{ border: "3px double var(--ink)", padding: "42px 36px" }}
      >
        <div className="kicker text-meta">The Sunday Debrief</div>
        <div
          className="mt-3 font-display"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
        >
          The Rug Report
        </div>
        <p className="mt-3.5 mx-auto text-[18px] leading-[1.6] max-w-[46ch]" style={{ color: "#44413B" }}>
          Every scam that mattered this week — and how not to be next. Read by people who would
          rather learn the easy way.
        </p>
        <div className="mt-6 max-w-md mx-auto">
          <NewsletterSignup list="rug-report" variant="light" />
        </div>
        <div className="mt-3.5 text-[14px] text-meta uppercase tracking-[.02em]">
          Free · no spam · unsubscribe anytime
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
