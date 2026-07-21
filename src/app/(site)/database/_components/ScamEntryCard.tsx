import Link from "next/link";
import { Tag, SeverityTag } from "@/components/ui";
import { VerifyButton } from "@/components/content/VerifyButton";
import { compactUsd, num, toStrArray } from "@/lib/format";

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
};

export function ScamEntryCard({
  entry,
  initialVerified,
}: {
  entry: ScamEntryRow;
  initialVerified: boolean;
}) {
  const chains = toStrArray(entry.chains);
  return (
    <article className="border border-line bg-paper-2 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Tag tone="black">{entry.type.replace(/-/g, " ")}</Tag>
            <SeverityTag severity={entry.severity} />
            <span className="kicker text-ink-500">{entry.status}</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl leading-[0.95] text-ink">
            <Link href={`/database/${entry.slug}`} className="hover:text-btc-dark">
              {entry.name}
            </Link>
          </h3>
          {chains.length > 0 && (
            <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-2">
              {chains.join(" · ")}
            </div>
          )}
        </div>
        {entry.amountAtRiskUsd != null && (
          <div className="text-right shrink-0">
            <div className="eyebrow">At Risk</div>
            <div className="font-display text-2xl text-alert-strong leading-none mt-0.5">
              {compactUsd(Number(entry.amountAtRiskUsd))}
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-ink-600 leading-snug mt-3 flex-1">{entry.summary}</p>

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-line">
        <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">
          {num(entry.reportCount)} reports
        </span>
        <VerifyButton
          scamId={entry.id}
          initialCount={entry.verifiedCount}
          initialVerified={initialVerified}
        />
      </div>
    </article>
  );
}
