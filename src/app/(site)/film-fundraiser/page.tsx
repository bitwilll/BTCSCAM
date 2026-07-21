import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { num } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rugged — Feature Film Fundraiser | BTCSCAM.COM",
  description:
    "Help fund 'Rugged', a documentary feature tracing one pig-butchering ring from first DM to courtroom. Crypto-only, community-funded, all-or-nothing.",
};

// Campaign goal and the community total raised toward the film to date. The
// on-record baseline (pledged in earlier community drives) is combined with the
// live sum of confirmed donations so the progress bar reflects real activity.
const GOAL_USD = 1_200_000;
const CAMPAIGN_BASELINE_USD = 487_000;

const TIERS = [
  {
    name: "WATCHMAN",
    price: "$25",
    perks: ["Digital premiere stream", "Name in the thank-you crawl"],
  },
  {
    name: "PRODUCER",
    price: "$250",
    perks: ["Premiere ticket + cast Q&A", "Numbered A2 poster", "Everything in WATCHMAN"],
  },
  {
    name: "EXECUTIVE",
    price: "$2,500",
    perks: ["Set visit + table read", "Executive thanks credit", "Everything in PRODUCER"],
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

  return (
    <div className="fade-up">
      {/* ── Dark hero (v4) ── */}
      <div className="border-b-4 border-brand bg-dark">
        <div className="mx-auto w-full max-w-[1100px] px-6 py-[52px] text-center">
          <div className="font-sans font-bold text-[16px] uppercase tracking-[.05em] text-brand">
            BTC Scam · Feature film fundraiser
          </div>
          <h1
            className="mt-3 font-display text-paper"
            style={{ fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 0.95 }}
          >
            Rugged
          </h1>
          <p className="mx-auto mt-[18px] max-w-[56ch] text-[18px] leading-[1.6] text-ticker">
            A documentary feature tracing one pig-butchering ring from first DM to courtroom — told
            by the victims who fought back.
          </p>

          {/* ── Progress ── */}
          <div className="mx-auto mt-[30px] max-w-[640px] text-left">
            <div className="flex flex-wrap justify-between gap-2.5 font-sans font-bold text-[16px] uppercase tracking-[.02em]">
              <span className="text-brand">
                Raised ${num(Math.round(raisedUsd))} · Goal ${num(GOAL_USD)}
              </span>
              <span className="text-up">{pct}% funded</span>
            </div>
            <div
              className="mt-2 h-[14px] border border-ink bg-surface-alt"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Fundraising progress"
            >
              <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-[16px] uppercase tracking-[.02em] text-meta">
              {num(backerCount)} backers · 23 days left · All-or-nothing
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier cards ── */}
      <div className="mx-auto w-full max-w-[1100px] px-6 pt-8">
        <div
          className="grid items-stretch gap-[18px]"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}
        >
          {TIERS.map((t) => (
            <div key={t.name} className="flex flex-col gap-3 border border-ink bg-white p-[22px]">
              <div className="flex items-baseline justify-between gap-2.5">
                <span className="font-sans font-bold text-[21px] tracking-[-0.01em] text-ink">
                  {t.name}
                </span>
                <span className="font-sans font-black text-[24px] text-ink">{t.price}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {t.perks.map((perk) => (
                  <div key={perk} className="flex gap-2.5 text-[16px] leading-[1.5] text-ink">
                    <span className="mt-[7px] h-1.5 w-1.5 flex-none bg-brand" aria-hidden="true" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
              {/* v4-sanctioned orange tier button */}
              <Link
                href="/donate"
                className="block w-full border border-ink bg-brand px-3 py-3 text-center font-sans font-bold text-[16px] uppercase tracking-[.05em] text-ink hover:bg-ink hover:text-paper hover:no-underline"
              >
                Back this tier
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-[16px] leading-[1.6] text-meta">
          FISCALLY HOSTED BY THE BTCSCAM NON-PROFIT. IF THE GOAL ISN&apos;T MET, EVERY PLEDGE IS
          RETURNED. OVERAGES FUND VICTIM SUPPORT.
        </div>
      </div>

      {/* ── Send crypto ── */}
      <div className="mx-auto w-full max-w-[1100px] px-6 pt-12">
        <SectionHeader title="Back the film" />
        <p className="mb-4 max-w-[62ch] text-[16px] leading-[1.6] text-body-2">
          Contributions are crypto-only — no studio, no card processor, no strings. Send any amount
          from your own wallet, then record your gift on the{" "}
          <Link href="/donate" className="text-accent hover:underline underline-offset-4">
            donation page
          </Link>{" "}
          with your email and tier so we can reach you about credits and rewards.
        </p>
        <CryptoPay />
      </div>
      <div className="h-4" />
    </div>
  );
}
