import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, Tag, SeverityTag, StatBlock, ButtonLink } from "@/components/ui";
import { CopyButton } from "@/components/crypto/CopyButton";
import { compactUsd, num, byline, timeAgo, toStrArray } from "@/lib/format";
import { VerificationChip, isStale, StaleNote } from "../_components/verification";
import { VerdictButtons } from "../_components/VerdictButtons";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.scamEntry.findUnique({
    where: { slug },
    select: { name: true, summary: true },
  });
  if (!entry) return { title: "Entry not found — BTCSCAM.COM" };
  return {
    title: `${entry.name} — Scam Database — BTCSCAM.COM`,
    description: entry.summary,
  };
}

// Minimal, safe markdown-ish renderer for the details field (no raw HTML injection).
function renderDetails(md: string) {
  return md
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("### ")) return <h3 key={i}>{block.slice(4)}</h3>;
      if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
      return <p key={i}>{block}</p>;
    });
}

export default async function ScamDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const entry = await prisma.scamEntry.findUnique({ where: { slug } });
  if (!entry) notFound();

  const user = await getSession();

  const [linkedReports, ownVerification] = await Promise.all([
    prisma.scamReport.count({ where: { linkedScamId: entry.id } }),
    user
      ? prisma.scamVerification.findUnique({
          where: { userId_scamId: { userId: user.id, scamId: entry.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const chains = toStrArray(entry.chains);
  const addresses = toStrArray(entry.addresses);
  const atRisk = entry.amountAtRiskUsd != null ? Number(entry.amountAtRiskUsd) : null;
  const lastSeen = timeAgo(entry.updatedAt);
  const stale = isStale(entry.status, lastSeen);
  const staffVerified = entry.status === "confirmed" || entry.status === "frozen";

  return (
    <Container className="pt-8 pb-14 fade-up">
      {/* Breadcrumb */}
      <div className="kicker text-meta mb-5">
        <Link href="/database" className="hover:text-ink hover:underline underline-offset-4">
          Scam Database
        </Link>{" "}
        <span className="text-faint">/</span> {entry.name}
      </div>

      {/* ── Dossier masthead (v4) ── */}
      <header className="border-b border-ink pb-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Tag tone="black">{entry.type.replace(/-/g, " ")}</Tag>
          <SeverityTag severity={entry.severity} />
          <VerificationChip status={entry.status} />
          {chains.map((c) => (
            <Tag key={c} tone="paper">
              {c}
            </Tag>
          ))}
        </div>
        <h1
          className="font-display text-ink"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.12, textWrap: "balance" }}
        >
          {entry.name}
        </h1>
        <p
          className="mt-4 max-w-2xl text-[18px] leading-[1.6] text-body-2"
          style={{ textWrap: "pretty" }}
        >
          {entry.summary}
        </p>
        <div className="mt-4 text-[14px] text-meta uppercase tracking-[.05em] flex flex-wrap gap-x-4 gap-y-1">
          <span>First seen {byline(entry.firstSeen)}</span>
          <span>Last seen {lastSeen}</span>
          <span>{num(entry.verifiedCount)} verified</span>
        </div>
      </header>

      {/* ── Stale-intel warn strip (v4) ── */}
      {stale && <StaleNote lastSeen={lastSeen} className="mb-6" />}

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        {/* ── Main column ── */}
        <div>
          <div className="kicker text-meta">Summary</div>
          {entry.details ? (
            <div className="prose-bs mt-2">{renderDetails(entry.details)}</div>
          ) : (
            <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-[70ch]">
              No extended write-up yet. Add evidence through{" "}
              <Link
                href={`/report?scam=${entry.slug}`}
                className="text-accent font-bold hover:underline underline-offset-4"
              >
                Report a Scam
              </Link>
              .
            </p>
          )}

          {/* Linked wallets (v4: dark mono blocks) */}
          <section className="mt-10">
            <div className="kicker text-meta">Linked wallets</div>
            {addresses.length > 0 ? (
              <ul className="flex flex-col gap-1.5 mt-2">
                {addresses.map((addr) => (
                  <li key={addr} className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 mono font-semibold text-[15px] sm:text-[16px] bg-dark text-brand px-3 py-2 break-all">
                      {addr}
                    </code>
                    <CopyButton value={addr} label="Copy" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[14px] text-meta">No addresses recorded yet.</p>
            )}
            <p className="eyebrow mt-3">
              Verify every address independently before acting · Not financial advice
            </p>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-6">
          {atRisk != null && (
            <StatBlock
              dark
              label="Amount at risk"
              value={compactUsd(atRisk)}
              sub="reported exposure tied to this operation"
            />
          )}

          <div>
            <div className="kicker text-meta">Community verdict</div>
            <p className="mt-2 mb-2.5 text-[14px] text-meta">
              {num(entry.verifiedCount)} watchmen have corroborated this entry.
            </p>
            <VerdictButtons
              scamId={entry.id}
              slug={entry.slug}
              initialCount={entry.verifiedCount}
              initialVerified={Boolean(ownVerification)}
            />
          </div>

          {/* Related reports */}
          <div>
            <div className="kicker text-meta">Related reports</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border border-rule bg-surface-dim p-4">
                <div className="eyebrow mb-1">Reports filed</div>
                <div className="mono font-black text-[28px] text-ink">
                  {num(entry.reportCount)}
                </div>
              </div>
              <div className="border border-rule bg-surface-dim p-4">
                <div className="eyebrow mb-1">Linked reports</div>
                <div className="mono font-black text-[28px] text-ink">{num(linkedReports)}</div>
              </div>
            </div>
          </div>

          {staffVerified && (
            <div>
              <div className="kicker text-meta">How verified</div>
              <p className="mt-2 text-[16px] leading-[1.55]" style={{ color: "#3E3B35" }}>
                Two independent verifiers reproduced the indicators; staff review signed off.
                First seen {byline(entry.firstSeen)}.
              </p>
            </div>
          )}

          <div>
            <div className="kicker text-meta">Timeline</div>
            <div className="mt-2 text-[16px] text-body-2">
              First seen {byline(entry.firstSeen)} · last {lastSeen}
            </div>
          </div>

          <div>
            <ButtonLink href={`/report?scam=${entry.slug}`} variant="ghost" size="md" full>
              Report a sighting →
            </ButtonLink>
            <Link
              href="/database"
              className="inline-block mt-3 kicker text-accent hover:underline underline-offset-4"
            >
              Open the full database →
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
