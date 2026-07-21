import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { Container, Kicker } from "@/components/ui";
import { ReportForm } from "./_components/ReportForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report a Scam · BTCSCAM.COM",
  description:
    "File a crypto-scam report with the community. Name the operation, share addresses and evidence — our triage team verifies and adds it to the public database.",
};

const NEXT_STEPS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Triage",
    body: "An analyst reviews your report, checks the addresses on-chain, and matches it against known operations.",
  },
  {
    step: "02",
    title: "Verification",
    body: "If it checks out, the community verifies it and the scam is logged in the public database.",
  },
  {
    step: "03",
    title: "Follow-up",
    body: "We may email you for more detail. Confirmed reports feed alerts that warn the next potential victim.",
  },
];

const SAFETY_TIPS: string[] = [
  "Never share your seed phrase or private keys — no one legitimate will ever ask for them.",
  "Ignore anyone promising to recover your funds for an upfront fee. That is a second scam.",
  "Do not send more crypto to “unlock” or “release” money you were told is stuck.",
  "Screenshot everything: chats, transactions, and profiles, before they disappear.",
];

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ scam?: string | string[] }>;
}) {
  const [user, sp] = await Promise.all([getSession(), searchParams]);
  const initialScamName = typeof sp.scam === "string" ? sp.scam : "";

  return (
    <Container className="py-10 lg:py-12">
      {/* Header */}
      <header className="border-b-2 border-ink pb-6 mb-8">
        <div className="mb-2">
          <Kicker color="red">Community Intelligence</Kicker>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[0.9]">Report a Scam</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-600">
          {user ? (
            <>
              Welcome back, <span className="text-ink font-semibold">{user.displayName}</span>. Every
              report you file sharpens the picture for the whole community.
            </>
          ) : (
            <>
              Seen a rug, a drainer, a fake giveaway, or a “recovery” con? Tell us what happened. Your
              report is triaged, verified, and turned into a public warning.
            </>
          )}
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-12">
        {/* Form */}
        <div>
          <ReportForm
            initialScamName={initialScamName}
            loggedIn={!!user}
            userName={user?.displayName}
            userEmail={user?.email}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:border-l lg:border-line lg:pl-8 space-y-10">
          <section>
            <h2 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-5">
              What Happens Next
            </h2>
            <ol className="space-y-5">
              {NEXT_STEPS.map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="font-display text-2xl text-ink-400 w-8 shrink-0 leading-none pt-0.5">
                    {s.step}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-ink">{s.title}</div>
                    <p className="text-sm text-ink-600 mt-1 leading-snug">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-5">Stay Safe</h2>
            <ul className="space-y-3">
              {SAFETY_TIPS.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-600 leading-snug">
                  <span className="text-btc-dark font-bold shrink-0">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-paper-2 border border-line p-5">
            <Kicker color="muted">Confidential</Kicker>
            <p className="text-sm text-ink-600 mt-2 leading-snug">
              Your email is never published. We use it only to follow up on your report.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
