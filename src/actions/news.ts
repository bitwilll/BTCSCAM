"use server";

import Parser from "rss-parser";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES } from "@/lib/constants";
import { DEFAULT_NEWS_SOURCES } from "@/lib/news-sources";
import { slugify } from "@/lib/format";

export type NewsResult = { ok: boolean; error?: string; message?: string; count?: number };

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

/** Fetch all active sources and upsert new items (status "fetched"). */
export async function fetchNews(): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  const sources = await prisma.newsSource.findMany({ where: { isActive: true } });
  if (!sources.length) return { ok: false, error: "No active sources. Add one first." };

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
  revalidatePath("/admin/news");
  return { ok: true, message: `Fetched ${added} new item${added === 1 ? "" : "s"}.`, count: added };
}

/** Push a fetched item into an attributed Article DRAFT for a copywriter to rewrite. */
export async function pushNewsItem(id: string): Promise<NewsResult> {
  const actor = await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  const item = await prisma.newsFeedItem.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "Item not found." };
  if (item.pushedArticleId) return { ok: false, error: "Already pushed." };

  const slug = `${slugify(item.title)}-${Date.now().toString(36).slice(-4)}`;
  const article = await prisma.article.create({
    data: {
      slug,
      title: item.title,
      dek: item.summary?.slice(0, 300) ?? null,
      body:
        `> Draft imported from ${item.sourceName}. **Rewrite in your own words before publishing** — do not republish the source verbatim.\n\n` +
        `${item.summary ?? ""}\n\n[Read the original at ${item.sourceName}](${item.url})`,
      kicker: "News",
      category: "news",
      status: "draft",
      coverImageUrl: item.imageUrl,
      sourceName: item.sourceName,
      sourceUrl: item.url,
      authorId: actor.id,
      publishedAt: null,
    },
  });
  await prisma.newsFeedItem.update({
    where: { id },
    data: { status: "published", pushedArticleId: article.id },
  });
  await prisma.auditLog.create({
    data: { actorId: actor.id, action: "news.push", targetType: "Article", targetId: article.id, meta: { source: item.sourceName } },
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin/articles");
  return { ok: true, message: "Pushed to a draft article. Edit & rewrite before publishing.", count: 1 };
}

export async function dismissNewsItem(id: string): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  await prisma.newsFeedItem.update({ where: { id }, data: { status: "dismissed" } });
  revalidatePath("/admin/news");
  return { ok: true };
}

export async function restoreNewsItem(id: string): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  await prisma.newsFeedItem.update({ where: { id }, data: { status: "fetched" } });
  revalidatePath("/admin/news");
  return { ok: true };
}

const sourceSchema = z.object({
  name: z.string().min(2).max(60),
  feedUrl: z.string().url(),
  homepage: z.string().url().optional().or(z.literal("")),
});

export async function addSource(prev: unknown, formData: FormData): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE, "/admin/news");
  const parsed = sourceSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    feedUrl: String(formData.get("feedUrl") ?? "").trim(),
    homepage: String(formData.get("homepage") ?? "").trim(),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await prisma.newsSource.create({
      data: { name: parsed.data.name, feedUrl: parsed.data.feedUrl, homepage: parsed.data.homepage || null },
    });
  } catch {
    return { ok: false, error: "That feed URL already exists." };
  }
  revalidatePath("/admin/news");
  return { ok: true, message: "Source added." };
}

export async function toggleSource(id: string): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE, "/admin/news");
  const s = await prisma.newsSource.findUnique({ where: { id } });
  if (!s) return { ok: false, error: "Not found." };
  await prisma.newsSource.update({ where: { id }, data: { isActive: !s.isActive } });
  revalidatePath("/admin/news");
  return { ok: true };
}

export async function removeSource(id: string): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE, "/admin/news");
  await prisma.newsSource.delete({ where: { id } });
  revalidatePath("/admin/news");
  return { ok: true };
}

/** Seed the default crypto sources (idempotent). */
export async function seedDefaultSources(): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE, "/admin/news");
  let added = 0;
  for (const s of DEFAULT_NEWS_SOURCES) {
    const exists = await prisma.newsSource.findUnique({ where: { feedUrl: s.feedUrl } });
    if (!exists) {
      await prisma.newsSource.create({ data: { name: s.name, feedUrl: s.feedUrl, homepage: s.homepage } });
      added++;
    }
  }
  revalidatePath("/admin/news");
  return { ok: true, message: `Added ${added} default source${added === 1 ? "" : "s"}.` };
}
