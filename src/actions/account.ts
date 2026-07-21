"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canAny } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";

export type ProfileState = { ok?: boolean; message?: string; error?: string } | null;

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(48, "Display name must be 48 characters or fewer"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
  // Title is staff-assigned; validated here but only written for staff (see below).
  title: z.string().trim().max(80, "Title must be 80 characters or fewer").optional(),
});

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/desk/profile");

  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    title: String(formData.get("title") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { displayName, bio, title } = parsed.data;
  const isStaff = canAny(user, [PRIVILEGES.STAFF_ACCESS, PRIVILEGES.ADMIN_ACCESS]);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName,
      bio: bio.length > 0 ? bio : null,
      // Only staff may change their own byline title; members submit it read-only.
      ...(isStaff ? { title: title && title.length > 0 ? title : null } : {}),
    },
  });

  revalidatePath("/desk");
  revalidatePath("/desk/profile");
  return { ok: true, message: "Profile updated." };
}
