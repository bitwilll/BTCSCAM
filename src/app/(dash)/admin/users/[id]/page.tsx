import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { can, effectivePrivileges, roleRank } from "@/lib/rbac";
import { ROLES, ROLE_LABELS, PRIVILEGES as PV, ALL_PRIVILEGES, type Role } from "@/lib/constants";
import { Avatar, Kicker, SectionHeader, Tag } from "@/components/ui";
import { byline, num, toStrArray } from "@/lib/format";
import { RoleForm } from "./_components/RoleForm";
import { PrivilegeGrid } from "./_components/PrivilegeGrid";
import { UserModActions } from "./_components/UserModActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage User · BTCSCAM.COM",
  description: "Assign roles, grant privileges and moderate an account.",
};

export default async function ManageUserPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requirePrivilege(PV.USER_MANAGE);
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound();

  const isSelf = target.id === actor.id;
  const outranksActor = actor.role !== "admin" && roleRank(target.role) >= roleRank(actor.role);
  const manageable = !isSelf && !outranksActor;

  const assignableRoles: Role[] =
    actor.role === "admin" ? [...ROLES] : ROLES.filter((r) => roleRank(r) <= roleRank(actor.role));

  const canAssignRole = can(actor, PV.USER_ASSIGN_ROLE) && manageable;
  const canGrantPriv = can(actor, PV.USER_GRANT_PRIVILEGE) && manageable;
  const canBan = can(actor, PV.USER_BAN) && manageable;
  const canActive = can(actor, PV.USER_MANAGE) && manageable;

  const extra = toStrArray(target.extraPrivileges);
  const revoked = toStrArray(target.revokedPrivileges);
  const effective = effectivePrivileges(target.role, target.extraPrivileges, target.revokedPrivileges);

  const roleDisabledReason = isSelf
    ? "You cannot change your own role."
    : outranksActor
      ? "This user is ranked at or above you — only an administrator can manage them."
      : undefined;

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/admin/users" className="kicker text-ink-500 hover:text-ink">
        ← Users &amp; Roles
      </Link>

      {/* Profile header */}
      <div className="border-b-2 border-ink pb-6 mt-3 mb-8">
        <div className="flex items-start gap-4">
          <Avatar name={target.displayName} size={56} />
          <div className="min-w-0">
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9]">{target.displayName}</h1>
            <div className="mono text-[12px] text-ink-500 mt-2">@{target.username} · {target.email}</div>
            {target.title && <div className="mono text-[11px] uppercase tracking-wide text-btc-dark mt-1">{target.title}</div>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Kicker color={target.role === "admin" ? "red" : "orange"}>{ROLE_LABELS[target.role as Role] ?? target.role}</Kicker>
          <span className="text-ink-400">·</span>
          {target.isBanned ? <Tag tone="red">Banned</Tag> : !target.isActive ? <Tag tone="outline">Inactive</Tag> : <Tag tone="green">Active</Tag>}
          {isSelf && <Tag tone="paper">You</Tag>}
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid sm:grid-cols-3 gap-px bg-line border border-line mb-10">
        {[
          { label: "Reputation", value: num(target.reputation) },
          { label: "Effective Privileges", value: `${effective.length} / ${ALL_PRIVILEGES.length}` },
          { label: "Member Since", value: byline(target.createdAt) },
        ].map((m) => (
          <div key={m.label} className="bg-paper-2 p-4">
            <div className="eyebrow mb-1">{m.label}</div>
            <div className="font-display text-2xl text-ink">{m.value}</div>
          </div>
        ))}
      </div>

      {target.bio && (
        <div className="mb-10">
          <SectionHeader title="Bio" />
          <p className="text-ink-700 max-w-2xl">{target.bio}</p>
        </div>
      )}

      {/* Role assignment */}
      <div className="mb-10">
        <SectionHeader title="Role Assignment" />
        <div className="max-w-xl">
          <RoleForm
            targetId={target.id}
            currentRole={target.role as Role}
            assignableRoles={assignableRoles}
            disabled={!canAssignRole}
            disabledReason={
              !can(actor, PV.USER_ASSIGN_ROLE)
                ? "You do not have permission to assign roles."
                : roleDisabledReason
            }
          />
        </div>
      </div>

      {/* Effective privileges + overrides */}
      <div className="mb-10">
        <SectionHeader title="Privileges" />
        <p className="mono text-[11px] text-ink-500 mb-4 max-w-2xl">
          Effective set = role defaults ∪ explicit grants − explicit revocations. Overrides here apply on top of
          the {ROLE_LABELS[target.role as Role] ?? target.role} role.
        </p>
        <PrivilegeGrid
          targetId={target.id}
          role={target.role as Role}
          extraPrivileges={extra}
          revokedPrivileges={revoked}
          canGrant={canGrantPriv}
        />
      </div>

      {/* Moderation */}
      <div className="mb-6">
        <SectionHeader title="Moderation" />
        <div className="max-w-xl">
          {isSelf ? (
            <p className="mono text-[11px] text-alert-strong">You cannot moderate your own account.</p>
          ) : (
            <UserModActions
              targetId={target.id}
              isBanned={target.isBanned}
              isActive={target.isActive}
              canBan={canBan}
              canManage={canActive}
            />
          )}
        </div>
      </div>
    </div>
  );
}
