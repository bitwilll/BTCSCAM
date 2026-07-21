import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Rug Report — The Sunday Scam Debrief — BTCSCAM.COM",
  description: "The free Sunday newsletter on every scam that mattered this week — and how to not be next.",
};

// Static archive of recent issues (teasers).
const ARCHIVE = [
  {
    no: 112,
    date: "JUL 19, 2026",
    title: "The $47M Pig-Butchering Ring, Unwound",
    teaser: "Inside NovaTrade Pro's 61 cloned front-ends — and the four red flags every victim saw first.",
  },
  {
    no: 111,
    date: "JUL 12, 2026",
    title: "Drainer Kits Are Now Cheaper Than Lunch",
    teaser: "Inferno v4 rents for $99/week. What 'point-and-click theft' means for your allowances.",
  },
  {
    no: 110,
    date: "JUL 5, 2026",
    title: "The Fake 'Ledger Live' That Beat Store Review",
    teaser: "12,000 downloads before takedown. Why your seed phrase should never touch software.",
  },
  {
    no: 109,
    date: "JUN 28, 2026",
    title: "A Court Froze $9.8M Because of a Forum Thread",
    teaser: "How a 214-page community dossier on BitVault Capital became Exhibit A.",
  },
  {
    no: 108,
    date: "JUN 21, 2026",
    title: "The 'Recovery Agent' Who Scams You Twice",
    teaser: "After the rug comes the DM. The second-strike playbook, and how to shut it down.",
  },
  {
    no: 107,
    date: "JUN 14, 2026",
    title: "Q2 Losses Hit $2.1B — Down 8%, Kits Doubled",
    teaser: "Fewer mega-ponzis, far more industrialized draining. The charts that matter.",
  },
];

const PERKS = [
  "One email, every Sunday morning — no more, no less.",
  "The week's confirmed scams, ranked by damage and reach.",
  "Plain-language field guides so you can spot the next one.",
  "On-chain post-mortems from the community's investigators.",
];

export default function RugReportPage() {
  return (
    <Container className="py-8 lg:py-12 fade-up">
      {/* ── double-ruled CTA box (v4) ── */}
      <div
        className="mx-auto mt-4 max-w-[820px] text-center"
        style={{ border: "3px double var(--ink)", padding: "42px 36px" }}
      >
        <div className="kicker text-meta">The Sunday Debrief</div>
        <div
          className="mt-3 font-display text-ink"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
        >
          The Rug Report
        </div>
        <p
          className="mt-3.5 mx-auto text-[18px] leading-[1.6] max-w-[46ch]"
          style={{ color: "#44413B", textWrap: "pretty" }}
        >
          Every scam that mattered this week — and, more importantly, how to not be next. Free,
          forever. Read by watchmen in 140 countries.
        </p>
        <div className="mt-6 max-w-md mx-auto">
          <NewsletterSignup list="rug-report" variant="light" cta="Subscribe" />
        </div>
        <div className="mt-3.5 text-[14px] text-meta uppercase tracking-[.02em]">
          84,120 readers · Free · Unsubscribe anytime
        </div>
      </div>

      {/* ── what you get ── */}
      <div className="mx-auto max-w-[820px] mt-14">
        <div className="flex items-center gap-[18px]">
          <span className="kicker text-ink">What You Get</span>
          <div className="flex-1 border-t border-ink" />
        </div>
        <div className="flex flex-col gap-3 mt-5">
          {PERKS.map((perk) => (
            <div key={perk} className="flex gap-3 text-[16px] leading-[1.5] text-ink">
              <span className="flex-none w-1.5 h-1.5 bg-brand mt-2" aria-hidden="true" />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── archive: ArticleRow-style rows, no thumbs (v4 river) ── */}
      <div className="mx-auto max-w-[820px] mt-14">
        <div className="flex items-center gap-[18px]">
          <span className="kicker text-ink">Recent Issues</span>
          <div className="flex-1 border-t border-ink" />
        </div>
        {ARCHIVE.map((issue) => (
          <article key={issue.no} className="py-[22px] border-b border-rule">
            <div className="flex gap-3 items-baseline flex-wrap">
              <span className="mono font-medium text-[14px] text-faint">
                No. {String(issue.no).padStart(3, "0")}
              </span>
              <span className="kicker text-accent">The Rug Report</span>
              <span className="text-[14px] text-meta">{issue.date}</span>
            </div>
            <h3 className="mt-2 font-display text-[24px] leading-[1.25] text-ink">{issue.title}</h3>
            <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-[52ch]">{issue.teaser}</p>
          </article>
        ))}
        <p className="eyebrow mt-5">
          Subscribe to get the full archive in your inbox. · {SITE.disclaimer}
        </p>
      </div>
    </Container>
  );
}
