import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Container,
  Kicker,
  SectionHeader,
  MediaPlaceholder,
  Tag,
  StatBlock,
  ButtonLink,
} from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { compactUsd, num } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "For Satoshi — Documentary Fundraiser | BTCSCAM.COM",
  description:
    "Help fund 'For Satoshi', a feature documentary on the people fighting crypto scams. Crypto-only, community-funded.",
};

// Campaign goal and the community total raised toward the film to date. The
// on-record baseline (pledged in earlier community drives) is combined with the
// live sum of confirmed donations so the progress bar reflects real activity.
const GOAL_USD = 250_000;
const CAMPAIGN_BASELINE_USD = 184_600;

const PERKS = [
  {
    price: "$25",
    name: "Watchman",
    label: "[ perk: name in credits ]",
    items: ["Your name in the scrolling credits", "Backer-only production updates", "Digital thank-you card"],
  },
  {
    price: "$100",
    name: "Field Producer",
    label: "[ perk: signed poster ]",
    items: ["Everything in Watchman", "Signed broadsheet-print poster", "Early streaming link before public release"],
    featured: true,
  },
  {
    price: "$500",
    name: "Associate Producer",
    label: "[ perk: associate producer credit ]",
    items: ["Everything in Field Producer", "Associate Producer credit", "Invite to a virtual cast & crew Q&A"],
  },
  {
    price: "$2,500",
    name: "Executive Producer",
    label: "[ perk: executive producer credit ]",
    items: ["Everything in Associate Producer", "Executive Producer credit on-screen & IMDb", "Two tickets to the premiere screening"],
  },
];

export default async function FilmFundraiserPage() {
  const [confirmedAgg, backerCount] = await Promise.all([
    prisma.donation.aggregate({ _sum: { amountUsd: true }, where: { status: "confirmed" } }),
    prisma.donation.count(),
  ]);

  const liveConfirmedUsd = (confirmedAgg._sum.amountUsd ?? 0) / 100;
  const raisedUsd = CAMPAIGN_BASELINE_USD + liveConfirmedUsd;
  const pct = Math.min(100, Math.round((raisedUsd / GOAL_USD) * 100));
  const remainingUsd = Math.max(0, GOAL_USD - raisedUsd);

  return (
    <>
      {/* Hero */}
      <div className="bg-dark text-paper">
        <Container className="py-14 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tag tone="red">Now Filming</Tag>
                <Kicker color="orange">Documentary Fundraiser</Kicker>
              </div>
              <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.85] text-paper">
                For Satoshi
              </h1>
              <p className="mt-5 text-lg text-paper/70 max-w-xl">
                A feature documentary about the volunteers, investigators, and victims on the front
                line of the crypto-scam epidemic — and the community that refuses to look away.
              </p>
              <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-5">
                A BTCSCAM.COM Production · Crypto-funded · No studio, no advertisers
              </p>
            </div>
            <MediaPlaceholder label="[ still: 'For Satoshi' — teaser frame ]" ratio="16/10" dark />
          </div>
        </Container>
      </div>

      {/* Progress */}
      <Container className="py-12">
        <div className="border-2 border-ink bg-paper p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <div className="eyebrow mb-1">Raised so far</div>
              <div className="font-display text-5xl sm:text-6xl text-ink leading-none">
                {compactUsd(raisedUsd)}
                <span className="text-ink-400 text-2xl sm:text-3xl"> / {compactUsd(GOAL_USD)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-4xl text-btc-dark leading-none">{pct}%</div>
              <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1">
                of goal funded
              </div>
            </div>
          </div>

          <div
            className="h-4 w-full bg-panel border border-line-strong overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fundraising progress"
          >
            <div className="h-full bg-btc" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <StatBlock label="Still needed" value={compactUsd(remainingUsd)} sub="to reach the goal" tone="orange" />
            <StatBlock label="Backers" value={num(backerCount)} sub="community supporters" />
            <StatBlock label="Payment" value="Crypto" sub="BTC, ETH, USDT & more" />
          </div>
        </div>
      </Container>

      {/* Story */}
      <div className="bg-paper-2 border-y border-line py-12">
        <Container>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            <div>
              <SectionHeader title="The Story" />
              <div className="prose-bs text-ink-700 space-y-4 max-w-xl">
                <p>
                  In 2026, crypto scams drained an estimated <strong>$2.1B</strong> from ordinary
                  people in a single quarter. Behind every headline number is a person who lost a
                  down payment, a retirement, a sense of trust.
                </p>
                <p>
                  <em>For Satoshi</em> follows the community that formed to fight back: the on-chain
                  tracers who map drainer wallets at 3 a.m., the volunteers who talk victims through
                  the first terrible 24 hours, and the investigators who go undercover inside
                  fake-recovery operations.
                </p>
                <p>
                  It&apos;s not a film about getting rich. It&apos;s a film about the people who
                  decided that <strong>&ldquo;verify everything&rdquo;</strong> was worth building a
                  movement around.
                </p>
              </div>
            </div>
            <div>
              <SectionHeader title="Where The Money Goes" />
              <ul className="space-y-3">
                {[
                  ["Field production", "Travel, cameras, and secure comms for on-the-ground shoots across three continents."],
                  ["Victim protection", "Anonymization, legal review, and consent work so no contributor is put at risk."],
                  ["Post & scoring", "Editing, on-chain data visualization, and an original score."],
                  ["Free distribution", "A community edition released with no paywall, forever."],
                ].map(([h, b]) => (
                  <li key={h} className="border border-line bg-paper p-4">
                    <div className="kicker text-btc-dark">{h}</div>
                    <p className="text-sm text-ink-600 mt-1.5 leading-snug">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Perk tiers */}
      <Container className="py-12">
        <SectionHeader title="Perk Tiers" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col border bg-paper ${
                p.featured ? "border-2 border-ink" : "border-line"
              }`}
            >
              <MediaPlaceholder label={p.label} ratio="16/10" />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-4xl text-ink leading-none">{p.price}</span>
                  {p.featured && <Tag tone="orange">Popular</Tag>}
                </div>
                <div className="kicker text-btc-dark mt-2">{p.name}</div>
                <ul className="mt-3 space-y-1.5 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="text-sm text-ink-600 leading-snug flex gap-2">
                      <span className="text-btc-dark shrink-0">+</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-4">
          Perks are honored at the USD value sent, computed at time of transaction. Include your
          email in the pledge so we can reach you about credits and rewards.
        </p>
      </Container>

      {/* Contribute */}
      <div className="bg-paper-2 border-y border-line py-12">
        <Container>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
            <div>
              <SectionHeader title="Back The Film" />
              <p className="text-ink-600 max-w-xl">
                Contributions are crypto-only — no studio, no card processor, no strings. Send any
                amount to fund the next shoot. Want your name in the credits or a producer credit?
                Record your gift on the{" "}
                <Link href="/donate" className="text-btc-dark underline">
                  donation page
                </Link>{" "}
                with your email and tier.
              </p>
              <div className="mt-5">
                <ButtonLink href="/donate" variant="dark" size="lg">
                  Record a pledge →
                </ButtonLink>
              </div>
            </div>
            <CryptoPay />
          </div>
        </Container>
      </div>

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
