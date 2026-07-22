import type { PrismaClient } from "@prisma/client";

// Live ticker prices: MarketTicker rows act as a cache of real CoinGecko data.
// When the newest row is older than REFRESH_MS we re-fetch and upsert; on any
// failure the cached rows render unchanged, so the strip never breaks the page.

const REFRESH_MS = 5 * 60 * 1000;

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  BNB: "binancecoin",
  DOGE: "dogecoin",
  ADA: "cardano",
  LINK: "chainlink",
};

type Row = { symbol: string; priceUsd: number; changePct: number };

export async function getTickerPrices(prisma: PrismaClient): Promise<Row[]> {
  const rows = await prisma.marketTicker.findMany({ orderBy: { symbol: "asc" } }).catch(() => []);
  const newest = rows.reduce<Date | null>(
    (acc, r) => (acc && acc > r.updatedAt ? acc : r.updatedAt),
    null,
  );
  const stale = !newest || Date.now() - newest.getTime() > REFRESH_MS;
  if (!stale) return rows;

  try {
    const ids = Object.values(COINGECKO_IDS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" },
    );
    if (!res.ok) return rows;
    const data: Record<string, { usd?: number; usd_24h_change?: number }> = await res.json();
    const fresh: Row[] = [];
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      const d = data[id];
      if (!d || typeof d.usd !== "number") continue;
      const row = { symbol, priceUsd: d.usd, changePct: d.usd_24h_change ?? 0 };
      fresh.push(row);
      await prisma.marketTicker.upsert({
        where: { symbol },
        create: row,
        update: { priceUsd: row.priceUsd, changePct: row.changePct },
      });
    }
    return fresh.length ? fresh.sort((a, b) => a.symbol.localeCompare(b.symbol)) : rows;
  } catch {
    return rows; // network hiccup — serve cached prices
  }
}
