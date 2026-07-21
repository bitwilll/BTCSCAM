import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { ROLES, ROLE_LABELS, PRIVILEGES as PV, type Role } from "@/lib/constants";
import { Avatar, Kicker, Tag } from "@/components/ui";
import { num } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users & Roles · BTCSCAM.COM",
  description: "Manage accounts, roles and privileges.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requirePrivilege(PV.USER_MANAGE);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const roleFilter = ROLES.includes(sp.role as Role) ? (sp.role as Role) : "";

  const where: Prisma.UserWhereInput = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: [{ role: "asc" }, { createdAt: "asc" }], take: 200 }),
    prisma.user.count(),
  ]);

  const qs = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: q || undefined, role: roleFilter || undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  return (
    <div>
      <div className="border-b-2 border-ink pb-5 mb-6">
        <Kicker color="orange">Access Control</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">Users &amp; Roles</h1>
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
          {num(total)} registered accounts · showing {num(users.length)}
        </p>
      </div>

      {/* Search + role filter */}
      <form method="get" className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search email, username or name…"
          aria-label="Search users"
          className="flex-1 px-3 py-2.5 text-sm border border-line bg-paper text-ink focus:outline-none focus:border-ink"
        />
        <select
          name="role"
          defaultValue={roleFilter}
          aria-label="Filter by role"
          className="px-3 py-2.5 text-sm border border-line bg-paper text-ink focus:outline-none focus:border-ink"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <button type="submit" className="kicker bg-ink text-paper px-5 py-2.5 hover:bg-btc hover:text-black">
          Filter
        </button>
        {(q || roleFilter) && (
          <Link href="/admin/users" className="kicker inline-flex items-center px-4 text-ink-500 hover:text-ink">
            Clear
          </Link>
        )}
      </form>

      {/* Role quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={qs({ role: undefined })}
          className={`kicker px-3 py-1.5 border ${!roleFilter ? "bg-ink text-paper border-ink" : "border-line text-ink-600 hover:border-ink"}`}
        >
          All
        </Link>
        {ROLES.map((r) => (
          <Link
            key={r}
            href={qs({ role: r })}
            className={`kicker px-3 py-1.5 border ${roleFilter === r ? "bg-ink text-paper border-ink" : "border-line text-ink-600 hover:border-ink"}`}
          >
            {ROLE_LABELS[r]}
          </Link>
        ))}
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="border border-dashed border-line-strong bg-paper-2 p-10 text-center">
          <p className="font-display text-2xl text-ink-700">No users match</p>
          <p className="mono text-sm text-ink-500 mt-2">Try a different search or clear the filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="bg-paper-2 border-b border-line-strong">
                <th className="eyebrow px-4 py-3">User</th>
                <th className="eyebrow px-4 py-3">Email</th>
                <th className="eyebrow px-4 py-3">Role</th>
                <th className="eyebrow px-4 py-3">Status</th>
                <th className="eyebrow px-4 py-3 text-right">Reputation</th>
                <th className="eyebrow px-4 py-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.displayName} size={32} />
                      <div className="min-w-0">
                        <div className="font-semibold text-ink truncate">{u.displayName}</div>
                        <div className="mono text-[11px] text-ink-500">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 mono text-[12px] text-ink-600 break-all">{u.email}</td>
                  <td className="px-4 py-3">
                    <Kicker color={u.role === "admin" ? "red" : u.role === "member" ? "muted" : "orange"}>
                      {ROLE_LABELS[u.role as Role] ?? u.role}
                    </Kicker>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <Tag tone="red">Banned</Tag>
                    ) : !u.isActive ? (
                      <Tag tone="outline">Inactive</Tag>
                    ) : (
                      <Tag tone="green">Active</Tag>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right mono text-[12px] text-ink-600">{num(u.reputation)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="kicker text-btc-dark hover:text-ink">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
