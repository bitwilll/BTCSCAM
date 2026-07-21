import type { Metadata } from "next";
import { Container, ButtonLink, SectionHeader } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Request Received | BTCSCAM.COM",
  description: "Your confidential consultation request has been received.",
};

export default function ConsultationSuccessPage() {
  return (
    <>
      <Container className="py-16 max-w-2xl">
        <div className="border-2 border-ink bg-paper p-8 sm:p-10 text-center">
          <div className="font-display text-6xl text-btc-dark leading-none">✓</div>
          <h1 className="font-display text-4xl sm:text-5xl text-ink mt-4 leading-[0.95]">
            Request received.
          </h1>
          <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
            Confidential · Free · No account required
          </p>
          <p className="text-ink-600 mt-5 max-w-lg mx-auto">
            Thank you for reaching out. A volunteer will review your request and reply by email —
            usually within 24 hours. Everything you shared stays private to our support desk.
          </p>

          <div className="mt-8 text-left border border-line bg-paper-2 p-5">
            <div className="kicker text-ink-600 mb-3">While you wait</div>
            <ul className="space-y-2 text-sm text-ink-600">
              {[
                "Stop all contact with the scammer — do not send more to 'unlock' funds.",
                "Screenshot everything: chats, transactions, URLs, and profiles.",
                "Do not pay anyone promising guaranteed recovery — that's a second scam.",
                "If a card or bank was involved, contact them now to flag the transaction.",
              ].map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="text-btc-dark shrink-0">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <ButtonLink href="/report" variant="primary" size="md">
              File a scam report
            </ButtonLink>
            <ButtonLink href="/database" variant="outline" size="md">
              Browse the scam database
            </ButtonLink>
            <ButtonLink href="/" variant="ghost" size="md">
              Back to the front page
            </ButtonLink>
          </div>
        </div>

        <div className="mt-8">
          <SectionHeader title="Emergency?" />
          <p className="text-ink-600 text-sm max-w-lg">
            If you are in immediate danger or being extorted, contact your local law enforcement
            first. Our volunteers provide guidance and support — not emergency services.
          </p>
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
