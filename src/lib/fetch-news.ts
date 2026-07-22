import Parser from "rss-parser";
import type { PrismaClient } from "@prisma/client";

// Core RSS-fetch logic shared by the admin server action (src/actions/news.ts)
// and the standalone runner (scripts/fetch-news.ts).

type Item = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  creator?: string;
  enclosure?: { url?: string };
  mediaThumbnail?: { $?: { url?: string } };
  mediaContent?: { $?: { url?: string } }[];
};

const parser: Parser<unknown, Item> = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "BTCSCAM-NewsBot/1.0 (+https://btcscam.com)" },
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent", { keepArray: true }],
    ],
  },
});

function extractImage(item: Item): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (item.mediaContent?.[0]?.$?.url) return item.mediaContent[0].$!.url ?? null;
  const html = item.content ?? "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function clean(s: string | undefined, max = 400): string {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Fetch every active NewsSource and insert unseen items (status "fetched"). Returns items added. */
export async function fetchAllSources(prisma: PrismaClient): Promise<number> {
  const sources = await prisma.newsSource.findMany({ where: { isActive: true } });
  let added = 0;
  for (const src of sources) {
    try {
      const feed = await parser.parseURL(src.feedUrl);
      for (const item of (feed.items ?? []).slice(0, 25)) {
        const url = item.link?.trim();
        const title = clean(item.title, 240);
        if (!url || !title) continue;
        const existing = await prisma.newsFeedItem.findUnique({ where: { url } });
        if (existing) continue;
        await prisma.newsFeedItem.create({
          data: {
            sourceId: src.id,
            sourceName: src.name,
            title,
            url,
            summary: clean(item.contentSnippet || item.content) || null,
            imageUrl: extractImage(item),
            author: item.creator ? clean(item.creator, 80) : null,
            publishedAt: item.isoDate ? new Date(item.isoDate) : null,
            status: "fetched",
          },
        });
        added++;
      }
      await prisma.newsSource.update({ where: { id: src.id }, data: { lastFetchedAt: new Date() } });
    } catch {
      // skip unreachable/malformed feeds; continue with the rest
    }
  }
  return added;
}
