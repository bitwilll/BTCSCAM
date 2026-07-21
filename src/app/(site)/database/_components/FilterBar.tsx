import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { SCAM_TYPES, SCAM_STATUSES } from "@/lib/constants";

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/database?${s}` : "/database";
}

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
      className={`kicker inline-flex items-center px-2.5 py-1 border capitalize transition-colors ${
        active
          ? "bg-ink text-paper border-ink"
          : "border-line-strong text-ink-600 hover:bg-panel hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export function FilterBar({
  type,
  status,
  q,
}: {
  type?: string;
  status?: string;
  q?: string;
}) {
  return (
    <div className="border border-line bg-paper-2 p-5 mb-8 flex flex-col gap-5">
      {/* Search */}
      <form method="get" action="/database" className="flex flex-col sm:flex-row gap-2">
        {type && <input type="hidden" name="type" value={type} />}
        {status && <input type="hidden" name="status" value={status} />}
        <div className="flex-1">
          <label htmlFor="scam-search" className="eyebrow block mb-1.5">
            Search the database
          </label>
          <input
            id="scam-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Name or summary — e.g. drainer, Ledger, pig-butchering"
            className="w-full bg-paper border border-line-strong px-3 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-ink"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" variant="dark" size="md">
            Search
          </Button>
          {(q || type || status) && (
            <Link
              href="/database"
              className="kicker inline-flex items-center px-4 py-2.5 text-xs border border-line-strong text-ink-600 hover:bg-panel hover:text-ink"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Type filter */}
      <div>
        <span className="eyebrow block mb-2">Scam Type</span>
        <div className="flex flex-wrap gap-2">
          <Chip href={qs({ status, q })} active={!type}>
            All types
          </Chip>
          {SCAM_TYPES.map((t) => (
            <Chip key={t} href={qs({ type: t, status, q })} active={type === t}>
              {t.replace(/-/g, " ")}
            </Chip>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div>
        <span className="eyebrow block mb-2">Status</span>
        <div className="flex flex-wrap gap-2">
          <Chip href={qs({ type, q })} active={!status}>
            All statuses
          </Chip>
          {SCAM_STATUSES.map((s) => (
            <Chip key={s} href={qs({ type, status: s, q })} active={status === s}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
