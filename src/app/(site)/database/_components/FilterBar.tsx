import type { ReactNode } from "react";
import Link from "next/link";
import { SCAM_TYPES, SCAM_STATUSES } from "@/lib/constants";

export const DB_SEVERITIES = ["critical", "high", "elevated"] as const;

// v4 verification language for our status values
export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  monitoring: "Under review",
  confirmed: "Staff-verified",
  frozen: "Verified · Frozen",
  dormant: "Dormant",
};

export function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/database?${s}` : "/database";
}

// v4 chip: px-[9px] py-[3px] 700 14px — active ink/paper, inactive 1px rule border
function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-[9px] py-[3px] font-sans font-bold text-[14px] leading-tight tracking-[.05em] uppercase transition-colors hover:no-underline ${
        active
          ? "bg-ink text-paper border border-ink"
          : "bg-transparent border border-rule text-body-2 hover:bg-surface-alt"
      }`}
    >
      {children}
    </Link>
  );
}

export function FilterBar({
  type,
  status,
  severity,
  q,
  countLabel,
}: {
  type?: string;
  status?: string;
  severity?: string;
  q?: string;
  countLabel: string;
}) {
  return (
    <>
      {/* Search + report CTA (v4) */}
      <div className="mt-6 flex gap-3 flex-wrap items-center">
        <form
          method="get"
          action="/database"
          className="min-w-0"
          style={{ flex: "1 1 320px" }}
        >
          {type && <input type="hidden" name="type" value={type} />}
          {status && <input type="hidden" name="status" value={status} />}
          {severity && <input type="hidden" name="severity" value={severity} />}
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search name, domain, handle, chain…"
            aria-label="Search the database"
            className="w-full border border-ink bg-white px-4 py-[13px] mono text-[15px] text-ink outline-ink placeholder:text-faint"
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>
        <Link
          href="/report"
          className="inline-flex items-center px-5 py-[13px] kicker bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper hover:no-underline"
        >
          + Report a scam
        </Link>
      </div>

      {/* Filter chip rows (v4) */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-1">Type</span>
          <Chip href={qs({ status, severity, q })} active={!type}>
            All
          </Chip>
          {SCAM_TYPES.map((t) => (
            <Chip key={t} href={qs({ type: t, status, severity, q })} active={type === t}>
              {t.replace(/-/g, " ")}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-1">Severity</span>
          <Chip href={qs({ type, status, q })} active={!severity}>
            All
          </Chip>
          {DB_SEVERITIES.map((s) => (
            <Chip key={s} href={qs({ type, status, severity: s, q })} active={severity === s}>
              {s}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-1">Verification</span>
          <Chip href={qs({ type, severity, q })} active={!status}>
            All
          </Chip>
          {SCAM_STATUSES.map((s) => (
            <Chip key={s} href={qs({ type, status: s, severity, q })} active={status === s}>
              {STATUS_LABELS[s] ?? s}
            </Chip>
          ))}
          <span className="ml-auto text-[14px] text-meta">
            {countLabel}
            {q && (
              <>
                {" · "}
                <Link href={qs({ type, status, severity })} className="text-accent hover:underline underline-offset-4">
                  clear search ×
                </Link>
              </>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
