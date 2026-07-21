"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES, ARTICLE_CATEGORIES, SEVERITIES } from "@/lib/constants";
import { slugify } from "@/lib/format";

export type CmsState = { error?: string } | null;

const schema = z.object({
  title: z.string().min(6, "Title must be at least 6 characters").max(180),
  dek: z.string().max(400).optional(),
  body: z.string().min(20, "Body must be at least 20 characters"),
  category: z.enum(ARTICLE_CATEGORIES as unknown as [string, ...string[]]).default("news"),
  kicker: z.string().max(40).optional(),
  severity: z.enum(SEVERITIES as unknown as [string, ...string[]]).default("none"),
  coverImageUrl: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  coverLabel: z.string().max(120).optional(),
  sourceName: z.string().max(80).optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  readMinutes: z.coerce.number().int().min(1).max(120).default(5),
  tags: z.string().max(200).optional(),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    dek: String(formData.get("dek") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    category: String(formData.get("category") ?? "news"),
    kicker: String(formData.get("kicker") ?? "").trim(),
    severity: String(formData.get("severity") ?? "none"),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim(),
    coverLabel: String(formData.get("coverLabel") ?? "").trim(),
    sourceName: String(formData.get("sourceName") ?? "").trim(),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    readMinutes: String(formData.get("readMinutes") ?? "5"),
    tags: String(formData.get("tags") ?? "").trim(),
    isFeatured: formData.get("isFeatured") === "on",
    isDeveloping: formData.get("isDeveloping") === "on",
    status: String(formData.get("status") ?? "draft"),
  });
}

function toData(d: z.infer<typeof schema>, formData: FormData, canPublish: boolean) {
  // Non-publishers can't set status=published; clamp to review.
  const status = d.status === "published" && !canPublish ? "review" : d.status;
  const tags = (d.tags ?? "")
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    title: d.title,
    dek: d.dek || null,
    body: d.body,
    category: d.category,
    kicker: d.kicker || null,
    severity: d.severity,
    coverImageUrl: d.coverImageUrl || null,
    coverLabel: d.coverLabel || null,
    sourceName: d.sourceName || null,
    sourceUrl: d.sourceUrl || null,
    readMinutes: d.readMinutes,
    tags,
    isFeatured: formData.get("isFeatured") === "on",
    isDeveloping: formData.get("isDeveloping") === "on",
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
}

export async function createArticle(_prev: CmsState, formData: FormData): Promise<CmsState> {
  const user = await getSession();
  if (!user || !can(user, PRIVILEGES.ARTICLE_CREATE)) return { error: "Not authorized." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const canPublish = can(user, PRIVILEGES.ARTICLE_PUBLISH);
  const base = slugify(parsed.data.title) || "article";
  let slug = base;
  if (await prisma.article.findUnique({ where: { slug } }))
    slug = `${base}-${Date.now().toString(36).slice(-4)}`;

  const article = await prisma.article.create({
    data: { ...toData(parsed.data, formData, canPublish), slug, authorId: user.id },
  });
  await prisma.auditLog.create({
    data: { actorId: user.id, action: "article.create", targetType: "Article", targetId: article.id },
  });
  revalidatePath("/admin/articles");
  revalidatePath("/");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, _prev: CmsState, formData: FormData): Promise<CmsState> {
  const user = await getSession();
  if (!user) return { error: "Not authorized." };
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { error: "Article not found." };

  const isOwner = existing.authorId === user.id;
  const canEdit = can(user, PRIVILEGES.ARTICLE_EDIT_ANY) || (isOwner && can(user, PRIVILEGES.ARTICLE_EDIT_OWN));
  if (!canEdit) return { error: "You can't edit this article." };

  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const canPublish = can(user, PRIVILEGES.ARTICLE_PUBLISH);
  const data = toData(parsed.data, formData, canPublish);
  // Preserve original publishedAt if it was already published and stays published.
  if (data.status === "published" && existing.publishedAt) data.publishedAt = existing.publishedAt;

  await prisma.article.update({ where: { id }, data });
  await prisma.auditLog.create({
    data: { actorId: user.id, action: "article.update", targetType: "Article", targetId: id },
  });
  revalidatePath("/admin/articles");
  revalidatePath(`/article/${existing.slug}`);
  revalidatePath("/");
  redirect("/admin/articles");
}
