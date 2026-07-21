import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Avatar, Kicker, SectionHeader, StatBlock } from "@/components/ui";
import { num, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff Overview · BTCSCAM.COM",
  description: "Newsroom and operations dashboard for BTCSCAM.COM staff.",
};

export default async function StaffOverviewPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/staff");

  const [
    pendingReports,
    openConsults,
    openOrders,
    totalUsers,
    publishedArticles,
    draftArticles,
    pledgedDonations,
    recentAudit,
  ] = await Promise.all([
    prisma.scamReport.count({ where: { status: { in: ["pending", "triaging"] } } }),
    prisma.consultationRequest.count({ where: { status: { in: ["new", "scheduled", "in_progress"] } } }),
    prisma.order.count({ where: { status: { in: ["pending_payment", "processing"] } } }),
    prisma.user.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.donation.count({ where: { status: "pledged" } }),
    can(user, PV.AUDIT_VIEW)
      ? prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { actor: true } })
      : Promise.resolve([]),
  ]);

  type Stat = { show: boolean; label: string; value: string; sub: string; tone?: "ink" | "red" | "orange"; href: string };
  const stats: Stat[] = [
    { show: can(user, PV.REPORT_TRIAGE), label: "Pending Reports", value: num(pendingReports), sub: "awaiting triage", tone: pendingReports ? "red" : "ink", href: "/admin/reports" },
    { show: can(user, PV.CONSULT_HANDLE), label: "Open Consultations", value: num(openConsults), sub: "victims awaiting response", tone: openConsults ? "orange" : "ink", href: "/admin/consultations" },
    { show: can(user, PV.ORDER_MANAGE), label: "Orders To Fulfil", value: num(openOrders), sub: "pending payment / processing", href: "/admin/orders" },
    { show: can(user, PV.USER_MANAGE), label: "Total Users", value: num(totalUsers), sub: "registered accounts", href: "/admin/users" },
    { show: can(user, PV.ARTICLE_CREATE), label: "Articles", value: `${num(publishedArticles)}`, sub: `${num(draftArticles)} in draft`, href: "/admin/articles" },
    { show: can(user, PV.DONATION_MANAGE), label: "Donations Pledged", value: num(pledgedDonations), sub: "awaiting confirmation", tone: "orange", href: "/admin/donations" },
  ];
  const visibleStats = stats.filter((s) => s.show);

  type QL = { show: boolean; label: string; desc: string; href: string };
  const links: QL[] = [
    { show: can(user, PV.STAFF_ACCESS), label: "Editor Desk", desc: "Draft, review and publish articles", href: "/editor" },
    { show: can(user, PV.REPORT_TRIAGE), label: "Scam Reports", desc: "Triage and verify inbound reports", href: "/admin/reports" },
    { show: can(user, PV.SCAM_EDIT), label: "Scam Database", desc: "Maintain tracked scam entries", href: "/admin/scams" },
    { show: can(user, PV.CONSULT_HANDLE), label: "Consultations", desc: "Respond to victim support requests", href: "/admin/consultations" },
    { show: can(user, PV.ORDER_MANAGE), label: "Orders", desc: "Fulfil and track store orders", href: "/admin/orders" },
    { show: can(user, PV.STORE_MANAGE), label: "Store & Products", desc: "Manage the merch catalogue", href: "/admin/store" },
    { show: can(user, PV.DONATION_MANAGE), label: "Donations", desc: "Confirm crypto donations", href: "/admin/donations" },
    { show: can(user, PV.COMMUNITY_MANAGE), label: "Community", desc: "Events, sting ops, art & media", href: "/admin/community" },
    { show: can(user, PV.USER_MANAGE), label: "Users & Roles", desc: "Manage accounts, roles & privileges", href: "/admin/users" },
    { show: can(user, PV.AUDIT_VIEW), label: "Audit Log", desc: "Review privileged staff actions", href: "/admin/audit" },
    { show: can(user, PV.SETTINGS_MANAGE), label: "Site Settings", desc: "Threatcon, wallets & counters", href: "/admin/settings" },
    { show: can(user, PV.ADMIN_ACCESS), label: "Admin Panel", desc: "Full administrative control", href: "/admin" },
  ];
  const visibleLinks = links.filter((l) => l.show);

  return (
    <div>
      {/* Heading */}
      <div className="border-b-2 border-ink pb-5 mb-8">
        <Kicker color="orange">Staff Console</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">
          Good hunting, {user.displayName.split(/\s+/)[0]}.
        </h1>
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
          Signed in as {user.displayName} · {user.role} · {user.privileges.length} privileges
        </p>
      </div>

      {/* Stat cards */}
      {visibleStats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {visibleStats.map((s) => (
            <Link key={s.label} href={s.href} className="block hover:opacity-90 transition-opacity">
              <StatBlock label={s.label} value={s.value} sub={s.sub} tone={s.tone} />
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <SectionHeader title="Jump To" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mb-10">
        {visibleLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group bg-paper-2 p-5 hover:bg-paper transition-colors flex flex-col"
          >
            <span className="kicker text-ink group-hover:text-btc-dark">{l.label} →</span>
            <span className="mono text-[11px] text-ink-500 mt-2 leading-snug">{l.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent audit */}
      {can(user, PV.AUDIT_VIEW) && (
        <div>
          <SectionHeader title="Recent Staff Activity" action={{ label: "Full Audit Log", href: "/admin/audit" }} />
          {recentAudit.length === 0 ? (
            <p className="mono text-sm text-ink-500 py-6">No recorded activity yet.</p>
          ) : (
            <ul className="border border-line divide-y divide-line">
              {recentAudit.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3 bg-paper-2">
                  <Avatar name={a.actor?.displayName ?? "System"} size={28} />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-ink">
                      <span className="font-semibold">{a.actor?.displayName ?? "System"}</span>{" "}
                      <span className="mono text-[11px] uppercase tracking-wide text-btc-dark">{a.action}</span>
                      {a.targetType && (
                        <span className="mono text-[11px] text-ink-500"> · {a.targetType}</span>
                      )}
                    </span>
                  </div>
                  <span className="mono text-[11px] text-ink-500 shrink-0">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
