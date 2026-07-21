import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Kicker, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Magazine — Investigations & Field Guides — BTCSCAM.COM",
  description: "Long-form investigations, deep field guides and the reporting behind the headlines.",
};

const MAG_CATEGORIES = ["investigation", "magazine", "field-guide"];

const CURRENT_COVER =
  "https://commons.wikimedia.org/wiki/Special:FilePath/The_Triumph_of_Death_by_Pieter_Bruegel_the_Elder.jpg?width=1200";

const BACK_ISSUES = [
  {
    n: "Issue 02",
    season: "Spring 2026",
    title: "Exit Liquidity",
    dek: "Anatomy of five exchange collapses — and the 23-day warning window.",
    cover:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg?width=600",
  },
  {
    n: "Issue 01",
    season: "Winter 2026",
    title: "The First Rug",
    dek: "Launch issue: a natural history of crypto scams, 2011 to today.",
    cover:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Jheronimus_Bosch_011.jpg?width=600",
  },
];

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
  const contents = pieces.slice(0, 6);

  return (
    <div className="fade-up">
      {/* ── Manifesto hero (v4) ── */}
      <div className="border-b border-ink">
        <div className="max-w-[920px] mx-auto px-6 py-20 text-center">
          <Kicker color="accent">BTC Scam Press · Quarterly · Ad-free</Kicker>
          <h1
            className="font-display mt-5"
            style={{ fontSize: "clamp(38px,5vw,64px)", lineHeight: 1.12, textWrap: "balance" }}
          >
            Ideas for a Bitcoin that doesn&apos;t eat its readers.
          </h1>
          <p
            className="mt-5 mx-auto text-[18px] leading-[1.65] text-body-2 max-w-[52ch]"
            style={{ textWrap: "pretty" }}
          >
            Long-form investigations, field guides and history — printed on paper, free online
            forever.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <ButtonLink href="/subscribe" variant="primary" size="lg">
              Subscribe in print — $48/yr
            </ButtonLink>
            <ButtonLink href="#current-issue" variant="ghost" size="lg">
              Read free online
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Current issue on masthead cream (v4) ── */}
      <div id="current-issue" className="bg-masthead border-b border-ink scroll-mt-24">
        <div className="max-w-[1140px] mx-auto px-6 py-[72px] flex flex-wrap items-center gap-14">
          <div className="min-w-0 flex justify-center" style={{ flex: "1 1 320px" }}>
            <Link
              href="/news"
              aria-label="Issue 03 cover: Bruegel, The Triumph of Death — read online"
              className="block border border-ink -rotate-2 hover:rotate-0 hover:-translate-y-1.5 transition-transform duration-200"
              style={{
                width: "min(360px,100%)",
                aspectRatio: "3/4",
                boxShadow: "18px 22px 40px rgba(16,16,16,.22)",
                backgroundColor: "#F1EDE2",
                backgroundImage: `linear-gradient(to top, rgba(10,10,8,.55) 0%, rgba(10,10,8,0) 55%), url(${CURRENT_COVER})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 18,
              }}
            >
              <span className="flex justify-between items-start gap-2">
                <span className="bg-paper text-ink border border-ink px-2.5 py-1 text-[14px] tracking-[.05em] uppercase">
                  BTC Scam Magazine
                </span>
                <span className="bg-brand text-ink border border-ink px-2.5 py-1 text-[14px] tracking-[.05em] uppercase">
                  No. 03
                </span>
              </span>
              <span
                className="font-display text-paper"
                style={{ fontSize: 32, lineHeight: 1.05, textShadow: "0 2px 14px rgba(0,0,0,.55)" }}
              >
                The Drainer Economy
              </span>
            </Link>
          </div>

          <div className="min-w-0" style={{ flex: "1.2 1 380px" }}>
            <Kicker color="accent">The Summer &apos;26 edition</Kicker>
            <h2
              className="font-display mt-3"
              style={{ fontSize: "clamp(34px,4.2vw,54px)", lineHeight: 1.06 }}
            >
              The Drainer Economy
            </h2>
            <p className="mt-4 text-[18px] leading-[1.65] text-body-2 max-w-[48ch]">
              Kits, affiliates and the $99-a-week subscription to crime. 128 pages, no ads.
            </p>

            {/* Issue contents — published magazine / investigation pieces */}
            {contents.length > 0 && (
              <div className="mt-7 border-t border-ink">
                {contents.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/article/${a.slug}`}
                    className="flex gap-4 items-baseline py-3.5 border-b border-rule group hover:bg-surface-dim hover:no-underline"
                  >
                    <span className="flex-none font-display italic text-[18px] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="font-display text-[18px] group-hover:underline underline-offset-4 decoration-1">
                        {a.title}
                      </span>
                      {a.dek && <span className="text-[16px] text-meta"> — {a.dek}</span>}
                      {savedSet.has(a.id) && (
                        <span className="eyebrow text-accent ml-2">Saved</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <ButtonLink href="/news" variant="primary" size="lg" className="mt-6">
              Read the digital edition →
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Back catalog (v4) ── */}
      <div className="max-w-[1140px] mx-auto px-6 pt-[72px] pb-16">
        <div className="text-center">
          <Kicker color="accent">The catalog</Kicker>
          <h2 className="font-display mt-2.5" style={{ fontSize: "clamp(26px,3vw,36px)" }}>
            Every edition, free online forever
          </h2>
        </div>
        <div
          className="grid mt-11 mx-auto max-w-[760px]"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 44 }}
        >
          {BACK_ISSUES.map((i) => (
            <Link key={i.n} href="/news" className="block text-center group hover:no-underline">
              <div
                className="border border-ink bg-surface-alt bg-cover bg-center transition-transform duration-200 group-hover:-translate-y-1.5"
                style={{
                  aspectRatio: "3/4",
                  boxShadow: "10px 14px 28px rgba(16,16,16,.18)",
                  backgroundImage: `url(${i.cover})`,
                }}
                role="img"
                aria-label={`Cover: ${i.title}`}
              />
              <div className="kicker text-accent mt-[18px]">
                {i.n} · {i.season}
              </div>
              <div className="font-display text-[21px] mt-1.5 group-hover:underline underline-offset-4 decoration-1">
                {i.title}
              </div>
              <p className="mt-2 mx-auto text-[16px] leading-[1.55] text-body-2 max-w-[34ch]">
                {i.dek}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10 text-[14px] text-meta tracking-[.05em] uppercase">
          Print runs sell out · Every issue stays free online
        </div>
      </div>
    </div>
  );
}
