// Default crypto news RSS sources for the aggregator. Admins can add/remove more.
export const DEFAULT_NEWS_SOURCES = [
  { name: "CoinDesk", feedUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/", homepage: "https://www.coindesk.com" },
  { name: "Cointelegraph", feedUrl: "https://cointelegraph.com/rss", homepage: "https://cointelegraph.com" },
  { name: "Decrypt", feedUrl: "https://decrypt.co/feed", homepage: "https://decrypt.co" },
  { name: "Bitcoin Magazine", feedUrl: "https://bitcoinmagazine.com/.rss/full/", homepage: "https://bitcoinmagazine.com" },
  { name: "CryptoSlate", feedUrl: "https://cryptoslate.com/feed/", homepage: "https://cryptoslate.com" },
  { name: "The Defiant", feedUrl: "https://thedefiant.io/api/feed", homepage: "https://thedefiant.io" },
] as const;

// Keywords that flag an item as scam/security-relevant (for optional highlighting).
export const SCAM_KEYWORDS = [
  "scam", "fraud", "hack", "exploit", "drainer", "phishing", "rug", "ponzi",
  "stolen", "theft", "breach", "laundering", "sanction", "sec charges", "lawsuit",
  "arrest", "seized", "fake", "impersonat", "giveaway", "pig butchering", "honeypot",
];

export function looksScammy(text: string): boolean {
  const t = text.toLowerCase();
  return SCAM_KEYWORDS.some((k) => t.includes(k));
}
