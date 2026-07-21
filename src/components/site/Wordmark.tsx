import Link from "next/link";

export function Wordmark({
  size = "md",
  invert = false,
  asLink = true,
}: {
  size?: "sm" | "md" | "lg";
  invert?: boolean;
  asLink?: boolean;
}) {
  const sizes = { sm: "text-2xl", md: "text-4xl", lg: "text-5xl" };
  const inner = (
    <span className={`font-display ${sizes[size]} leading-none tracking-tight select-none`}>
      <span className="text-btc">BTC</span>
      <span className={`strike-scam ${invert ? "text-paper" : "text-ink"}`}>SCAM</span>
      <span className="mono align-top text-ink-400" style={{ fontSize: "0.42em", fontWeight: 600 }}>
        .COM
      </span>
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="BTCSCAM.COM home" className="inline-block">
      {inner}
    </Link>
  );
}
