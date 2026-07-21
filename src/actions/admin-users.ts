"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { isRole, roleRank, type SessionUser } from "@/lib/rbac";
import { ALL_PRIVILEGES, CRYPTO_METHODS, PRIVILEGES } from "@/lib/constants";
import { shortAddr, toStrArray } from "@/lib/format";

export type ActionResult = { ok: boolean; error?: string; message?: string };

// ─── Guard helpers ──────────────────────────────────────────────────────────

/**
 * A non-admin may only act on a target whose role rank is strictly LOWER than
 * their own. Admins may act on anyone. This blocks lateral / upward tampering.
 */
function canActOnRole(actor: SessionUser, targetRole: string): boolean {
  if (actor.role === "admin") return true;
  return roleRank(targetRole) < roleRank(actor.role);
}

function uniq(list: string[]): string[] {
  return Array.from(new Set(list));
}

async function writeAudit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown>,
): Promise<void> {
  await prisma.auditLog.create({
    data: { actorId, action, targetType, targetId, meta: meta as object },
  });
}

/**
 * Shared preflight for every user-mutating action: loads the target, blocks
 * self-mutation (to prevent lockout), and enforces the role-rank guard.
 */
async function loadManageableTarget(actor: SessionUser, targetId: string) {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return { error: "User not found." as const };
  if (target.id === actor.id)
    return { error: "You cannot modify your own account here." as const };
  if (!canActOnRole(actor, target.role))
    return { error: "You cannot modify a user of higher or equal rank." as const };
  return { target };
}

const idPriv = z.object({
  targetId: z.string().min(1, "Missing user."),
  privilege: z.string().refine((p) => (ALL_PRIVILEGES as string[]).includes(p), "Unknown privilege."),
});

// ─── Roles ──────────────────────────────────────────────────────────────────

export async function setUserRole(targetId: string, newRole: string): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_ASSIGN_ROLE);

  const parsed = z
    .object({
      targetId: z.string().min(1, "Missing user."),
      newRole: z.string().refine(isRole, "Invalid role."),
    })
    .safeParse({ targetId, newRole });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };
  const { target } = found;

  // Non-admins cannot assign a role ranked higher than their own.
  if (actor.role !== "admin" && roleRank(newRole) > roleRank(actor.role))
    return { ok: false, error: "You cannot assign a role higher than your own." };

  if (target.role === newRole) return { ok: true, message: "No change — role already set." };

  await prisma.user.update({ where: { id: targetId }, data: { role: newRole } });
  await writeAudit(actor.id, "user.role_change", "user", targetId, {
    from: target.role,
    to: newRole,
    targetName: target.displayName,
  });

  revalidatePath(`/admin/users/${targetId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: `Role set to ${newRole}.` };
}

// ─── Privileges (Json arrays: extraPrivileges / revokedPrivileges) ───────────

export async function grantPrivilege(targetId: string, privilege: string): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_GRANT_PRIVILEGE);
  const parsed = idPriv.safeParse({ targetId, privilege });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };
  const { target } = found;

  const extra = uniq([...toStrArray(target.extraPrivileges), privilege]);
  const revoked = toStrArray(target.revokedPrivileges).filter((p) => p !== privilege);

  await prisma.user.update({
    where: { id: targetId },
    data: { extraPrivileges: extra, revokedPrivileges: revoked },
  });
  await writeAudit(actor.id, "user.privilege_grant", "user", targetId, { privilege });

  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true, message: "Privilege granted." };
}

export async function revokePrivilege(targetId: string, privilege: string): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_GRANT_PRIVILEGE);
  const parsed = idPriv.safeParse({ targetId, privilege });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };
  const { target } = found;

  const revoked = uniq([...toStrArray(target.revokedPrivileges), privilege]);
  const extra = toStrArray(target.extraPrivileges).filter((p) => p !== privilege);

  await prisma.user.update({
    where: { id: targetId },
    data: { extraPrivileges: extra, revokedPrivileges: revoked },
  });
  await writeAudit(actor.id, "user.privilege_revoke", "user", targetId, { privilege });

  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true, message: "Privilege revoked." };
}

export async function resetPrivilege(targetId: string, privilege: string): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_GRANT_PRIVILEGE);
  const parsed = idPriv.safeParse({ targetId, privilege });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };
  const { target } = found;

  const extra = toStrArray(target.extraPrivileges).filter((p) => p !== privilege);
  const revoked = toStrArray(target.revokedPrivileges).filter((p) => p !== privilege);

  await prisma.user.update({
    where: { id: targetId },
    data: { extraPrivileges: extra, revokedPrivileges: revoked },
  });
  await writeAudit(actor.id, "user.privilege_reset", "user", targetId, { privilege });

  revalidatePath(`/admin/users/${targetId}`);
  return { ok: true, message: "Privilege reset to role default." };
}

// ─── Ban / activation ────────────────────────────────────────────────────────

export async function setUserBan(targetId: string, banned: boolean): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_BAN);
  const parsed = z
    .object({ targetId: z.string().min(1), banned: z.boolean() })
    .safeParse({ targetId, banned });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };

  await prisma.user.update({ where: { id: targetId }, data: { isBanned: banned } });
  await writeAudit(actor.id, banned ? "user.ban" : "user.unban", "user", targetId, {});

  revalidatePath(`/admin/users/${targetId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: banned ? "User banned." : "User reinstated." };
}

export async function setUserActive(targetId: string, active: boolean): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.USER_MANAGE);
  const parsed = z
    .object({ targetId: z.string().min(1), active: z.boolean() })
    .safeParse({ targetId, active });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const found = await loadManageableTarget(actor, targetId);
  if ("error" in found) return { ok: false, error: found.error };

  await prisma.user.update({ where: { id: targetId }, data: { isActive: active } });
  await writeAudit(actor.id, active ? "user.activate" : "user.deactivate", "user", targetId, {});

  revalidatePath(`/admin/users/${targetId}`);
  revalidatePath("/admin/users");
  return { ok: true, message: active ? "Account activated." : "Account deactivated." };
}

// ─── Site settings ────────────────────────────────────────────────────────────

const SETTING_KEYS = ["threatcon", "watchmen", "todays_number"] as const;

export async function updateSetting(key: string, value: string): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE);
  const parsed = z
    .object({
      key: z.enum(SETTING_KEYS),
      value: z.string().trim().min(1, "Value cannot be empty.").max(120, "Value is too long."),
    })
    .safeParse({ key, value });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await prisma.siteSetting.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key, value: parsed.data.value },
  });
  await writeAudit(actor.id, "setting.update", "setting", parsed.data.key, {
    value: parsed.data.value,
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Setting saved." };
}

// ─── Crypto wallet addresses ──────────────────────────────────────────────────

const WALLET_METHODS = CRYPTO_METHODS.map((m) => m.method);

export async function updateWallet(
  method: string,
  address: string,
  memo: string,
): Promise<ActionResult> {
  const actor = await requirePrivilege(PRIVILEGES.SETTINGS_MANAGE);
  const parsed = z
    .object({
      method: z.string().refine((m) => (WALLET_METHODS as string[]).includes(m), "Unknown method."),
      address: z.string().trim().min(4, "Enter a valid address.").max(200, "Address is too long."),
      memo: z.string().trim().max(120, "Memo is too long.").optional(),
    })
    .safeParse({ method, address, memo });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const wallet = await prisma.cryptoWallet.findUnique({ where: { method: parsed.data.method } });
  if (!wallet) return { ok: false, error: "Wallet not configured." };

  await prisma.cryptoWallet.update({
    where: { method: parsed.data.method },
    data: { address: parsed.data.address, memo: parsed.data.memo || null },
  });
  await writeAudit(actor.id, "wallet.update", "wallet", parsed.data.method, {
    address: shortAddr(parsed.data.address),
    memo: parsed.data.memo || null,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/donate");
  revalidatePath("/store");
  return { ok: true, message: `${parsed.data.method} address updated.` };
}
