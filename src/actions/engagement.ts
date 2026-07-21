"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string; message?: string };

export async function toggleSaveArticle(articleId: string): Promise<ActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "Sign in to save articles." };
  const existing = await prisma.savedArticle.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
  });
  if (existing) {
    await prisma.savedArticle.delete({ where: { id: existing.id } });
    return { ok: true, message: "removed" };
  }
  await prisma.savedArticle.create({ data: { userId: user.id, articleId } });
  return { ok: true, message: "saved" };
}

export async function verifyScam(scamId: string): Promise<ActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "Sign in to verify." };
  if (!can(user, PRIVILEGES.SCAM_VERIFY)) return { ok: false, error: "You cannot verify entries." };
  const existing = await prisma.scamVerification.findUnique({
    where: { userId_scamId: { userId: user.id, scamId } },
  });
  if (existing) return { ok: false, error: "You already verified this." };
  await prisma.$transaction([
    prisma.scamVerification.create({ data: { userId: user.id, scamId } }),
    prisma.scamEntry.update({ where: { id: scamId }, data: { verifiedCount: { increment: 1 } } }),
  ]);
  revalidatePath("/database");
  return { ok: true, message: "verified" };
}

const subSchema = z.object({
  email: z.string().email("Enter a valid email"),
  list: z.string().default("rug-report"),
});

export async function subscribeAction(email: string, list = "rug-report"): Promise<ActionResult> {
  const parsed = subSchema.safeParse({ email: email.trim().toLowerCase(), list });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    update: { list: parsed.data.list },
    create: { email: parsed.data.email, list: parsed.data.list },
  });
  return { ok: true, message: "Subscribed. Watch your inbox." };
}

export async function voteAction(
  targetType: "thread" | "comment",
  targetId: string,
  value: 1 | -1,
): Promise<ActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "Sign in to vote." };

  const existing = await prisma.vote.findUnique({
    where: { userId_targetType_targetId: { userId: user.id, targetType, targetId } },
  });

  let delta = 0;
  if (!existing) {
    await prisma.vote.create({ data: { userId: user.id, targetType, targetId, value } });
    delta = value;
  } else if (existing.value === value) {
    await prisma.vote.delete({ where: { id: existing.id } });
    delta = -value;
  } else {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
    delta = 2 * value;
  }

  if (targetType === "thread") {
    await prisma.forumThread.update({ where: { id: targetId }, data: { score: { increment: delta } } });
  } else {
    await prisma.forumComment.update({ where: { id: targetId }, data: { score: { increment: delta } } });
  }
  revalidatePath("/forum");
  return { ok: true };
}
