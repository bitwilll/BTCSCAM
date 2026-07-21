import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, StatBlock, Tag, Avatar, EmptyState } from "@/components/ui";
import { CryptoPay } from "@/components/crypto/CryptoPay";
import { usd, compactUsd, num, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { DonationPledgeForm } from "./_components/DonationPledgeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate — Fund the Watch | BTCSCAM.COM",
  description:
    "Independent, community-funded, no advertisers. Support crypto-scam investigations with a crypto-only donation.",
};

export default async function DonatePage() {
  const [recent, confirmedAgg, supporterCount, confirmedCount] = await Promise.all([
    prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.donation.aggregate({ _sum: { amountUsd: true }, where: { status: "confirmed" } }),
    prisma.donation.count(),
    prisma.donation.count({ where: { status: "confirmed" } }),
  ]);

  const confirmedCents = confirmedAgg._sum.amountUsd ?? 0;

  return (
    <>
      <Container className="py-10">
        <PageHeader
          kicker="Support the Newsroom"
          title="Fund the watch."
          lede="BTCSCAM.COM is independent, community-funded, and carries no advertisers. Every scam we expose and every victim we help is paid for by readers like you — in crypto, with no middleman taking a cut."
        />

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          {/* Left — mission, pay, pledge */}
          <div>
            {/* Mission manifesto */}
            <section className="bg-dark text-paper p-8">
              <span className="kicker text-btc">Why donate</span>
              <h2 className="font-display text-4xl sm:text-5xl text-paper mt-3 leading-[0.95]">
                No advertisers. No investors. No agenda but the truth.
              </h2>
              <p className="text-paper/70 mt-4 max-w-xl">
                Scam networks are funded like startups. The people fighting them usually aren&apos;t.
                We don&apos;t run ads, take affiliate kickbacks from exchanges, or sell &quot;recovery&quot;
                services. That independence only holds if the community pays for it.
              </p>
              <ul className="mt-5 grid sm:grid-cols-3 gap-4">
                {[
                  ["Investigations", "On-chain tracing, undercover work, and legal review of every claim."],
                  ["Victim support", "Free, confidential triage for people in the first 24 hours after a scam."],
                  ["Open database", "A public, community-verified record of active threats — no paywall."],
                ].map(([h, b]) => (
                  <li key={h} className="border-t border-white/20 pt-3">
                    <div className="kicker text-btc">{h}</div>
                    <p className="text-paper/70 text-sm mt-1.5 leading-snug">{b}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Crypto pay */}
            <div className="mt-10">
              <SectionHeader title="Send Crypto Directly" />
              <p className="text-ink-600 mb-4 max-w-xl">
                Pick an asset, scan the code or copy the address, and send any amount from your own
                wallet. Addresses are shown below — we never DM you one.
              </p>
              <CryptoPay />
            </div>

            {/* Pledge form */}
            <div className="mt-10">
              <SectionHeader title="Record Your Pledge" />
              <p className="text-ink-600 mb-4 max-w-xl">
                Optional, but it helps us match incoming transactions, send a receipt, and put your
                name on the supporters wall. All fields are optional — give anonymously if you like.
              </p>
              <div className="border-2 border-ink bg-paper p-6 sm:p-8">
                <DonationPledgeForm />
              </div>
            </div>
          </div>

          {/* Right rail — impact + supporters */}
          <aside className="lg:border-l lg:border-line lg:pl-8">
            <SectionHeader title="Impact" />
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Community-funded" value="100%" sub="reader-supported, always" />
              <StatBlock label="Advertisers" value="0" sub="never any" tone="orange" />
              <StatBlock
                label="Confirmed raised"
                value={compactUsd(confirmedCents / 100)}
                sub={`${num(confirmedCount)} confirmed gifts`}
              />
              <StatBlock label="Supporters" value={num(supporterCount)} sub="pledges on record" />
            </div>

            <div className="mt-8">
              <SectionHeader title="Recent Supporters" />
              {recent.length === 0 ? (
                <EmptyState
                  title="Be the first."
                  hint="Your name — or 'Anonymous' — will appear here."
                />
              ) : (
                <ul>
                  {recent.map((d) => {
                    const name = d.isAnonymous ? "Anonymous" : d.donorName?.trim() || "Anonymous";
                    return (
                      <li key={d.id} className="flex gap-3 py-4 border-b border-line last:border-0">
                        <Avatar name={name} size={34} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-ink truncate">{name}</span>
                            {d.amountUsd != null && (
                              <span className="mono text-[11px] text-btc-dark">{usd(d.amountUsd)}</span>
                            )}
                            <Tag tone={d.status === "confirmed" ? "green" : "outline"}>{d.status}</Tag>
                          </div>
                          {d.message && (
                            <p className="text-sm text-ink-600 mt-1 leading-snug">
                              &ldquo;{d.message}&rdquo;
                            </p>
                          )}
                          <p className="mono text-[10px] text-ink-400 uppercase tracking-wide mt-1">
                            {d.cryptoMethod} · {timeAgo(d.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
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
