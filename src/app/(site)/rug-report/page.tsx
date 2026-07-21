import type { Metadata } from "next";
import { Container, Kicker, SectionHeader, StatBlock } from "@/components/ui";
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
    <>
      {/* Dark hero */}
      <div className="bg-dark text-paper">
        <Container className="py-16 lg:py-20">
          <div className="max-w-2xl">
            <Kicker color="orange">The Rug Report</Kicker>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-paper leading-[0.9] mt-4">
              The Sunday debrief on every scam that mattered this week.
            </h1>
            <p className="text-lg text-paper/70 mt-5">
              …and, more importantly, how to not be next. Free, forever. Read by watchmen in 140 countries.
            </p>
            <div className="mt-7 max-w-md">
              <NewsletterSignup list="rug-report" variant="dark" cta="Subscribe" />
            </div>
            <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-3">
              84,120 readers · Free · Unsubscribe anytime · {SITE.disclaimer}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12 lg:py-14">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          <StatBlock label="Subscribers" value="84,120" sub="and climbing every Sunday" />
          <StatBlock label="Cadence" value="Weekly" sub="delivered Sunday, 8am your time" tone="orange" />
          <StatBlock label="Reading Time" value="3 min" sub="the whole week, distilled" />
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14">
          {/* What you get */}
          <section>
            <SectionHeader title="What You Get" />
            <ul className="space-y-4">
              {PERKS.map((perk) => (
                <li key={perk} className="flex gap-3">
                  <span className="font-display text-btc-dark text-xl leading-none mt-0.5">✕</span>
                  <span className="text-ink-700">{perk}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Archive */}
          <section>
            <SectionHeader title="Recent Issues" />
            <div>
              {ARCHIVE.map((issue) => (
                <article
                  key={issue.no}
                  className="flex gap-5 py-5 border-b border-line last:border-0"
                >
                  <div className="shrink-0 w-14">
                    <div className="font-display text-2xl text-ink-400 leading-none">
                      {String(issue.no).padStart(3, "0")}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-wide text-ink-500 mt-1">
                      {issue.date}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-ink leading-tight">{issue.title}</h3>
                    <p className="text-sm text-ink-600 mt-1 leading-snug">{issue.teaser}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-5">
              Subscribe to get the full archive in your inbox.
            </p>
          </section>
        </div>
      </Container>
    </>
  );
}
