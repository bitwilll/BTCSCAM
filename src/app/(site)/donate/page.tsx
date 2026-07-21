import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Avatar, ButtonLink, SectionHeader, StatBlock, Tag } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { CopyButton } from "@/components/crypto/CopyButton";
import { usd, compactUsd, num, timeAgo } from "@/lib/format";
import { DonationPledgeForm } from "./_components/DonationPledgeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate — Fund the Watch | BTCSCAM.COM",
  description:
    "Independent, community-funded, no advertisers. Support crypto-scam investigations with a crypto-only donation.",
};

const IMPACT_LINES: [string, string][] = [
  ["$100", "covers a month of database hosting"],
  ["$25", "funds one verified takedown request"],
  ["$10", "keeps the wallet checker free for a day"],
];

export default async function DonatePage() {
  const [recent, confirmedAgg, supporterCount, confirmedCount, btcWallet] = await Promise.all([
    prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.donation.aggregate({ _sum: { amountUsd: true }, where: { status: "confirmed" } }),
    prisma.donation.count(),
    prisma.donation.count({ where: { status: "confirmed" } }),
    prisma.cryptoWallet.findFirst({ where: { method: "BTC", isActive: true } }),
  ]);

  const confirmedCents = confirmedAgg._sum.amountUsd ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 pt-9 fade-up">
      <div className="kicker text-meta">Donate us · Keep the watch funded</div>
      <h1
        className="mt-2 font-display text-ink"
        style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1, textWrap: "balance" }}
      >
        Independent, community-funded, no advertisers.
      </h1>
      <p
        className="mt-3 max-w-[62ch] text-[18px] leading-[1.65] text-body-2"
        style={{ textWrap: "pretty" }}
      >
        No ads, no tokens, no VC. The watch runs on what the community puts in — money is only one
        of the four currencies.
      </p>

      {/* ── Impact strip (mono numbers) ── */}
      <div className="mt-5 flex flex-wrap gap-x-9 gap-y-3.5 border-t border-b border-t-ink border-b-rule py-3.5">
        {IMPACT_LINES.map(([amount, what]) => (
          <span key={amount} className="text-[16px] text-body-2">
            <span className="mono font-semibold text-[16px] text-ink">{amount}</span> {what}
          </span>
        ))}
      </div>

      {/* ── Four ways to give ── */}
      <div
        className="mt-6 grid gap-[18px]"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}
      >
        <div className="flex flex-col gap-2.5 border border-ink bg-white p-[22px]">
          <div className="font-sans font-bold text-[18px] text-accent">01</div>
          <div className="font-display text-[24px] text-ink">Your art</div>
          <p className="flex-1 text-[16px] leading-[1.55] text-body-2">
            Hang in the Scam Art gallery. Auction proceeds split 70/30 with the watch.
          </p>
          <ButtonLink href="/scam-art" variant="primary" size="md">
            Submit to gallery →
          </ButtonLink>
        </div>

        <div className="flex flex-col gap-2.5 border border-ink bg-white p-[22px]">
          <div className="font-sans font-bold text-[18px] text-accent">02</div>
          <div className="font-display text-[24px] text-ink">Your time</div>
          <p className="flex-1 text-[16px] leading-[1.55] text-body-2">
            Verify reports, moderate threads, translate alerts. Two hours a week moves the queue.
          </p>
          <ButtonLink href="/forum" variant="ghost" size="md">
            Join the roster →
          </ButtonLink>
        </div>

        <div className="flex flex-col gap-2.5 border border-ink bg-white p-[22px]">
          <div className="font-sans font-bold text-[18px] text-accent">03</div>
          <div className="font-display text-[24px] text-ink">Your share</div>
          <p className="flex-1 text-[16px] leading-[1.55] text-body-2">
            Forward the Rug Report, repost alerts. Reach is protection — every share is a reader who
            doesn&apos;t get drained.
          </p>
          <ButtonLink href="/rug-report" variant="ghost" size="md">
            Copy the share kit →
          </ButtonLink>
        </div>

        <div className="flex flex-col gap-2.5 border border-ink bg-dark p-[22px] text-[#E9E5DA]">
          <div className="font-sans font-bold text-[18px] text-brand">04</div>
          <div className="font-display text-[24px] text-paper">Your crypto</div>
          <p className="flex-1 text-[16px] leading-[1.55] text-ticker">
            On-chain, transparent, auditable — the donation wallet is public and every outflow is
            published.
          </p>
          {btcWallet ? (
            <>
              <code className="mono block border border-dark-line bg-[#12120D] px-3 py-2.5 font-semibold text-[16px] text-brand [overflow-wrap:anywhere]">
                {btcWallet.address}
              </code>
              <div className="self-start bg-paper text-ink">
                <CopyButton value={btcWallet.address} label="Copy address" />
              </div>
            </>
          ) : (
            <a
              href="#send-crypto"
              className="kicker inline-flex items-center gap-1 self-start border border-brand px-4 py-2.5 text-paper hover:bg-paper hover:text-ink"
            >
              Send crypto ↓
            </a>
          )}
        </div>
      </div>

      <p className="mt-6 text-[16px] text-meta">
        DONATIONS FUND: OPEN-SOURCE CHARITIES · BTC EDUCATION · CRYPTO-CENTRIC APPS + HARDWARE ·
        BOOKS + VIDEO PRODUCTION
      </p>

      {/* ── Send + pledge + supporters wall ── */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div id="send-crypto" className="scroll-mt-24">
            <SectionHeader title="Send crypto directly" />
            <p className="mb-4 max-w-[62ch] text-[16px] leading-[1.6] text-body-2">
              Pick an asset, scan the code or copy the address, and send any amount from your own
              wallet. Addresses are shown below — we never DM you one.
            </p>
            <CryptoPay />
          </div>

          <div className="mt-10">
            <SectionHeader title="Record your pledge" />
            <p className="mb-4 max-w-[62ch] text-[16px] leading-[1.6] text-body-2">
              Optional, but it helps us match incoming transactions, send a receipt, and put your
              name on the supporters wall. All fields are optional — give anonymously if you like.
            </p>
            <div className="border border-ink bg-white p-6 sm:p-8">
              <DonationPledgeForm />
            </div>
          </div>
        </div>

        <aside className="min-w-0 lg:border-l lg:border-rule lg:pl-8">
          <SectionHeader title="Impact" />
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Community-funded" value="100%" sub="reader-supported, always" />
            <StatBlock label="Advertisers" value="0" sub="never any" tone="accent" />
            <StatBlock
              label="Confirmed raised"
              value={compactUsd(confirmedCents / 100)}
              sub={`${num(confirmedCount)} confirmed gifts`}
            />
            <StatBlock label="Supporters" value={num(supporterCount)} sub="pledges on record" />
          </div>

          <div className="mt-8">
            <SectionHeader title="Supporters wall" />
            {recent.length === 0 ? (
              <div className="border border-rule bg-surface-dim p-8 text-center">
                <p className="font-display text-[24px] text-ink">Be the first.</p>
                <p className="mt-2 text-[16px] text-meta">
                  Your name — or &ldquo;Anonymous&rdquo; — will appear here.
                </p>
              </div>
            ) : (
              <div>
                {recent.map((d) => {
                  const name = d.isAnonymous ? "Anonymous" : d.donorName?.trim() || "Anonymous";
                  return (
                    <div
                      key={d.id}
                      className="flex gap-3 border-b border-rule px-1 py-3.5 last:border-0 hover:bg-surface-dim"
                    >
                      <Avatar name={name} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-bold text-ink">{name}</span>
                          {d.amountUsd != null && (
                            <span className="mono text-[14px] font-semibold text-ink">
                              {usd(d.amountUsd)}
                            </span>
                          )}
                          <Tag tone={d.status === "confirmed" ? "green" : "outline"}>
                            {d.status}
                          </Tag>
                        </div>
                        {d.message && (
                          <p className="mt-1 text-[14px] leading-snug text-body-2">
                            &ldquo;{d.message}&rdquo;
                          </p>
                        )}
                        <p className="mt-1 text-[14px] text-meta">
                          {d.cryptoMethod} · {timeAgo(d.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
      <div className="h-4" />
    </div>
  );
}
