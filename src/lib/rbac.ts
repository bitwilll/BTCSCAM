import {
  ROLE_PRIVILEGES,
  type Role,
  type Privilege,
  ROLES,
} from "./constants";
import { toStrArray } from "./format";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: Role;
  title: string | null;
  avatarLabel: string | null;
  reputation: number;
  isActive: boolean;
  isBanned: boolean;
  privileges: Privilege[];
};

export function isRole(v: string): v is Role {
  return (ROLES as readonly string[]).includes(v);
}

/** Effective privileges = role defaults ∪ explicit grants − explicit revocations. */
export function effectivePrivileges(
  role: string,
  extra: unknown,
  revoked: unknown,
): Privilege[] {
  const base = ROLE_PRIVILEGES[(isRole(role) ? role : "member") as Role] ?? [];
  const grants = toStrArray(extra) as Privilege[];
  const revokes = new Set(toStrArray(revoked));
  const set = new Set<Privilege>([...base, ...grants]);
  for (const r of revokes) set.delete(r as Privilege);
  return [...set];
}

export function can(user: SessionUser | null, privilege: Privilege): boolean {
  if (!user || user.isBanned || !user.isActive) return false;
  return user.privileges.includes(privilege);
}

export function canAny(user: SessionUser | null, privileges: Privilege[]): boolean {
  return privileges.some((p) => can(user, p));
}

/** Rank used for "can this actor manage that target" comparisons. */
export function roleRank(role: string): number {
  const idx = (ROLES as readonly string[]).indexOf(role);
  return idx < 0 ? 0 : idx;
}
