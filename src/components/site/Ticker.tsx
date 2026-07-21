import { prisma } from "@/lib/db";

type Price = { symbol: string; priceUsd: number; changePct: number };
type AlertItem = { title: string };

function fmtPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

function TickerContent({ prices, alerts }: { prices: Price[]; alerts: AlertItem[] }) {
  const nodes: React.ReactNode[] = [];
  prices.forEach((p, i) => {
    const up = p.changePct >= 0;
    nodes.push(
      <span key={`p-${i}`} className="inline-flex items-center gap-2 px-4">
        <span className="text-paper/60">{p.symbol}</span>
        <span className="text-paper">{fmtPrice(p.priceUsd)}</span>
        <span className={up ? "text-up" : "text-alert"}>
          {up ? "+" : "−"}
          {Math.abs(p.changePct).toFixed(2)}%
        </span>
      </span>,
    );
    // interleave an alert every 3 prices
    if ((i + 1) % 3 === 0 && alerts.length) {
      const a = alerts[(Math.floor(i / 3)) % alerts.length];
      nodes.push(
        <span key={`a-${i}`} className="inline-flex items-center gap-2 px-4">
          <span className="bg-alert-strong text-white px-1.5 py-[1px]">SCAM ALERT</span>
          <span className="text-paper/80 normal-case tracking-normal">{a.title}</span>
        </span>,
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
    <div className="bg-dark text-paper mono text-[11px] tracking-wide font-medium overflow-hidden relative">
      <div className="flex items-stretch">
        <div className="shrink-0 bg-btc text-black px-3 py-2 kicker !text-[11px] flex items-center z-10">
          LIVE
        </div>
        <div className="overflow-hidden flex-1 py-2">
          <div className="ticker-track">
            <TickerContent prices={priceData} alerts={alertData} />
            <TickerContent prices={priceData} alerts={alertData} />
          </div>
        </div>
      </div>
    </div>
  );
}
