"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SCAM_TYPES } from "@/lib/constants";

export type ReportState = { error?: string } | null;

// Split a comma / newline separated textarea into a clean string array.
function splitList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const reportSchema = z.object({
  scamName: z.string().trim().min(2, "Enter the scam name or project.").max(160),
  category: z.enum(SCAM_TYPES),
  chain: z.string().trim().max(60).optional(),
  url: z.string().trim().max(500).optional(),
  description: z
    .string()
    .trim()
    .min(20, "Add a bit more detail — at least 20 characters helps our triage team.")
    .max(8000),
});

export async function submitReport(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const user = await getSession();

  const parsed = reportSchema.safeParse({
    scamName: String(formData.get("scamName") ?? ""),
    category: String(formData.get("category") ?? "other").trim(),
    chain: String(formData.get("chain") ?? "").trim() || undefined,
    url: String(formData.get("url") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Email: taken from the session when signed in, otherwise required from the form.
  let reporterEmail: string | null = user?.email ?? null;
  if (!user) {
    const email = String(formData.get("reporterEmail") ?? "")
      .trim()
      .toLowerCase();
    const emailCheck = z.string().email().safeParse(email);
    if (!emailCheck.success)
      return { error: "Enter a valid email so our team can follow up on your report." };
    reporterEmail = emailCheck.data;
  }

  // Amount lost (USD): optional. Stored as a whole-dollar BigInt.
  let amountLostUsd: bigint | null = null;
  const rawAmount = String(formData.get("amountLostUsd") ?? "").replace(/[$,\s]/g, "");
  if (rawAmount) {
    const n = Number(rawAmount);
    if (!Number.isFinite(n) || n < 0)
      return { error: "Enter the amount lost as a number in US dollars." };
    if (n > 0) amountLostUsd = BigInt(Math.round(n));
  }

  const walletAddresses = splitList(String(formData.get("walletAddresses") ?? ""));
  const evidenceUrls = splitList(String(formData.get("evidenceUrls") ?? ""));

  await prisma.scamReport.create({
    data: {
      scamName: parsed.data.scamName,
      category: parsed.data.category,
      chain: parsed.data.chain ?? null,
      amountLostUsd,
      walletAddresses,
      url: parsed.data.url ?? null,
      description: parsed.data.description,
      evidenceUrls,
      status: "pending",
      reporterEmail,
      submittedById: user?.id ?? null,
    },
  });

  revalidatePath("/report");
  // redirect() throws to unwind — must stay outside any try/catch.
  redirect("/report/success");
}
