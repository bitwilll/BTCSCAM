import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/ui";
import { roleRank } from "@/lib/rbac";
import { ROLE_LABELS, SITE, type Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — BTCSCAM.COM",
  description:
    "Who we are, how we verify scam intelligence, and why editorial independence matters. Community-verified scam intelligence — not financial advice.",
};

const NUMBERS: [string, string][] = [
  ["FOUNDED", "2026"],
  ["PAID LISTINGS", "0"],
  ["FLAGGED AT RISK", "$43.2M"],
  ["PROFIT KEPT", "$0"],
];

const PRINCIPLES: [string, string][] = [
  ["01 — EVIDENCE FIRST", "Screenshots, txids and domains — or it doesn't get published."],
  ["02 — NAMES, NOT VIBES", "We publish what we can prove and label the rest speculation."],
  ["03 — EVERYTHING OPEN", "CC-BY data, MIT tools, public methods. Copy us, please."],
];

const VERIFY_STEPS = [
  {
    title: "Intake",
    body: "Signals arrive from victims, watchmen on patrol, sting operations and exchange partners. Everything is logged — nothing is published on a single word.",
  },
  {
    title: "Corroborate",
    body: "An entry needs at least two independent signals: on-chain evidence, matching victim testimony, or a reproduction of the scam under controlled conditions.",
  },
  {
    title: "Community verify",
    body: "Members verify entries in the open. Verification counts are public, disputes are recorded, and anyone can challenge a claim with evidence.",
  },
  {
    title: "Publish & revise",
    body: "Verified entries go live in the Scam Database and are updated as the operator moves wallets, rebrands or resurfaces. Corrections are never silent.",
  },
];

export default async function AboutPage() {
  const team = await prisma.user.findMany({
    where: {
      role: { in: ["editor", "manager", "admin", "copywriter"] },
      isActive: true,
      isBanned: false,
    },
    select: { id: true, displayName: true, title: true, role: true, bio: true },
  });

  const sortedTeam = [...team].sort(
    (a, b) => roleRank(b.role) - roleRank(a.role) || a.displayName.localeCompare(b.displayName),
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pt-11 fade-up">
      <div className="kicker text-meta">About BTCSCAM.COM · Non-profit</div>

      {/* ── Mission lede (Fraunces display) ── */}
      <div
        className="mt-2.5 font-display text-ink"
        style={{ fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 1.02, textWrap: "balance" }}
      >
        We stop BTC and crypto scams — so the environment stays safe for everyone.
      </div>

      <div className="mt-7 flex flex-wrap gap-8">
        <p className="min-w-0 flex-1 basis-[340px] max-w-[58ch] text-[18px] leading-[1.75]">
          BTCSCAM.COM is a non-profit newsroom, database and community. Reporters investigate,
          watchmen verify, and every confirmed entry becomes public infrastructure — feeds,
          blocklists and evidence packs anyone can use.
        </p>
        <p className="min-w-0 flex-1 basis-[340px] max-w-[58ch] text-[18px] leading-[1.75]">
          Surpluses never sit in a treasury. We donate to open-source charities and fund the
          commons: Bitcoin education, crypto-centric apps and hardware, books and video production.
          The store, the film and your donations pay for it.
        </p>
      </div>

      {/* ── Numbers row ── */}
      <div
        className="mt-8 grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
      >
        {NUMBERS.map(([label, value]) => (
          <div key={label} className="border border-ink bg-white px-[18px] py-4">
            <div className="text-[16px] text-meta">{label}</div>
            <div className="mt-0.5 font-sans font-black text-[40px] text-ink">{value}</div>
          </div>
        ))}
      </div>

      {/* ── How verification works ── */}
      <div className="mt-9 border-t border-ink pt-4">
        <h2 className="font-display text-[24px] text-ink">How verification works</h2>
        <div className="mt-2">
          {VERIFY_STEPS.map((s) => (
            <div
              key={s.title}
              className="flex gap-2.5 border-b border-rule px-1 py-3 text-[16px] leading-[1.55]"
            >
              <span className="mt-[8px] h-1.5 w-1.5 flex-none bg-brand" aria-hidden="true" />
              <p className="min-w-0">
                <span className="font-bold text-ink">{s.title} — </span>
                <span className="text-body-2">{s.body}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Principles (dark cards) ── */}
      <div
        className="mt-9 grid gap-[18px] border-t border-ink pt-4"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}
      >
        {PRINCIPLES.map(([h, b]) => (
          <div key={h} className="bg-dark px-[22px] py-5 text-[#E9E5DA]">
            <div className="font-sans font-bold text-[16px] tracking-[.05em] text-brand">{h}</div>
            <p className="mt-2 text-[16px] leading-[1.55] text-ticker">{b}</p>
          </div>
        ))}
      </div>

      {/* ── The desk ── */}
      <div className="mt-9 border-t border-ink pt-4">
        <h2 className="font-display text-[24px] text-ink">The desk</h2>
        <div className="mt-2">
          {sortedTeam.length === 0 ? (
            <p className="py-3 text-[16px] text-meta">The masthead is being assembled.</p>
          ) : (
            sortedTeam.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule px-1 py-[13px] hover:bg-surface-dim"
              >
                <Avatar name={m.displayName} size={36} />
                <span className="min-w-0 flex-1 font-display text-[18px] text-ink">
                  {m.displayName}
                </span>
                <span className="text-[16px] text-meta">
                  {[m.title, ROLE_LABELS[m.role as Role] ?? m.role].filter(Boolean).join(" · ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Disclaimer strip ── */}
      <div className="mt-10 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-ink py-4">
        <span className="kicker text-ink">{SITE.mission}</span>
        <span className="text-[14px] tracking-[.05em] text-meta">{SITE.disclaimer}</span>
      </div>
    </div>
  );
}
