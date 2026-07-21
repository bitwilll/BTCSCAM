import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Request Received | BTCSCAM.COM",
  description: "Your confidential consultation request has been received.",
};

const WHILE_YOU_WAIT = [
  "Stop all contact with the scammer — do not send more to 'unlock' funds.",
  "Screenshot everything: chats, transactions, URLs, and profiles.",
  "Do not pay anyone promising guaranteed recovery — that's a second scam.",
  "If a card or bank was involved, contact them now to flag the transaction.",
];

export default function ConsultationSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-[980px] px-6 pt-9 fade-up">
      {/* ── v4 confirmation card ── */}
      <div className="border border-ink bg-white p-9 text-center">
        <div className="inline-block bg-safe px-3.5 py-1.5 font-sans font-bold text-[16px] uppercase tracking-[.05em] text-white">
          Request received
        </div>
        <h1
          className="mt-[18px] font-display text-ink"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.12, textWrap: "balance" }}
        >
          A skeptic is on it.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[52ch] text-[16px] leading-[1.6] text-body-2">
          A reply lands by email — community-desk answers within 72 hours, expert sessions booked
          inside 24. Everything you shared stays private to the desk.
        </p>
        <div className="mt-[22px]">
          <ButtonLink href="/consultation" variant="ghost" size="md">
            Ask another question
          </ButtonLink>
        </div>
      </div>

      {/* ── While you wait ── */}
      <div className="mt-9 border-t border-ink pt-4">
        <h2 className="font-display text-[24px] text-ink">While you wait</h2>
        <div className="mt-3 flex flex-col gap-2">
          {WHILE_YOU_WAIT.map((tip) => (
            <div key={tip} className="flex gap-2.5 text-[16px] leading-[1.5] text-body-2">
              <span className="mt-[7px] h-1.5 w-1.5 flex-none bg-brand" aria-hidden="true" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/report" className="kicker text-accent hover:underline underline-offset-4">
            File a scam report →
          </Link>
          <Link href="/database" className="kicker text-accent hover:underline underline-offset-4">
            Browse the scam database →
          </Link>
        </div>
        <p className="mt-5 text-[16px] text-meta">
          IN IMMEDIATE DANGER OR BEING EXTORTED? CONTACT LOCAL LAW ENFORCEMENT FIRST — WE PROVIDE
          GUIDANCE, NOT EMERGENCY SERVICES.
        </p>
      </div>
      <div className="h-4" />
    </div>
  );
}
