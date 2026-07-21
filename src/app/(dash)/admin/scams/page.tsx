import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { PageHeader, SeverityTag, Tag, EmptyState } from "@/components/ui";
import { num, compactUsd, toStrArray } from "@/lib/format";
import { ScamControls } from "./_components/ScamControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Database · Staff · BTCSCAM.COM",
  description: "Curate the tracked scam database — status, severity and community verification.",
};

const STATUS_TONE: Record<string, "red" | "orange" | "green" | "paper" | "outline"> = {
  active: "red",
  monitoring: "orange",
  confirmed: "green",
  frozen: "paper",
  dormant: "outline",
};

const th = "text-left kicker text-ink-500 px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-line";

export default async function ScamsAdminPage() {
  await requirePrivilege(PV.SCAM_EDIT);

  const scams = await prisma.scamEntry.findMany({
    orderBy: [{ verifiedCount: "desc" }],
    take: 300,
  });

  return (
    <div>
      <PageHeader
        kicker="Scam Database"
        title="Tracked Scam Entries"
        lede="Set the operational status and threat severity of every tracked scam. Changes are reflected on the public database instantly."
      />

      <div className="flex flex-wrap gap-6 mb-6 -mt-2 mono text-[11px] uppercase tracking-wide text-ink-500">
        <span><strong className="text-ink">{num(scams.length)}</strong> entries</span>
        <span>
          <strong className="text-alert-strong">{num(scams.filter((s) => s.status === "active").length)}</strong> active
        </span>
      </div>

      {scams.length === 0 ? (
        <EmptyState title="No scam entries" hint="Seed the database to populate the tracker." />
      ) : (
        <div className="border border-line-strong bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-2">
              <tr>
                <th className={th}>Entry</th>
                <th className={th}>Type</th>
                <th className={th}>Chains</th>
                <th className={th}>At Risk</th>
                <th className={th}>Verified</th>
                <th className={th}>Current</th>
                <th className={th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {scams.map((s) => {
                const chains = toStrArray(s.chains);
                return (
                  <tr key={s.id} className="hover:bg-paper-2/60">
                    <td className={td}>
                      <Link
                        href={`/database/${s.slug}`}
                        className="font-bold text-ink leading-tight hover:text-btc-dark block max-w-[260px]"
                      >
                        {s.name}
                      </Link>
                      <div className="mono text-[11px] text-ink-500 mt-1 line-clamp-2 max-w-[260px]">
                        {s.summary}
                      </div>
                    </td>
                    <td className={`${td} mono text-[11px] uppercase text-ink-600 whitespace-nowrap`}>
                      {s.type.replace(/-/g, " ")}
                    </td>
                    <td className={`${td} mono text-[11px] text-ink-600 whitespace-nowrap`}>
                      {chains.length ? chains.join(", ") : "—"}
                    </td>
                    <td className={`${td} font-display text-lg text-alert-strong whitespace-nowrap`}>
                      {s.amountAtRiskUsd != null ? compactUsd(Number(s.amountAtRiskUsd)) : "—"}
                    </td>
                    <td className={`${td} font-display text-lg text-btc-dark whitespace-nowrap`}>
                      {num(s.verifiedCount)}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <div className="flex flex-col gap-1.5 items-start">
                        <Tag tone={STATUS_TONE[s.status] ?? "paper"}>{s.status}</Tag>
                        <SeverityTag severity={s.severity} />
                      </div>
                    </td>
                    <td className={td}>
                      <ScamControls scamId={s.id} status={s.status} severity={s.severity} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
