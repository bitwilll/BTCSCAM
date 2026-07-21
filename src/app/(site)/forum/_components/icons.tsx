// Lucide arrow-up, inlined per the v4 spec (12×12, stroke 2.5).
export function ArrowUpIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      className="lucide lucide-arrow-up"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}
