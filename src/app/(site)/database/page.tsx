import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, StatBlock, ButtonLink, EmptyState } from "@/components/ui";
import { compactUsd, num } from "@/lib/format";
import { SCAM_TYPES, SCAM_STATUSES } from "@/lib/constants";
import { FilterBar } from "./_components/FilterBar";
import { ScamEntryCard } from "./_components/ScamEntryCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Database — BTCSCAM.COM",
  description:
    "Community-verified intelligence on active crypto scams: ponzis, drainers, impersonation kits, giveaway loops and more. Filter by type, status and chain.",
};

type SearchParams = Promise<{ type?: string; status?: string; q?: string }>;

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const type =
    typeof sp.type === "string" && (SCAM_TYPES as readonly string[]).includes(sp.type)
      ? sp.type
      : undefined;
  const status =
    typeof sp.status === "string" && (SCAM_STATUSES as readonly string[]).includes(sp.status)
      ? sp.status
      : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.ScamEntryWhereInput = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const user = await getSession();

  const [entries, totalEntries, agg, verifiedRows] = await Promise.all([
    prisma.scamEntry.findMany({ where, orderBy: { verifiedCount: "desc" } }),
    prisma.scamEntry.count(),
    prisma.scamEntry.aggregate({
      _sum: { verifiedCount: true, amountAtRiskUsd: true },
    }),
    user
      ? prisma.scamVerification.findMany({
          where: { userId: user.id },
          select: { scamId: true },
        })
      : Promise.resolve([] as { scamId: string }[]),
  ]);

  const verifiedSet = new Set(verifiedRows.map((r) => r.scamId));
  const totalVerified = agg._sum.verifiedCount ?? 0;
  const totalAtRisk =
    agg._sum.amountAtRiskUsd == null ? 0 : Number(agg._sum.amountAtRiskUsd);
  const filtered = Boolean(type || status || q);

  return (
    <Container className="py-8 lg:py-10">
      <PageHeader
        kicker="Community-Verified Intelligence"
        title="Scam Database"
        lede="Every entry is corroborated by the community. Verify what you have seen, filter by type or status, and pull the on-chain trail before you move a single satoshi."
      >
        <ButtonLink href="/report" variant="primary" size="md">
          Report a Scam →
        </ButtonLink>
      </PageHeader>

      {/* Masthead stats — database-wide */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatBlock label="Tracked Entries" value={num(totalEntries)} sub="scams under active watch" />
        <StatBlock
          label="Community Verifications"
          value={num(totalVerified)}
          sub="corroborating signals logged"
          tone="orange"
        />
        <StatBlock
          label="Total At Risk"
          value={compactUsd(totalAtRisk)}
          sub="estimated exposure across the database"
          tone="red"
        />
      </div>

      <FilterBar type={type} status={status} q={q} />

      {/* Results summary */}
      <div className="flex items-baseline justify-between gap-4 section-rule pb-2 mb-6">
        <h2 className="kicker text-sm !tracking-[0.16em]">
          {filtered ? "Filtered Results" : "All Entries"}
        </h2>
        <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">
          {num(entries.length)} {entries.length === 1 ? "entry" : "entries"} · sorted by most verified
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No entries match those filters"
          hint="Try widening the type or status, clearing the search, or filing a fresh report so the community can start tracking it."
          action={
            <div className="flex gap-2">
              <ButtonLink href="/database" variant="outline" size="md">
                Clear filters
              </ButtonLink>
              <ButtonLink href="/report" variant="primary" size="md">
                Report a Scam
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {entries.map((entry) => (
            <ScamEntryCard
              key={entry.id}
              entry={entry}
              initialVerified={verifiedSet.has(entry.id)}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
