import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, Kicker, Tag } from "@/components/ui";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { num } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscribe — The Rug Report & Scam Alerts | BTCSCAM.COM",
  description:
    "Free email intelligence: The Rug Report (weekly debrief) and real-time Scam Alerts. No spam, unsubscribe anytime.",
};

export default async function SubscribePage() {
  const [rugCount, alertCount, totalCount] = await Promise.all([
    prisma.subscriber.count({ where: { list: { in: ["rug-report", "all"] } } }),
    prisma.subscriber.count({ where: { list: { in: ["alerts", "all"] } } }),
    prisma.subscriber.count(),
  ]);

  return (
    <>
      <Container className="py-10">
        <PageHeader
          kicker="Newsletters"
          title="Intelligence, in your inbox."
          lede="Two free lists, one mission: help you spot the next rug before you're in it. No advertisers, no data selling — just what we've verified. Unsubscribe anytime."
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* The Rug Report — dark hero card */}
          <section className="bg-dark text-paper p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Tag tone="red">Weekly</Tag>
              <Kicker color="orange">The Rug Report</Kicker>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-paper leading-[0.95]">
              The Sunday debrief on every scam that mattered.
            </h2>
            <p className="text-paper/70 mt-4 flex-1">
              One email every Sunday: the week&apos;s biggest rugs, drainers, and impersonation
              campaigns — with the on-chain receipts, the losses, and exactly how not to be next.
              Charts, field guides, and the occasional dunk on a &quot;guaranteed 30% APY.&quot;
            </p>
            <ul className="mono text-[11px] uppercase tracking-wide text-ink-400 space-y-1.5 mt-5 mb-5">
              <li>· Sent Sundays, ~5 minute read</li>
              <li>· The week&apos;s losses, ranked and sourced</li>
              <li>· One field guide to a live technique</li>
            </ul>
            <NewsletterSignup list="rug-report" variant="dark" cta="Subscribe" />
            <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-3">
              {num(rugCount)} readers · Free · Unsubscribe anytime
            </p>
          </section>

          {/* Scam Alerts — light card */}
          <section className="border-2 border-ink bg-paper p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Tag tone="orange">Real-time</Tag>
              <Kicker color="red">Scam Alerts</Kicker>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">
              The fast lane for active threats.
            </h2>
            <p className="text-ink-600 mt-4 flex-1">
              Time-sensitive warnings the moment our desk confirms them — a fake wallet app slipping
              past review, a fresh drainer kit, a trending giveaway deepfake. Only sent when it&apos;s
              urgent, so an alert always means something.
            </p>
            <ul className="mono text-[11px] uppercase tracking-wide text-ink-500 space-y-1.5 mt-5 mb-5">
              <li>· Sent only when a threat is confirmed</li>
              <li>· Critical &amp; high-severity items only</li>
              <li>· What it is, who&apos;s targeted, what to do</li>
            </ul>
            <NewsletterSignup list="alerts" variant="light" cta="Get alerts" />
            <p className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-3">
              {num(alertCount)} subscribers · Free · Unsubscribe anytime
            </p>
          </section>
        </div>

        {/* Both / trust strip */}
        <div className="mt-8 border border-line bg-paper-2 p-6">
          <SectionHeader title="Want Both?" />
          <p className="text-ink-600 max-w-2xl">
            Subscribe to either list with the same email and we&apos;ll keep you on both — you can
            change your mind from any email&apos;s footer. We currently send to{" "}
            <strong className="text-ink">{num(totalCount)}</strong> people and we&apos;ve never sold a
            single address. We can&apos;t; we don&apos;t run ads either.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 mono text-[11px] uppercase tracking-wide text-ink-500">
            <div className="border-t border-line pt-3">No advertisers · No trackers in email</div>
            <div className="border-t border-line pt-3">We never sell or share your address</div>
            <div className="border-t border-line pt-3">One-click unsubscribe, always</div>
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
