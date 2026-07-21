"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import type { SessionUser } from "@/lib/rbac";
import type { Privilege } from "@/lib/constants";
import {
  PRIVILEGES as PV,
  REPORT_STATUSES,
  SCAM_STATUSES,
  ORDER_STATUSES,
  CONSULT_STATUSES,
} from "@/lib/constants";
import { slugify } from "@/lib/format";

export type Result = { ok: boolean; error?: string };

const ARTICLE_STATUSES = ["draft", "review", "published", "archived"] as const;
const SCAM_SEVERITIES = ["elevated", "high", "critical"] as const;
const MEDIA_KINDS = ["podcast", "video"] as const;
const STING_STATUSES = ["active", "closed", "planning"] as const;

// ── Guards & helpers ───────────────────────────────────────────────────────

type Authorized = { user: SessionUser } | { error: string };

/** Resolve the current staff user and confirm a privilege, without redirecting
 *  (keeps the {ok,error} contract intact for client-invoked actions). */
async function authorize(priv: Privilege): Promise<Authorized> {
  const user = await getSession();
  if (!user) return { error: "You need to sign in." };
  if (!can(user, priv)) return { error: "You do not have permission for this action." };
  return { user };
}

function fail(err: string): Result {
  return { ok: false, error: err };
}

function oneOf(value: string, options: readonly string[]): boolean {
  return options.includes(value);
}

async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      meta: meta as unknown as Prisma.InputJsonValue,
    },
  });
}

/** Generate a slug from `title` that is unique per model. */
async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i++}`;
  }
  return candidate;
}

// ── Scam reports ───────────────────────────────────────────────────────────

export async function setReportStatus(reportId: string, status: string): Promise<Result> {
  const auth = await authorize(PV.REPORT_TRIAGE);
  if ("error" in auth) return fail(auth.error);
  if (!reportId) return fail("Missing report.");
  if (!oneOf(status, REPORT_STATUSES)) return fail("Invalid status.");

  await prisma.scamReport.update({ where: { id: reportId }, data: { status } });
  await audit(auth.user.id, "report.status", "ScamReport", reportId, { status });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function assignReport(reportId: string, assignedToId: string): Promise<Result> {
  const auth = await authorize(PV.REPORT_ASSIGN);
  if ("error" in auth) return fail(auth.error);
  if (!reportId) return fail("Missing report.");
  const assignee = assignedToId || null;

  if (assignee) {
    const staff = await prisma.user.findUnique({ where: { id: assignee }, select: { id: true } });
    if (!staff) return fail("Unknown assignee.");
  }

  await prisma.scamReport.update({ where: { id: reportId }, data: { assignedToId: assignee } });
  await audit(auth.user.id, "report.assign", "ScamReport", reportId, { assignedToId: assignee });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function linkReportScam(reportId: string, scamId: string): Promise<Result> {
  const auth = await authorize(PV.REPORT_TRIAGE);
  if ("error" in auth) return fail(auth.error);
  if (!reportId) return fail("Missing report.");
  const linked = scamId || null;

  if (linked) {
    const scam = await prisma.scamEntry.findUnique({ where: { id: linked }, select: { id: true } });
    if (!scam) return fail("Unknown scam entry.");
  }

  await prisma.scamReport.update({ where: { id: reportId }, data: { linkedScamId: linked } });
  await audit(auth.user.id, "report.link", "ScamReport", reportId, { linkedScamId: linked });
  revalidatePath("/admin/reports");
  return { ok: true };
}

// ── Articles ───────────────────────────────────────────────────────────────

export async function setArticleStatus(articleId: string, status: string): Promise<Result> {
  const auth = await authorize(PV.ARTICLE_CREATE);
  if ("error" in auth) return fail(auth.error);
  if (!articleId) return fail("Missing article.");
  if (!oneOf(status, ARTICLE_STATUSES)) return fail("Invalid status.");
  if (status === "published" && !can(auth.user, PV.ARTICLE_PUBLISH)) {
    return fail("You cannot publish articles.");
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { publishedAt: true },
  });
  if (!existing) return fail("Article not found.");

  await prisma.article.update({
    where: { id: articleId },
    data: {
      status,
      // Stamp a publish date the first time it goes live.
      publishedAt: status === "published" && !existing.publishedAt ? new Date() : undefined,
    },
  });
  await audit(auth.user.id, "article.status", "Article", articleId, { status });
  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleFeature(articleId: string): Promise<Result> {
  const auth = await authorize(PV.ARTICLE_PUBLISH);
  if ("error" in auth) return fail(auth.error);
  if (!articleId) return fail("Missing article.");

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { isFeatured: true },
  });
  if (!article) return fail("Article not found.");

  await prisma.article.update({
    where: { id: articleId },
    data: { isFeatured: !article.isFeatured },
  });
  await audit(auth.user.id, "article.feature", "Article", articleId, { isFeatured: !article.isFeatured });
  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteArticle(articleId: string): Promise<Result> {
  const auth = await authorize(PV.ARTICLE_DELETE);
  if ("error" in auth) return fail(auth.error);
  if (!articleId) return fail("Missing article.");

  await prisma.article.delete({ where: { id: articleId } });
  await audit(auth.user.id, "article.delete", "Article", articleId);
  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true };
}

// ── Scam database ──────────────────────────────────────────────────────────

export async function setScamStatus(
  scamId: string,
  status: string,
  severity: string,
): Promise<Result> {
  const auth = await authorize(PV.SCAM_EDIT);
  if ("error" in auth) return fail(auth.error);
  if (!scamId) return fail("Missing scam entry.");
  if (!oneOf(status, SCAM_STATUSES)) return fail("Invalid status.");
  if (!oneOf(severity, SCAM_SEVERITIES)) return fail("Invalid severity.");

  await prisma.scamEntry.update({ where: { id: scamId }, data: { status, severity } });
  await audit(auth.user.id, "scam.status", "ScamEntry", scamId, { status, severity });
  revalidatePath("/admin/scams");
  revalidatePath("/database");
  return { ok: true };
}

// ── Store / products ───────────────────────────────────────────────────────

export async function toggleProduct(productId: string): Promise<Result> {
  const auth = await authorize(PV.STORE_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!productId) return fail("Missing product.");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { isActive: true },
  });
  if (!product) return fail("Product not found.");

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });
  await audit(auth.user.id, "product.toggle", "Product", productId, { isActive: !product.isActive });
  revalidatePath("/admin/store");
  revalidatePath("/store");
  return { ok: true };
}

const stockSchema = z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative").max(1_000_000);

export async function setStock(productId: string, stock: number): Promise<Result> {
  const auth = await authorize(PV.STORE_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!productId) return fail("Missing product.");
  const parsed = stockSchema.safeParse(stock);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await prisma.product.update({ where: { id: productId }, data: { stock: parsed.data } });
  await audit(auth.user.id, "product.stock", "Product", productId, { stock: parsed.data });
  revalidatePath("/admin/store");
  revalidatePath("/store");
  return { ok: true };
}

// ── Orders ─────────────────────────────────────────────────────────────────

type TimelineEntry = { status: string; at: string; note?: string | null };

export async function setOrderStatus(
  orderId: string,
  status: string,
  note?: string,
): Promise<Result> {
  const auth = await authorize(PV.ORDER_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!orderId) return fail("Missing order.");
  if (!oneOf(status, ORDER_STATUSES)) return fail("Invalid status.");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { timeline: true, paidAt: true },
  });
  if (!order) return fail("Order not found.");

  const timeline: TimelineEntry[] = Array.isArray(order.timeline)
    ? (order.timeline as unknown as TimelineEntry[])
    : [];
  const entry: TimelineEntry = {
    status,
    at: new Date().toISOString(),
    note: note?.trim() ? note.trim().slice(0, 300) : null,
  };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      timeline: [...timeline, entry] as unknown as Prisma.InputJsonValue,
      paidAt: status === "paid" && !order.paidAt ? new Date() : undefined,
    },
  });
  await audit(auth.user.id, "order.status", "Order", orderId, { status });
  revalidatePath("/admin/orders");
  return { ok: true };
}

const trackingSchema = z.object({
  carrier: z.string().trim().min(2, "Carrier is required").max(60),
  number: z.string().trim().min(3, "Tracking number is required").max(80),
});

export async function addTracking(
  orderId: string,
  carrier: string,
  number: string,
): Promise<Result> {
  const auth = await authorize(PV.ORDER_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!orderId) return fail("Missing order.");
  const parsed = trackingSchema.safeParse({ carrier, number });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { timeline: true },
  });
  if (!order) return fail("Order not found.");

  const timeline: TimelineEntry[] = Array.isArray(order.timeline)
    ? (order.timeline as unknown as TimelineEntry[])
    : [];
  const entry: TimelineEntry = {
    status: "tracking",
    at: new Date().toISOString(),
    note: `${parsed.data.carrier} · ${parsed.data.number}`,
  };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingCarrier: parsed.data.carrier,
      trackingNumber: parsed.data.number,
      timeline: [...timeline, entry] as unknown as Prisma.InputJsonValue,
    },
  });
  await audit(auth.user.id, "order.tracking", "Order", orderId, {
    carrier: parsed.data.carrier,
    number: parsed.data.number,
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}

// ── Donations ──────────────────────────────────────────────────────────────

export async function confirmDonation(donationId: string): Promise<Result> {
  const auth = await authorize(PV.DONATION_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!donationId) return fail("Missing donation.");

  await prisma.donation.update({ where: { id: donationId }, data: { status: "confirmed" } });
  await audit(auth.user.id, "donation.confirm", "Donation", donationId);
  revalidatePath("/admin/donations");
  return { ok: true };
}

// ── Consultations ──────────────────────────────────────────────────────────

export async function setConsultStatus(requestId: string, status: string): Promise<Result> {
  const auth = await authorize(PV.CONSULT_HANDLE);
  if ("error" in auth) return fail(auth.error);
  if (!requestId) return fail("Missing request.");
  if (!oneOf(status, CONSULT_STATUSES)) return fail("Invalid status.");

  await prisma.consultationRequest.update({ where: { id: requestId }, data: { status } });
  await audit(auth.user.id, "consult.status", "ConsultationRequest", requestId, { status });
  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/consultations/${requestId}`);
  return { ok: true };
}

export async function assignConsult(requestId: string, assignedToId: string): Promise<Result> {
  const auth = await authorize(PV.CONSULT_HANDLE);
  if ("error" in auth) return fail(auth.error);
  if (!requestId) return fail("Missing request.");
  const assignee = assignedToId || null;

  if (assignee) {
    const staff = await prisma.user.findUnique({ where: { id: assignee }, select: { id: true } });
    if (!staff) return fail("Unknown assignee.");
  }

  await prisma.consultationRequest.update({
    where: { id: requestId },
    data: { assignedToId: assignee },
  });
  await audit(auth.user.id, "consult.assign", "ConsultationRequest", requestId, {
    assignedToId: assignee,
  });
  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/consultations/${requestId}`);
  return { ok: true };
}

const replySchema = z.string().trim().min(1, "Write a reply first").max(4000);

export async function replyConsult(requestId: string, body: string): Promise<Result> {
  const auth = await authorize(PV.CONSULT_HANDLE);
  if ("error" in auth) return fail(auth.error);
  if (!requestId) return fail("Missing request.");
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const request = await prisma.consultationRequest.findUnique({
    where: { id: requestId },
    select: { id: true },
  });
  if (!request) return fail("Request not found.");

  await prisma.consultationMessage.create({
    data: {
      requestId,
      authorId: auth.user.id,
      fromStaff: true,
      body: parsed.data,
    },
  });
  // Touch the request so the "updated" timestamp reflects the latest reply.
  await prisma.consultationRequest.update({
    where: { id: requestId },
    data: { updatedAt: new Date() },
  });
  await audit(auth.user.id, "consult.reply", "ConsultationRequest", requestId);
  revalidatePath(`/admin/consultations/${requestId}`);
  revalidatePath("/admin/consultations");
  return { ok: true };
}

// ── Community content ──────────────────────────────────────────────────────

const stingSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  summary: z.string().trim().min(10, "Add a short summary").max(600),
  status: z.enum(STING_STATUSES),
  body: z.string().trim().max(4000).optional(),
});

export async function createStingOp(formData: FormData): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);

  const parsed = stingSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    status: String(formData.get("status") ?? "active"),
    body: String(formData.get("body") ?? "").trim() || undefined,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const slug = await uniqueSlug(parsed.data.title, async (s) =>
    Boolean(await prisma.stingOperation.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  const created = await prisma.stingOperation.create({
    data: {
      slug,
      title: parsed.data.title,
      summary: parsed.data.summary,
      status: parsed.data.status,
      body: parsed.data.body,
    },
  });
  await audit(auth.user.id, "sting.create", "StingOperation", created.id, { slug });
  revalidatePath("/admin/community");
  revalidatePath("/sting-operations");
  return { ok: true };
}

const gatheringSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  description: z.string().trim().min(10, "Add a description").max(800),
  location: z.string().trim().min(2, "Add a location").max(120),
  startsAt: z.coerce.date({ message: "Enter a valid date" }),
  isVirtual: z.boolean().default(false),
});

export async function createGathering(formData: FormData): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);

  const parsed = gatheringSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    location: String(formData.get("location") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    isVirtual: formData.get("isVirtual") === "on" || formData.get("isVirtual") === "true",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const slug = await uniqueSlug(parsed.data.title, async (s) =>
    Boolean(await prisma.gathering.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  const created = await prisma.gathering.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startsAt: parsed.data.startsAt,
      isVirtual: parsed.data.isVirtual,
    },
  });
  await audit(auth.user.id, "gathering.create", "Gathering", created.id, { slug });
  revalidatePath("/admin/community");
  revalidatePath("/gatherings");
  return { ok: true };
}

const scamArtSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  artist: z.string().trim().min(1, "Artist is required").max(80),
  imageLabel: z.string().trim().min(2, "Image label is required").max(120),
  description: z.string().trim().max(600).optional(),
});

export async function createScamArt(formData: FormData): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);

  const parsed = scamArtSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    artist: String(formData.get("artist") ?? ""),
    imageLabel: String(formData.get("imageLabel") ?? ""),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const slug = await uniqueSlug(parsed.data.title, async (s) =>
    Boolean(await prisma.scamArt.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  const created = await prisma.scamArt.create({
    data: {
      slug,
      title: parsed.data.title,
      artist: parsed.data.artist,
      imageLabel: parsed.data.imageLabel,
      description: parsed.data.description,
    },
  });
  await audit(auth.user.id, "scamart.create", "ScamArt", created.id, { slug });
  revalidatePath("/admin/community");
  revalidatePath("/scam-art");
  return { ok: true };
}

const mediaSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160),
  kind: z.enum(MEDIA_KINDS),
  duration: z.string().trim().max(20).optional(),
  description: z.string().trim().min(10, "Add a description").max(800),
});

export async function createMediaItem(formData: FormData): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);

  const parsed = mediaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    kind: String(formData.get("kind") ?? "podcast"),
    duration: String(formData.get("duration") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const slug = await uniqueSlug(parsed.data.title, async (s) =>
    Boolean(await prisma.mediaItem.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  const created = await prisma.mediaItem.create({
    data: {
      slug,
      title: parsed.data.title,
      kind: parsed.data.kind,
      duration: parsed.data.duration,
      description: parsed.data.description,
    },
  });
  await audit(auth.user.id, "media.create", "MediaItem", created.id, { slug });
  revalidatePath("/admin/community");
  revalidatePath("/media");
  return { ok: true };
}

// ── Community deletes ──────────────────────────────────────────────────────

export async function deleteStingOp(id: string): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!id) return fail("Missing item.");
  await prisma.stingOperation.delete({ where: { id } });
  await audit(auth.user.id, "sting.delete", "StingOperation", id);
  revalidatePath("/admin/community");
  revalidatePath("/sting-operations");
  return { ok: true };
}

export async function deleteGathering(id: string): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!id) return fail("Missing item.");
  await prisma.gathering.delete({ where: { id } });
  await audit(auth.user.id, "gathering.delete", "Gathering", id);
  revalidatePath("/admin/community");
  revalidatePath("/gatherings");
  return { ok: true };
}

export async function deleteScamArt(id: string): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!id) return fail("Missing item.");
  await prisma.scamArt.delete({ where: { id } });
  await audit(auth.user.id, "scamart.delete", "ScamArt", id);
  revalidatePath("/admin/community");
  revalidatePath("/scam-art");
  return { ok: true };
}

export async function deleteMediaItem(id: string): Promise<Result> {
  const auth = await authorize(PV.COMMUNITY_MANAGE);
  if ("error" in auth) return fail(auth.error);
  if (!id) return fail("Missing item.");
  await prisma.mediaItem.delete({ where: { id } });
  await audit(auth.user.id, "media.delete", "MediaItem", id);
  revalidatePath("/admin/community");
  revalidatePath("/media");
  return { ok: true };
}
