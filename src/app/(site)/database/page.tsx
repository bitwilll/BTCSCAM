import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container } from "@/components/ui";
import { compactUsd, num, timeAgo } from "@/lib/format";
import { SCAM_TYPES, SCAM_STATUSES } from "@/lib/constants";
import { FilterBar, DB_SEVERITIES, qs } from "./_components/FilterBar";
import { ScamEntryCard } from "./_components/ScamEntryCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Database — BTCSCAM.COM",
  description:
    "Community-verified intelligence on active crypto scams: ponzis, drainers, impersonation kits, giveaway loops and more. Filter by type, status and chain.",
};

type SearchParams = Promise<{ type?: string; status?: string; severity?: string; q?: string }>;

// v4 severity palette (stat squares + proportion bar)
const SEV_META: { key: string; label: string; color: string }[] = [
  { key: "critical", label: "Critical", color: "#D2322E" },
  { key: "high", label: "High", color: "#E0574F" },
  { key: "elevated", label: "Elevated", color: "#C9A227" },
];

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
  const severity =
    typeof sp.severity === "string" && (DB_SEVERITIES as readonly string[]).includes(sp.severity)
      ? sp.severity
      : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.ScamEntryWhereInput = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const user = await getSession();

  const [entries, totalEntries, agg, sevGroups, topReported, verifiedRows] = await Promise.all([
    prisma.scamEntry.findMany({ where, orderBy: { verifiedCount: "desc" } }),
    prisma.scamEntry.count(),
    prisma.scamEntry.aggregate({
      _sum: { verifiedCount: true, amountAtRiskUsd: true },
      _max: { updatedAt: true },
    }),
    prisma.scamEntry.groupBy({ by: ["severity"], _count: { _all: true } }),
    prisma.scamEntry.findMany({
      orderBy: { reportCount: "desc" },
      take: 4,
      select: { id: true, slug: true, name: true, reportCount: true },
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
  const lastSweep = agg._max.updatedAt ? timeAgo(agg._max.updatedAt).toUpperCase() : "—";

  const sevCounts = new Map(sevGroups.map((g) => [g.severity, g._count._all]));
  const sevStats = SEV_META.map((m) => {
    const count = sevCounts.get(m.key) ?? 0;
    return {
      ...m,
      count,
      pct: `${Math.round((count / Math.max(1, totalEntries)) * 100)}%`,
      active: severity === m.key,
      // toggling filter, preserving the rest of the query
      href: qs({ type, status, q, severity: severity === m.key ? undefined : m.key }),
    };
  });

  const maxRep = Math.max(1, ...topReported.map((t) => t.reportCount));
  const countLabel = `${num(entries.length)} ${entries.length === 1 ? "ENTRY" : "ENTRIES"} · ${num(
    totalVerified
  )} VERIFICATIONS LOGGED`;

  return (
    <Container wide className="pt-8 pb-14 fade-up">
      {/* ── Title area (v4) ── */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="kicker text-meta">Community-verified registry</div>
          <h1 className="mt-1.5 font-display text-[32px] leading-[1.15] text-ink">
            The Scam Database
          </h1>
          <p className="mt-2.5 text-[16px] leading-[1.6] text-body-2 max-w-[56ch]">
            Every entry starts as a community report and survives two rounds of verification.
            Check before you send.
          </p>
        </div>
        <div className="text-right mono font-medium text-[14px] text-meta uppercase">
          Last sweep
          <br />
          <span className="text-ink font-semibold">{lastSweep}</span>
        </div>
      </div>

      {/* ── Totals strip: severity stats + at-risk, proportion bar (v4) ── */}
      <div className="mt-5 bg-white shadow-card px-5 py-[18px]">
        <div className="flex gap-7 flex-wrap items-baseline">
          {sevStats.map((sv) => (
            <Link
              key={sv.key}
              href={sv.href}
              aria-label={`Filter by ${sv.label}`}
              className={`flex items-baseline gap-2 hover:opacity-75 hover:no-underline ${
                sv.active ? "border-b-2 border-ink pb-[3px]" : "pb-[5px]"
              }`}
            >
              <span
                className="w-2 h-2 flex-none self-center"
                style={{ background: sv.color }}
                aria-hidden="true"
              />
              <span className="font-black text-[24px] text-ink">{num(sv.count)}</span>
              <span className="text-[14px] text-meta">{sv.label}</span>
            </Link>
          ))}
          <div className="ml-auto flex items-baseline gap-2">
            <span className="mono font-black text-[24px] text-danger">
              {compactUsd(totalAtRisk)}
            </span>
            <span className="text-[14px] text-meta">at risk</span>
          </div>
        </div>
        <div className="flex h-2 mt-3.5 bg-surface-dim overflow-hidden" aria-hidden="true">
          {sevStats.map((sv) => (
            <span key={sv.key} style={{ width: sv.pct, background: sv.color }} />
          ))}
        </div>
      </div>

      {/* ── Search + filter chips (v4) ── */}
      <FilterBar type={type} status={status} severity={severity} q={q} countLabel={countLabel} />

      <div className="flex gap-8 flex-wrap">
        {/* ── DB rows ── */}
        <div className="min-w-0" style={{ flex: "2.2 1 560px" }}>
          <div className="mt-[18px] border-t border-ink">
            {entries.length === 0 ? (
              <div role="status" className="px-6 py-11 text-center bg-white border-b border-rule">
                <div className="font-display text-[21px] text-ink">
                  No tracked entry matches your search.
                </div>
                <p className="mt-2.5 mx-auto text-[16px] leading-[1.6] text-body-2 max-w-[48ch]">
                  Unlisted does not mean safe — it may just mean unreported. If something feels
                  wrong, file it and the desk will verify.
                </p>
                <Link
                  href="/report"
                  className="inline-flex mt-4 px-[22px] py-3 kicker bg-ink text-paper border border-ink hover:bg-action-hover hover:no-underline"
                >
                  Be the first to report it
                </Link>
              </div>
            ) : (
              entries.map((entry) => (
                <ScamEntryCard
                  key={entry.id}
                  entry={entry}
                  initialVerified={verifiedSet.has(entry.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="mt-[18px]" style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div className="bg-white shadow-card p-[18px]">
            <h3 className="kicker text-meta">Most-reported this week</h3>
            {topReported.map((tp) => (
              <div
                key={tp.id}
                className="flex items-center gap-2.5 py-2.5 border-b border-rule last:border-b-0"
              >
                <Link
                  href={`/database/${tp.slug}`}
                  className="flex-1 min-w-0 font-display text-[16px] text-ink whitespace-nowrap overflow-hidden text-ellipsis hover:underline underline-offset-4 decoration-1"
                >
                  {tp.name}
                </Link>
                <span className="flex-none w-16 h-1.5 bg-surface-dim">
                  <span
                    className="block h-full bg-danger"
                    style={{ width: `${Math.round((tp.reportCount / maxRep) * 100)}%` }}
                  />
                </span>
                <span className="mono font-semibold text-[14px] text-body-2">
                  {num(tp.reportCount)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-white shadow-card p-[18px]">
            <h3 className="kicker text-meta">Check before you send</h3>
            <form action="/wallet-test" method="get">
              <input
                name="q"
                placeholder="Paste address or domain"
                aria-label="Wallet address or domain to check"
                className="mt-3 w-full border border-ink bg-paper text-ink px-3 py-[11px] mono font-medium text-[14px] outline-ink placeholder:text-faint"
              />
              <button
                type="submit"
                className="mt-2.5 w-full py-[11px] kicker bg-ink text-paper border border-ink cursor-pointer hover:bg-action-hover"
              >
                Test it
              </button>
            </form>
          </div>
        </aside>
      </div>
    </Container>
  );
}
