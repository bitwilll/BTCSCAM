import Link from "next/link";
import { prisma } from "@/lib/db";

type Price = { symbol: string; priceUsd: number; changePct: number };
type AlertItem = { title: string };

function fmtPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

// v4 ticker: dark strip, items separated by 1px #26261F rules, mono prices,
// red SCAM ALERT chips linking to /alerts. No LIVE badge.
function TickerContent({ prices, alerts }: { prices: Price[]; alerts: AlertItem[] }) {
  const nodes: React.ReactNode[] = [];
  prices.forEach((p, i) => {
    const up = p.changePct >= 0;
    nodes.push(
      <div
        key={`p-${i}`}
        className="flex items-center gap-2.5 px-[22px] py-[9px] border-r border-dark-line whitespace-nowrap"
      >
        <span className="mono font-semibold text-[14px] text-faint">{p.symbol}</span>
        <span className="mono font-medium text-[14px] text-paper">{fmtPrice(p.priceUsd)}</span>
        <span className={`mono font-semibold text-[14px] ${up ? "text-up" : "text-down"}`}>
          {up ? "+" : "−"}
          {Math.abs(p.changePct).toFixed(2)}%
        </span>
      </div>,
    );
    if ((i + 1) % 3 === 0 && alerts.length) {
      const a = alerts[Math.floor(i / 3) % alerts.length];
      nodes.push(
        <div
          key={`a-${i}`}
          className="flex items-center gap-2.5 px-[22px] py-[9px] border-r border-dark-line whitespace-nowrap text-[14px]"
        >
          <span className="bg-danger text-white px-[9px] py-[2px] tracking-[.05em]">
            SCAM ALERT
          </span>
          <Link href="/alerts" tabIndex={-1} className="text-paper hover:underline underline-offset-[3px]">
            {a.title}
          </Link>
        </div>,
      );
    }
  });
  return <>{nodes}</>;
}

export async function Ticker() {
  const [prices, alerts] = await Promise.all([
    prisma.marketTicker.findMany({ orderBy: { symbol: "asc" } }).catch(() => []),
    prisma.alert
      .findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 6 })
      .catch(() => []),
  ]);

  const priceData: Price[] = prices.length
    ? prices.map((p) => ({ symbol: p.symbol, priceUsd: p.priceUsd, changePct: p.changePct }))
    : [{ symbol: "BTC", priceUsd: 121437, changePct: 2.14 }];
  const alertData: AlertItem[] = alerts.map((a) => ({ title: a.title }));

  return (
    <div className="bg-dark text-ticker border-b border-ink flex items-stretch overflow-hidden">
      <div className="overflow-hidden flex-1">
        <div className="ticker-track">
          <TickerContent prices={priceData} alerts={alertData} />
          <TickerContent prices={priceData} alerts={alertData} />
        </div>
      </div>
    </div>
  );
}
