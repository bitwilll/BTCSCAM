import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, Kicker, Tag } from "@/components/ui";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { num } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscribe — The Rug Report & Scam Alerts | BTCSCAM.COM",
  description:
    "Free email intelligence: The Rug Report (weekly debrief) and real-time Scam Alerts. No spam, unsubscribe anytime.",
};

const RUG_POINTS = [
  "Sent Sundays, ~5 minute read",
  "The week's losses, ranked and sourced",
  "One field guide to a live technique",
];

const ALERT_POINTS = [
  "Sent only when a threat is confirmed",
  "Critical & high-severity items only",
  "What it is, who's targeted, what to do",
];

export default async function SubscribePage() {
  const [rugCount, alertCount, totalCount] = await Promise.all([
    prisma.subscriber.count({ where: { list: { in: ["rug-report", "all"] } } }),
    prisma.subscriber.count({ where: { list: { in: ["alerts", "all"] } } }),
    prisma.subscriber.count(),
  ]);

  const points = (items: string[]) => (
    <div className="flex flex-col gap-3 mt-5 mb-5">
      {items.map((it) => (
        <div key={it} className="flex gap-3 text-[16px] leading-[1.5] text-ink">
          <span className="flex-none w-1.5 h-1.5 bg-brand mt-2" aria-hidden="true" />
          <span>{it}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Container className="py-8 lg:py-12 fade-up">
      <PageHeader
        kicker="Newsletters"
        title="Intelligence, in your inbox."
        lede="Two free lists, one mission: help you spot the next rug before you're in it. No advertisers, no data selling — just what we've verified. Unsubscribe anytime."
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* The Rug Report — shadow card */}
        <section className="bg-white shadow-card p-7 flex flex-col">
          <div className="flex items-center gap-2.5">
            <Tag tone="black">Weekly</Tag>
            <Kicker color="accent">The Rug Report</Kicker>
          </div>
          <h2 className="mt-3 font-display text-[32px] leading-[1.15] text-ink">
            The Sunday debrief on every scam that mattered.
          </h2>
          <p className="mt-3 text-[16px] leading-[1.6] text-body-2 flex-1">
            One email every Sunday: the week&apos;s biggest rugs, drainers, and impersonation
            campaigns — with the on-chain receipts, the losses, and exactly how not to be next.
            Charts, field guides, and the occasional dunk on a &quot;guaranteed 30% APY.&quot;
          </p>
          {points(RUG_POINTS)}
          <NewsletterSignup list="rug-report" variant="light" cta="Subscribe" />
          <p className="mt-3 text-[14px] text-meta uppercase tracking-[.02em]">
            {num(rugCount)} readers · Free · Unsubscribe anytime
          </p>
        </section>

        {/* Scam Alerts — shadow card */}
        <section className="bg-white shadow-card p-7 flex flex-col">
          <div className="flex items-center gap-2.5">
            <Tag tone="red">Real-time</Tag>
            <Kicker color="red">Scam Alerts</Kicker>
          </div>
          <h2 className="mt-3 font-display text-[32px] leading-[1.15] text-ink">
            The fast lane for active threats.
          </h2>
          <p className="mt-3 text-[16px] leading-[1.6] text-body-2 flex-1">
            Time-sensitive warnings the moment our desk confirms them — a fake wallet app slipping
            past review, a fresh drainer kit, a trending giveaway deepfake. Only sent when it&apos;s
            urgent, so an alert always means something.
          </p>
          {points(ALERT_POINTS)}
          <NewsletterSignup list="alerts" variant="light" cta="Get alerts" />
          <p className="mt-3 text-[14px] text-meta uppercase tracking-[.02em]">
            {num(alertCount)} subscribers · Free · Unsubscribe anytime
          </p>
        </section>
      </div>

      {/* Want both — masthead strip with double rule (v4 idiom) */}
      <div className="mt-8 bg-masthead rule-double-top px-6 py-[22px]">
        <div className="kicker text-accent">Want Both?</div>
        <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-[64ch]">
          Subscribe to either list with the same email and we&apos;ll keep you on both — you can
          change your mind from any email&apos;s footer. We currently send to{" "}
          <strong className="text-ink">{num(totalCount)}</strong> people and we&apos;ve never sold a
          single address. We can&apos;t; we don&apos;t run ads either.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div className="eyebrow border-t border-rule pt-3">No advertisers · No trackers in email</div>
          <div className="eyebrow border-t border-rule pt-3">We never sell or share your address</div>
          <div className="eyebrow border-t border-rule pt-3">One-click unsubscribe, always</div>
        </div>
      </div>

      {/* Mission strip */}
      <div className="mt-10 bg-dark px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <span className="kicker text-paper">{SITE.mission}</span>
        <span className="text-[14px] tracking-[.05em] uppercase text-ticker">{SITE.disclaimer}</span>
      </div>
    </Container>
  );
}
