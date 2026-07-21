"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { slugify } from "@/lib/format";

export type AuthState = { error?: string } | null;

const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  displayName: z.string().min(2, "Enter a display name").max(48),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    username: String(formData.get("username") ?? "").trim(),
    displayName: String(formData.get("displayName") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, username, displayName, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing)
    return { error: existing.email === email ? "That email is already registered." : "That username is taken." };

  const user = await prisma.user.create({
    data: {
      email,
      username: slugify(username).replace(/-/g, "_") || username,
      displayName,
      passwordHash: await hashPassword(password),
      role: "member",
    },
  });
  await createSession(user.id);
  redirect("/desk");
}

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const next = String(formData.get("next") ?? "").trim();
  const parsed = loginSchema.safeParse({
    identifier: String(formData.get("identifier") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    return { error: "Invalid credentials." };
  if (user.isBanned) return { error: "This account has been suspended." };
  if (!user.isActive) return { error: "This account is inactive." };

  await createSession(user.id);
  redirect(next && next.startsWith("/") ? next : "/desk");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
