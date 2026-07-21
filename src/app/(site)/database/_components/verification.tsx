// v4 verification chips + staleness helpers, shared by the db index rows and the dossier.

const VER_CHIP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Staff-verified", cls: "bg-ink text-paper border border-ink" },
  monitoring: { label: "Under review", cls: "bg-transparent text-gold border border-gold" },
  frozen: { label: "Verified · Frozen", cls: "bg-safe text-white border border-safe" },
  active: { label: "Active", cls: "bg-transparent text-meta border border-dashed border-meta" },
  dormant: { label: "Dormant", cls: "bg-transparent text-meta border border-dashed border-meta" },
};

export function VerificationChip({ status }: { status: string }) {
  const v = VER_CHIP[status] ?? {
    label: "Unverified",
    cls: "bg-transparent text-meta border border-dashed border-meta",
  };
  return (
    <span
      className={`inline-flex items-center px-[9px] py-[3px] font-sans font-bold text-[14px] leading-tight tracking-[.05em] uppercase ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

// v4: intel goes stale when last sighting is months (or years) old, or the op went dormant.
export function isStale(status: string, lastSeenText: string): boolean {
  return status === "dormant" || /\d+(mo|y) ago/.test(lastSeenText);
}

// "LAST SEEN … INTEL MAY BE STALE" warn note (bg-warn / text-warn-fg, 700 14px)
export function StaleNote({ lastSeen, className = "" }: { lastSeen: string; className?: string }) {
  return (
    <div
      role="note"
      className={`flex gap-2.5 items-center bg-warn text-warn-fg px-3.5 py-2.5 font-sans font-bold text-[14px] tracking-[.05em] uppercase ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="flex-none"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <span>Last seen {lastSeen} — intel may be stale. Treat as unconfirmed.</span>
    </div>
  );
}
