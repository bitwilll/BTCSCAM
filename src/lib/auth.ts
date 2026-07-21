import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { effectivePrivileges, type SessionUser } from "./rbac";
import type { Role, Privilege } from "./constants";

const COOKIE = "btcscam_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
);

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

async function readToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const token = await signSession(userId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Load the current user fresh from the DB (so role/privilege/ban changes apply immediately). */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const userId = await readToken(token);
  if (!userId) return null;

  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u || !u.isActive) return null;

  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    role: u.role as Role,
    title: u.title,
    avatarLabel: u.avatarLabel,
    reputation: u.reputation,
    isActive: u.isActive,
    isBanned: u.isBanned,
    privileges: effectivePrivileges(u.role, u.extraPrivileges, u.revokedPrivileges),
  };
});

export type { SessionUser, Privilege };
