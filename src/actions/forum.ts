"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { slugify } from "@/lib/format";

// ─── Return states (consumed by useActionState in client forms) ───
export type ThreadFormState = { error?: string } | null;
export type CommentState = { ok?: boolean; error?: string } | null;

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

// ─── Create a new forum thread ───
const threadSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(160, "Keep the title under 160 characters"),
  body: z.string().trim().min(10, "Body must be at least 10 characters").max(10_000, "That post is too long"),
  categoryId: z.string().trim().min(1, "Choose a category"),
});

export async function createThread(
  _prev: ThreadFormState,
  formData: FormData,
): Promise<ThreadFormState> {
  const user = await getSession();
  if (!user) redirect("/login?next=/forum/new");
  if (!can(user, PRIVILEGES.FORUM_POST))
    return { error: "You don't have permission to start threads." };

  const parsed = threadSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, body, categoryId } = parsed.data;

  const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "That category no longer exists." };

  // slugify(title) + short random suffix guarantees uniqueness; guard against the
  // astronomically-unlikely collision with a short retry loop.
  const base = slugify(title) || "thread";
  let slug = `${base}-${randomSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.forumThread.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) break;
    slug = `${base}-${randomSuffix()}`;
  }

  await prisma.forumThread.create({
    data: {
      slug,
      title,
      body,
      categoryId,
      authorId: user.id,
      upvotes: 1,
      score: 1,
    },
  });

  revalidatePath("/forum");
  revalidatePath(`/forum/${category.slug}`);
  redirect(`/forum/thread/${slug}`);
}

// ─── Add a comment / reply to a thread ───
const commentSchema = z.object({
  body: z.string().trim().min(1, "Write something first").max(5_000, "That comment is too long"),
  threadId: z.string().trim().min(1, "Missing thread"),
  parentId: z.string().trim().optional(),
});

export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const user = await getSession();
  if (!user) return { ok: false, error: "Sign in to comment." };
  if (!can(user, PRIVILEGES.FORUM_COMMENT))
    return { ok: false, error: "You don't have permission to comment." };

  const rawParent = formData.get("parentId");
  const parsed = commentSchema.safeParse({
    body: String(formData.get("body") ?? ""),
    threadId: String(formData.get("threadId") ?? ""),
    parentId: typeof rawParent === "string" && rawParent.length ? rawParent : undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { body, threadId, parentId } = parsed.data;

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { slug: true, isLocked: true },
  });
  if (!thread) return { ok: false, error: "That thread no longer exists." };
  if (thread.isLocked) return { ok: false, error: "This thread is locked." };

  // If replying, the parent must belong to the same thread.
  if (parentId) {
    const parent = await prisma.forumComment.findUnique({
      where: { id: parentId },
      select: { threadId: true },
    });
    if (!parent || parent.threadId !== threadId)
      return { ok: false, error: "That comment can't be replied to." };
  }

  await prisma.forumComment.create({
    data: {
      body,
      threadId,
      parentId: parentId ?? null,
      authorId: user.id,
      upvotes: 1,
      score: 1,
    },
  });

  revalidatePath(`/forum/thread/${thread.slug}`);
  return { ok: true };
}
