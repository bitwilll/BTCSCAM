import Link from "next/link";

// v4 wordmark: Fraunces 600 — orange BTC + ink SCAM with a 4px red line-through.
// The masthead omits ".COM"; the footer includes it.
export function Wordmark({
  size = "md",
  withCom = false,
  asLink = true,
}: {
  size?: "sm" | "md" | "lg";
  withCom?: boolean;
  asLink?: boolean;
}) {
  const px = { sm: 24, md: 32, lg: 40 }[size];
  const inner = (
    <span className="inline-flex items-baseline" style={{ letterSpacing: "-0.03em" }}>
      <span className="font-display text-brand" style={{ fontSize: px, lineHeight: 1 }}>
        BTC
      </span>
      <span className="font-display text-ink strike-scam" style={{ fontSize: px, lineHeight: 1 }}>
        SCAM
      </span>
      {withCom && (
        <span className="font-sans text-meta ml-2" style={{ fontSize: Math.round(px / 2) }}>
          .COM
        </span>
      )}
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="BTCSCAM.COM home" className="inline-block hover:no-underline">
      {inner}
    </Link>
  );
}
