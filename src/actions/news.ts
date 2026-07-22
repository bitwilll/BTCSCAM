"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES } from "@/lib/constants";
import { DEFAULT_NEWS_SOURCES } from "@/lib/news-sources";
import { fetchAllSources } from "@/lib/fetch-news";
import { slugify } from "@/lib/format";

export type NewsResult = { ok: boolean; error?: string; message?: string; count?: number };

/** Fetch all active sources and upsert new items (status "fetched"). */
export async function fetchNews(): Promise<NewsResult> {
  await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  const hasSources = await prisma.newsSource.count({ where: { isActive: true } });
  if (!hasSources) return { ok: false, error: "No active sources. Add one first." };

  const added = await fetchAllSources(prisma);
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
