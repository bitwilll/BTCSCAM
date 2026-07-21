import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, Kicker, Tag, SeverityTag, StatBlock, ButtonLink } from "@/components/ui";
import { VerifyButton } from "@/components/content/VerifyButton";
import { CopyButton } from "@/components/crypto/CopyButton";
import { compactUsd, num, byline, timeAgo, toStrArray } from "@/lib/format";

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

  return (
    <Container className="py-8 lg:py-10">
      {/* Breadcrumb */}
      <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mb-5">
        <Link href="/database" className="hover:text-btc-dark">
          Scam Database
        </Link>{" "}
        <span className="text-ink-400">/</span> {entry.name}
      </div>

      {/* Masthead */}
      <header className="border-b-2 border-ink pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Tag tone="black">{entry.type.replace(/-/g, " ")}</Tag>
          <SeverityTag severity={entry.severity} />
          <span className="kicker text-ink-500">{entry.status}</span>
          {chains.map((c) => (
            <Tag key={c} tone="paper">
              {c}
            </Tag>
          ))}
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[0.9]">{entry.name}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-600">{entry.summary}</p>
        <div className="mt-4 mono text-[11px] text-ink-500 uppercase tracking-wide flex flex-wrap gap-x-4 gap-y-1">
          <span>First seen {byline(entry.firstSeen)}</span>
          <span>{timeAgo(entry.firstSeen)} on the board</span>
          <span>{num(entry.verifiedCount)} verified</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        {/* Main column */}
        <div>
          {entry.details ? (
            <div className="prose-bs">{renderDetails(entry.details)}</div>
          ) : (
            <p className="text-ink-600">
              No extended write-up yet. Add evidence through{" "}
              <Link href={`/report?scam=${entry.slug}`} className="text-btc-dark underline">
                Report a Scam
              </Link>
              .
            </p>
          )}

          {/* Observed addresses */}
          <section className="mt-10">
            <h2 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-4">
              Observed On-Chain Addresses
            </h2>
            {addresses.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {addresses.map((addr) => (
                  <li
                    key={addr}
                    className="flex items-center justify-between gap-3 border border-line bg-paper-2 px-3 py-2.5"
                  >
                    <code className="mono text-xs sm:text-sm text-ink break-all">{addr}</code>
                    <CopyButton value={addr} label="Copy" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mono text-sm text-ink-500">No addresses recorded yet.</p>
            )}
            <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-3">
              Verify every address independently before acting · Not financial advice
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:border-l lg:border-line lg:pl-8 flex flex-col gap-6">
          {atRisk != null && (
            <StatBlock
              label="Estimated At Risk"
              value={compactUsd(atRisk)}
              sub="reported exposure tied to this operation"
              tone="red"
            />
          )}

          <div className="border border-line bg-paper-2 p-4">
            <div className="eyebrow mb-2">Community Verification</div>
            <p className="mono text-[11px] text-ink-500 uppercase tracking-wide mb-3">
              {num(entry.verifiedCount)} watchmen have corroborated this entry.
            </p>
            <VerifyButton
              scamId={entry.id}
              initialCount={entry.verifiedCount}
              initialVerified={Boolean(ownVerification)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-line bg-paper-2 p-4">
              <div className="eyebrow mb-1">Reports Filed</div>
              <div className="font-display text-3xl text-ink">{num(entry.reportCount)}</div>
            </div>
            <div className="border border-line bg-paper-2 p-4">
              <div className="eyebrow mb-1">Linked Reports</div>
              <div className="font-display text-3xl text-ink">{num(linkedReports)}</div>
            </div>
          </div>

          <div className="bg-dark text-paper p-5">
            <Kicker color="orange">Seen this scam?</Kicker>
            <p className="text-paper/80 text-sm mt-2 mb-4">
              Add your evidence to strengthen the case and warn the next target.
            </p>
            <ButtonLink href={`/report?scam=${entry.slug}`} variant="primary" size="md" full>
              Report to this Entry →
            </ButtonLink>
          </div>
        </aside>
      </div>
    </Container>
  );
}
