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

const STEPS: { num: string; label: string }[] = [
  { num: "01", label: "CATEGORY" },
  { num: "02", label: "DETAILS" },
  { num: "03", label: "REVIEW" },
];

const NEXT_STEPS: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Triage",
    body: "An analyst reviews your report, checks the addresses on-chain, and matches it against known operations.",
  },
  {
    num: "02",
    title: "Verification",
    body: "If it checks out, the community verifies it and the scam is logged in the public database.",
  },
  {
    num: "03",
    title: "Follow-up",
    body: "We may email you for more detail. Confirmed reports feed alerts that warn the next potential victim.",
  },
];

const SAFETY_TIPS: string[] = [
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
    <Container className="pt-9 pb-16 fade-up">
      {/* ── Header (v4 case intake) ── */}
      <header>
        <Kicker color="muted">Case intake</Kicker>
        <h1
          className="font-display text-ink mt-2"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1, textWrap: "balance" }}
        >
          Report a scam.
        </h1>
        <p
          className="mt-3 text-[18px] leading-[1.65] text-body-2 max-w-[60ch]"
          style={{ textWrap: "pretty" }}
        >
          {user ? (
            <>
              Welcome back, <span className="text-ink font-semibold">{user.displayName}</span>.
              Three minutes of your detail becomes the community&rsquo;s early warning — every case
              you file sharpens the picture.
            </>
          ) : (
            <>
              Three minutes of your detail becomes the community&rsquo;s early warning. Anonymous
              by default; evidence beats adjectives.
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 px-4 py-2.5 border font-sans font-bold text-[16px] ${
                i === 0 ? "border-ink bg-ink text-paper" : "border-rule bg-white text-body-2"
              }`}
            >
              <span>{s.num}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        {/* ── Form ── */}
        <div className="min-w-0">
          <ReportForm
            initialScamName={initialScamName}
            loggedIn={!!user}
            userName={user?.displayName}
            userEmail={user?.email}
          />
        </div>

        {/* ── Right rail ── */}
        <aside className="lg:border-l lg:border-rule lg:pl-8">
          <div className="flex items-center gap-[18px]">
            <h2 className="kicker text-ink shrink-0">What happens next</h2>
            <div className="flex-1 border-t border-ink" />
          </div>
          <ol className="mt-4 flex flex-col gap-3.5">
            {NEXT_STEPS.map((s) => (
              <li key={s.num} className="flex gap-3 text-[16px] leading-[1.5]">
                <span className="font-bold text-accent shrink-0">{s.num}</span>
                <span className="text-body-2">
                  <span className="font-bold text-ink">{s.title}.</span> {s.body}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 bg-warn text-warn-fg p-5">
            <div className="kicker">Never share your seed phrase</div>
            <p className="mt-2 text-[16px] leading-[1.6]">
              No one legitimate — not us, not &ldquo;support&rdquo;, not a recovery agent — will
              ever ask for your seed phrase or private keys.
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-[18px]">
              <h2 className="kicker text-ink shrink-0">Stay safe</h2>
              <div className="flex-1 border-t border-ink" />
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {SAFETY_TIPS.map((tip, i) => (
                <li key={i} className="flex gap-3 text-[16px] leading-[1.5] text-body-2">
                  <span
                    className="mt-[7px] inline-block w-2 h-2 bg-brand shrink-0"
                    aria-hidden="true"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border border-rule bg-surface-dim p-5">
            <Kicker color="muted">Confidential</Kicker>
            <p className="mt-2 text-[16px] leading-[1.6] text-meta">
              Your email is never published. We use it only to follow up on your report.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
