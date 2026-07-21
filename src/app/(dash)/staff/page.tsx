import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Avatar, Kicker, SectionHeader } from "@/components/ui";
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

  type Stat = { show: boolean; label: string; value: string; sub: string; tone?: "ink" | "red" | "accent"; href: string };
  const stats: Stat[] = [
    { show: can(user, PV.REPORT_TRIAGE), label: "Pending reports", value: num(pendingReports), sub: "awaiting triage", tone: pendingReports ? "red" : "ink", href: "/admin/reports" },
    { show: can(user, PV.CONSULT_HANDLE), label: "Open consultations", value: num(openConsults), sub: "victims awaiting response", tone: openConsults ? "accent" : "ink", href: "/admin/consultations" },
    { show: can(user, PV.ORDER_MANAGE), label: "Orders to fulfil", value: num(openOrders), sub: "pending payment / processing", href: "/admin/orders" },
    { show: can(user, PV.USER_MANAGE), label: "Total users", value: num(totalUsers), sub: "registered accounts", href: "/admin/users" },
    { show: can(user, PV.ARTICLE_CREATE), label: "Articles", value: `${num(publishedArticles)}`, sub: `${num(draftArticles)} in draft`, href: "/admin/articles" },
    { show: can(user, PV.DONATION_MANAGE), label: "Donations pledged", value: num(pledgedDonations), sub: "awaiting confirmation", tone: "accent", href: "/admin/donations" },
  ];
  const visibleStats = stats.filter((s) => s.show);
  const toneClass = { ink: "text-ink", red: "text-danger", accent: "text-accent" };

  type QL = { show: boolean; label: string; href: string };
  const links: QL[] = [
    { show: can(user, PV.STAFF_ACCESS), label: "Editor desk", href: "/editor" },
    { show: can(user, PV.REPORT_TRIAGE), label: "Scam reports", href: "/admin/reports" },
    { show: can(user, PV.SCAM_EDIT), label: "Scam database", href: "/admin/scams" },
    { show: can(user, PV.CONSULT_HANDLE), label: "Consultations", href: "/admin/consultations" },
    { show: can(user, PV.ORDER_MANAGE), label: "Orders", href: "/admin/orders" },
    { show: can(user, PV.STORE_MANAGE), label: "Store & products", href: "/admin/store" },
    { show: can(user, PV.DONATION_MANAGE), label: "Donations", href: "/admin/donations" },
    { show: can(user, PV.COMMUNITY_MANAGE), label: "Community", href: "/admin/community" },
    { show: can(user, PV.USER_MANAGE), label: "Users & roles", href: "/admin/users" },
    { show: can(user, PV.AUDIT_VIEW), label: "Audit log", href: "/admin/audit" },
    { show: can(user, PV.SETTINGS_MANAGE), label: "Site settings", href: "/admin/settings" },
    { show: can(user, PV.ADMIN_ACCESS), label: "Admin panel", href: "/admin" },
  ];
  const visibleLinks = links.filter((l) => l.show);

  return (
    <div>
      {/* Heading */}
      <div className="border-b border-ink pb-5 mb-8">
        <Kicker color="accent">Staff console</Kicker>
        <h1 className="font-display text-ink mt-2" style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1 }}>
          Good hunting, {user.displayName.split(/\s+/)[0]}.
        </h1>
        <p className="eyebrow mt-3">
          Signed in as {user.displayName} · {user.role} · {user.privileges.length} privileges
        </p>
      </div>

      {/* Stat tiles */}
      {visibleStats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {visibleStats.map((s) => (
            <Link key={s.label} href={s.href} className="block bg-white shadow-card p-4 hover:no-underline hover:bg-surface-dim transition-colors">
              <div className="kicker text-meta">{s.label}</div>
              <div className={`mono font-black text-[32px] mt-1 ${toneClass[s.tone ?? "ink"]}`}>{s.value}</div>
              <div className="text-[14px] text-meta mt-0.5">{s.sub}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <SectionHeader title="Jump To" />
      <div className="flex flex-wrap gap-3 mb-10">
        {visibleLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 font-sans font-bold text-[14px] uppercase tracking-[.05em] bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper hover:no-underline"
          >
            {l.label} →
          </Link>
        ))}
      </div>

      {/* Recent audit */}
      {can(user, PV.AUDIT_VIEW) && (
        <div>
          <SectionHeader title="Recent Staff Activity" action={{ label: "Full Audit Log", href: "/admin/audit" }} />
          {recentAudit.length === 0 ? (
            <p className="text-[14px] text-meta py-6 uppercase tracking-[.05em]">No recorded activity yet.</p>
          ) : (
            <ul className="border border-ink bg-white">
              {recentAudit.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3 border-t border-rule first:border-t-0 hover:bg-surface-dim">
                  <Avatar name={a.actor?.displayName ?? "System"} size={28} />
                  <div className="min-w-0 flex-1">
                    <span className="text-[16px] text-ink">
                      <span className="font-bold">{a.actor?.displayName ?? "System"}</span>{" "}
                      <span className="text-[14px] font-bold uppercase tracking-[.05em] text-accent">{a.action}</span>
                      {a.targetType && (
                        <span className="text-[14px] uppercase tracking-[.05em] text-meta"> · {a.targetType}</span>
                      )}
                    </span>
                  </div>
                  <span className="text-[14px] text-meta shrink-0">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
