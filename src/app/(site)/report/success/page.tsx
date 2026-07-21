import type { Metadata } from "next";
import Link from "next/link";
import { Container, Kicker, ButtonLink } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Report Received · BTCSCAM.COM",
  description: "Your scam report has been received and queued for triage.",
};

const NEXT_STEPS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "It enters the queue",
    body: "Your report lands with our triage analysts, tagged “pending”. Nothing is public yet.",
  },
  {
    step: "02",
    title: "We verify on-chain",
    body: "Analysts check the addresses and evidence you provided and match them against known operations.",
  },
  {
    step: "03",
    title: "It protects others",
    body: "Confirmed reports are added to the public database and can trigger alerts for the whole community.",
  },
];

export default function ReportSuccessPage() {
  return (
    <Container className="py-16 lg:py-20 max-w-3xl">
      <div className="border-2 border-ink bg-paper p-8 sm:p-10">
        <Kicker color="green">Report Received</Kicker>
        <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[0.9] mt-3">
          Thank you for filing.
        </h1>
        <p className="mt-4 text-lg text-ink-600">
          Your report is in the queue. Every submission makes the community harder to scam — and it
          could be the warning that stops the next victim.
        </p>

        <div className="mt-8 section-rule pb-2 mb-6">
          <h2 className="kicker text-sm !tracking-[0.16em]">What Happens Next</h2>
        </div>

        <ol className="space-y-6">
          {NEXT_STEPS.map((s) => (
            <li key={s.step} className="flex gap-4">
              <span className="font-display text-3xl text-ink-400 w-10 shrink-0 leading-none">
                {s.step}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-ink">{s.title}</div>
                <p className="text-sm text-ink-600 mt-1 leading-snug">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row gap-3">
          <ButtonLink href="/database" variant="primary" size="lg">
            Browse the Scam Database
          </ButtonLink>
          <ButtonLink href="/forum" variant="outline" size="lg">
            Warn the Community in the Forum
          </ButtonLink>
        </div>

        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-8">
          Spotted another one?{" "}
          <Link href="/report" className="text-btc-dark hover:text-ink underline">
            File another report →
          </Link>
        </p>
      </div>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-6 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
