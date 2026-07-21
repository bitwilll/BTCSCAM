import Link from "next/link";
import { SeverityTag } from "@/components/ui";
import { VerifyButton } from "@/components/content/VerifyButton";
import { compactUsd, num, timeAgo, toStrArray } from "@/lib/format";
import { VerificationChip, isStale, StaleNote } from "./verification";

export type ScamEntryRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  chains: unknown;
  status: string;
  severity: string;
  summary: string;
  verifiedCount: number;
  reportCount: number;
  amountAtRiskUsd: bigint | null;
  updatedAt: Date;
};

// v4 db row: sev chip · name/alias · verification + last seen · loss/reports · caret
export function ScamEntryCard({
  entry,
  initialVerified,
}: {
  entry: ScamEntryRow;
  initialVerified: boolean;
}) {
  const chains = toStrArray(entry.chains);
  const lastSeen = timeAgo(entry.updatedAt);
  const stale = isStale(entry.status, lastSeen);

  return (
    <div className="border-b border-rule bg-white">
      <div
        data-dbrow="1"
        className="flex flex-wrap items-center gap-y-2.5 gap-x-[18px] px-[18px] py-4 transition-colors hover:bg-surface-dim"
      >
        <span className="flex-none min-w-[92px] text-center">
          <SeverityTag severity={entry.severity} />
        </span>

        <div className="min-w-0" style={{ flex: "2 1 240px" }}>
          <Link
            href={`/database/${entry.slug}`}
            className="font-display text-[21px] text-ink hover:underline underline-offset-4 decoration-1"
          >
            {entry.name}
          </Link>
          <div className="text-[16px] text-meta mt-0.5 truncate capitalize">
            {entry.type.replace(/-/g, " ")}
            {chains.length > 0 && <span className="normal-case"> · {chains.join(" · ")}</span>}
          </div>
        </div>

        <div className="flex flex-col items-start gap-[5px]" style={{ flex: "1.2 1 160px" }}>
          <VerificationChip status={entry.status} />
          <span className="text-[14px] text-meta">Last seen {lastSeen}</span>
        </div>

        <div className="min-w-0 text-right mono font-semibold text-[16px] text-ink" style={{ flex: "1 1 110px" }}>
          {entry.amountAtRiskUsd != null ? compactUsd(Number(entry.amountAtRiskUsd)) : "—"}
          <div className="mt-0.5 font-sans font-normal text-[14px] text-meta">
            {num(entry.reportCount)} reports
          </div>
        </div>

        <div className="flex-none flex items-center gap-3">
          <VerifyButton
            scamId={entry.id}
            initialCount={entry.verifiedCount}
            initialVerified={initialVerified}
          />
          <Link
            href={`/database/${entry.slug}`}
            className="kicker text-accent hover:underline underline-offset-4"
          >
            Details →
          </Link>
        </div>
      </div>

      {stale && <StaleNote lastSeen={lastSeen} className="mx-[18px] mb-4" />}
    </div>
  );
}
