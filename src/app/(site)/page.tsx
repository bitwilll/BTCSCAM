import Link from "next/link";
import { prisma } from "@/lib/db";
import { Kicker, SeverityTag, StatBlock } from "@/components/ui";
import { ArticleRow, TopStoryItem } from "@/components/content/cards";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { WalletCheckBar } from "./_components/WalletCheckBar";
import { byline, compactUsd, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lead, latest, mostRead, homeAlerts, dbAgg, dbCount] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "published", isFeatured: true },
      orderBy: { publishedAt: "desc" },
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

  return (
    <div className="max-w-[1140px] mx-auto px-6 fade-up">
      {/* ── Full-bleed lead: painting + gradient, bottom-aligned (v4) ── */}
      {lead && (
        <Link
          href={`/article/${lead.slug}`}
          className="relative block w-screen hover:no-underline"
          style={{
            marginLeft: "calc(50% - 50vw)",
            minHeight: "calc(100vh - 220px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            backgroundColor: "#101010",
            backgroundImage: `linear-gradient(to top, rgba(10,10,8,.88) 0%, rgba(10,10,8,.45) 45%, rgba(10,10,8,.15) 100%)${
              lead.coverImageUrl ? `, url(${lead.coverImageUrl})` : ""
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full max-w-[1140px] px-6">
            <div className="py-10" style={{ paddingInline: "clamp(24px,4vw,48px)" }}>
              <div className="kicker text-brand">{lead.kicker || "Investigation"}</div>
              <span
                className="block mt-3.5 font-display text-paper max-w-[22ch]"
                style={{ fontSize: "clamp(32px,4.5vw,54px)", lineHeight: 1.1, textWrap: "balance" }}
              >
                {lead.title}
              </span>
              {lead.dek && (
                <p
                  className="mt-4 text-[18px] leading-[1.6] max-w-[52ch]"
                  style={{ color: "rgba(252,251,249,.85)", textWrap: "pretty" }}
                >
                  {lead.dek}
                </p>
              )}
              <div
                className="mt-4 text-[14px] tracking-[.05em] uppercase"
                style={{ color: "rgba(252,251,249,.65)" }}
              >
                By <span className="text-paper font-bold">{lead.author?.displayName ?? "The Watchdesk"}</span> ·{" "}
                {lead.readMinutes} min read
                {lead.coverImageUrl ? " · Painting: Renaissance archive" : ""}
              </div>
            </div>
          </div>
        </Link>
      )}

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
