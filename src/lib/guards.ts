import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { can } from "./rbac";
import type { SessionUser } from "./rbac";
import type { Privilege } from "./constants";

/** Require a logged-in user; redirect to /login otherwise. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ""}`);
  return user;
}

/** Require a specific privilege; redirect to /login or /403 otherwise. */
export async function requirePrivilege(
  privilege: Privilege,
  returnTo?: string,
): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (!can(user, privilege)) redirect("/403");
  return user;
}

/** Require staff-area access (any of the given privileges, defaults to staff.access). */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser("/staff");
  const staff =
    can(user, "staff.access" as Privilege) || can(user, "admin.access" as Privilege);
  if (!staff) redirect("/403");
  return user;
}
