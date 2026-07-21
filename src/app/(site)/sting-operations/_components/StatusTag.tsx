const STYLE: Record<string, string> = {
  active: "border-safe text-safe",
  planning: "border-gold text-gold",
  closed: "border-meta text-meta",
};

const LABEL: Record<string, string> = {
  active: "Active",
  planning: "Planning",
  closed: "Closed",
};

/** v4 operation-stage chip: 1px outline in the status colour, 700 14 caps. */
export function StatusTag({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-[9px] py-[3px] font-sans font-bold text-[14px] leading-tight tracking-[.05em] uppercase border ${
        STYLE[status] ?? "border-ink text-ink"
      }`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
