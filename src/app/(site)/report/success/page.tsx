import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report Received · BTCSCAM.COM",
  description: "Your scam report has been received and queued for triage.",
};

const NEXT_STEPS: string[] = [
  "A moderator triages your case — usually within hours.",
  "Two independent verifiers check indicators and wallets.",
  "Confirmed entries go live in the database and the ticker.",
];

export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const sp = await searchParams;
  const rawId = typeof sp.id === "string" ? sp.id.trim() : "";
  const caseId = rawId ? rawId.toUpperCase().slice(0, 24) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-6 pt-9 pb-16 fade-up">
      {/* ── Green-bordered confirmation card (v4) ── */}
      <div className="bg-white border border-safe shadow-card p-9 text-center">
        <div className="inline-flex items-center gap-2 bg-safe text-white px-3.5 py-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M2 7.5L5.5 11L12 3.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
            />
          </svg>
          <span className="kicker">Case filed</span>
        </div>

        <h1
          className="font-display text-ink mt-[18px]"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.12, textWrap: "balance" }}
        >
          Thank you, watchman.
        </h1>

        <div className="mt-4 inline-block bg-dark text-brand mono font-semibold text-[18px] px-[22px] py-3">
          {caseId ? `CASE ${caseId}` : "CASE FILED · IN TRIAGE QUEUE"}
        </div>

        <ul className="mt-[26px] mx-auto max-w-[520px] text-left flex flex-col gap-3">
          {NEXT_STEPS.map((step, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-[1.5] text-ink">
              <span
                className="mt-[7px] inline-block w-2 h-2 bg-brand shrink-0"
                aria-hidden="true"
              />
              <span>{step}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/database" variant="primary">
            Open the database
          </ButtonLink>
          <ButtonLink href="/forum" variant="ghost">
            Warn the forum
          </ButtonLink>
        </div>

        <p className="mt-6">
          <Link
            href="/report"
            className="kicker text-accent hover:underline underline-offset-4"
          >
            Report another →
          </Link>
        </p>
      </div>

      <p className="eyebrow text-center mt-6">{SITE.disclaimer}</p>
    </div>
  );
}
