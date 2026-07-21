import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ButtonLink, EmptyState } from "@/components/ui";
import { byline } from "@/lib/format";
import { StatusTag } from "./_components/StatusTag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sting Operations — BTCSCAM.COM",
  description:
    "Community-run honeypots and undercover operations that document scam infrastructure and feed the Scam Database.",
};

const RULES = [
  {
    n: "01 — Watch, don't touch",
    body: "No vigilante action, no doxxing, no contact off-script. Ever.",
  },
  {
    n: "02 — Handlers only",
    body: "Evidence routes to law enforcement through moderators, chain-of-custody intact.",
  },
  {
    n: "03 — No real funds",
    body: "Bait wallets carry traceable test dust. Your coins never enter an op.",
  },
];

function opCode(slug: string) {
  return `OP ${slug.replace(/-/g, " ")}`;
}

export default async function StingOperationsPage() {
  const [operations, user] = await Promise.all([
    prisma.stingOperation.findMany({ orderBy: { createdAt: "desc" } }),
    getSession(),
  ]);

  const openOps = operations.filter((o) => o.status !== "closed");
  const closedOps = operations.filter((o) => o.status === "closed");
  const activeCount = operations.filter((o) => o.status === "active").length;
  const cleared = !!user && user.reputation >= 70;

  return (
    <div className="fade-up">
      <div className="max-w-[1360px] mx-auto px-6 pt-10 pb-14">
        {/* ── Floor header + clearance (v4) ── */}
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div className="min-w-0 max-w-[720px]">
            <span className="inline-flex items-center gap-[9px] border border-ink px-3 py-[5px] kicker">
              <span className="w-2 h-2 bg-brand" aria-hidden="true" />
              Operations floor · Restricted
            </span>
            <h1
              className="font-display mt-3.5"
              style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.06 }}
            >
              Sting operations
            </h1>
            <p className="mt-3.5 text-[16px] leading-[1.6] text-body-2 max-w-[62ch]">
              Coordinated, moderated counter-scam operations. We bait, document, and hand evidence
              to law enforcement. Watch, don&apos;t touch.
            </p>
          </div>
          <div className="flex-none bg-dark px-5 py-[18px]">
            <div className="kicker text-ticker">Your clearance</div>
            <div className="font-display text-[24px] text-paper mt-1">
              {user ? `TS ${user.reputation} · ${user.displayName}` : "Visitor · unenrolled"}
            </div>
            {user ? (
              cleared ? (
                <div className="inline-flex items-center gap-2 mt-2 font-sans font-bold text-[14px] tracking-[.05em] text-up uppercase">
                  <span className="w-2 h-2 bg-up" aria-hidden="true" />
                  Cleared for enrollment (TS ≥ 70)
                </div>
              ) : (
                <div className="mt-2 font-sans font-bold text-[14px] tracking-[.05em] text-ticker uppercase">
                  Enrollment opens at TS 70
                </div>
              )
            ) : (
              <Link
                href="/login"
                className="inline-block mt-2 font-sans font-bold text-[14px] tracking-[.05em] text-brand uppercase hover:underline underline-offset-4"
              >
                Sign in to enroll →
              </Link>
            )}
          </div>
        </div>

        {/* ── Rules of engagement cards ── */}
        <div
          className="grid mt-[26px]"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}
        >
          {RULES.map((r) => (
            <div key={r.n} className="bg-white shadow-card px-[18px] py-4">
              <span className="font-sans font-bold text-[14px] tracking-[.05em] text-accent uppercase">
                {r.n}
              </span>
              <p className="mt-1.5 text-[16px] leading-[1.5] text-body-2">{r.body}</p>
            </div>
          ))}
        </div>

        {operations.length === 0 ? (
          <div className="mt-9">
            <EmptyState
              title="No operations on file yet"
              hint="Active operations are published here once the evidence has been secured and cleared for release."
              action={<ButtonLink href="/consultation">Get involved</ButtonLink>}
            />
          </div>
        ) : (
          <>
            {/* ── Active operations ── */}
            <div className="mt-9 flex flex-wrap justify-between items-baseline gap-3 border-b border-ink pb-2.5">
              <h2 className="font-display text-[24px]">Active operations</h2>
              <span className="text-[14px] text-meta uppercase tracking-[.02em]">
                {activeCount} running · {operations.length} total on file
              </span>
            </div>
            {openOps.map((op) => (
              <article
                key={op.id}
                className="mt-4 bg-white shadow-card px-6 py-[22px] flex flex-wrap items-center gap-y-5 gap-x-8"
              >
                <div className="min-w-0" style={{ flex: "2 1 380px" }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="mono font-semibold text-[14px] text-meta uppercase">
                      {opCode(op.slug)}
                    </span>
                    <StatusTag status={op.status} />
                  </div>
                  <h3 className="font-display text-[21px] mt-2">
                    <Link
                      href={`/sting-operations/${op.slug}`}
                      className="hover:underline underline-offset-4 decoration-1"
                    >
                      {op.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[16px] leading-[1.55] text-body-2 max-w-[70ch]">
                    {op.summary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-baseline gap-y-1.5 gap-x-[18px] text-[14px] text-meta uppercase tracking-[.02em]">
                    <span>Filed {byline(op.createdAt)}</span>
                    <Link
                      href={`/sting-operations/${op.slug}`}
                      className="kicker text-accent hover:underline underline-offset-4"
                    >
                      Open the operation file →
                    </Link>
                  </div>
                </div>
                <div className="min-w-0" style={{ flex: "1 1 240px" }}>
                  <ButtonLink href="/consultation" variant="ghost" size="md" full>
                    Enroll as watchman
                  </ButtonLink>
                  <div className="mt-2 text-center text-[14px] text-meta uppercase tracking-[.02em]">
                    Handler-moderated · no real funds
                  </div>
                </div>
              </article>
            ))}

            {/* ── Closed files ── */}
            {closedOps.length > 0 && (
              <>
                <div className="mt-9 flex flex-wrap justify-between items-baseline gap-3 border-b border-ink pb-2.5">
                  <h2 className="font-display text-[24px]">Closed files</h2>
                  <span className="text-[14px] text-meta uppercase tracking-[.02em]">
                    Outcomes on the record
                  </span>
                </div>
                {closedOps.map((op) => (
                  <Link
                    key={op.id}
                    href={`/sting-operations/${op.slug}`}
                    className="flex flex-wrap items-baseline gap-y-2.5 gap-x-6 px-1 py-[15px] border-b border-dark-line hover:bg-surface-dim hover:no-underline"
                  >
                    <span className="flex-none font-sans font-bold text-[16px] text-meta uppercase line-through decoration-danger decoration-[3px]">
                      {opCode(op.slug)}
                    </span>
                    <span className="min-w-0 flex-1 font-sans font-bold text-[18px] text-ink">
                      {op.title}
                    </span>
                    <span className="font-sans font-bold text-[16px] text-safe uppercase">
                      File closed
                    </span>
                    <span className="text-[14px] text-meta uppercase">{byline(op.createdAt)}</span>
                  </Link>
                ))}
              </>
            )}
          </>
        )}

        <p className="mt-[26px] text-[16px] leading-[1.6] text-meta max-w-[80ch]">
          STINGS ARE RUN WITH LEGAL COUNSEL AND, WHERE APPLICABLE, IN COORDINATION WITH LAW
          ENFORCEMENT. ENROLLMENT IS LOGGED. BREAKING OP RULES FORFEITS YOUR TRUST SCORE.
        </p>
      </div>
    </div>
  );
}
