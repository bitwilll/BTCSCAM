import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Kicker, SectionHeader } from "@/components/ui";
import { num } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel · BTCSCAM.COM",
  description: "Administrative control centre for BTCSCAM.COM.",
};

export default async function AdminHubPage() {
  const user = await requirePrivilege(PV.ADMIN_ACCESS);

  const [users, bannedUsers, reports, orders, consults, donations, articles, scams, auditCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.scamReport.count({ where: { status: { in: ["pending", "triaging"] } } }),
      prisma.order.count({ where: { status: { in: ["pending_payment", "processing"] } } }),
      prisma.consultationRequest.count({ where: { status: { in: ["new", "scheduled", "in_progress"] } } }),
      prisma.donation.count({ where: { status: "pledged" } }),
      prisma.article.count(),
      prisma.scamEntry.count(),
      prisma.auditLog.count(),
    ]);

  type Section = {
    show: boolean;
    group: string;
    label: string;
    desc: string;
    href: string;
    metric: string;
    metricSub: string;
  };

  const sections: Section[] = [
    {
      show: can(user, PV.USER_MANAGE),
      group: "Access Control",
      label: "Users & Roles",
      desc: "Assign roles, grant or revoke privileges, ban accounts.",
      href: "/admin/users",
      metric: num(users),
      metricSub: `${num(bannedUsers)} banned`,
    },
    {
      show: can(user, PV.AUDIT_VIEW),
      group: "Access Control",
      label: "Audit Log",
      desc: "Immutable trail of every privileged staff action.",
      href: "/admin/audit",
      metric: num(auditCount),
      metricSub: "entries",
    },
    {
      show: can(user, PV.SETTINGS_MANAGE),
      group: "Access Control",
      label: "Site Settings",
      desc: "Threatcon, watchmen counter, today's number & wallet addresses.",
      href: "/admin/settings",
      metric: "—",
      metricSub: "configure",
    },
    {
      show: can(user, PV.ARTICLE_CREATE),
      group: "Editorial",
      label: "Articles",
      desc: "Manage the full article catalogue and publishing queue.",
      href: "/admin/articles",
      metric: num(articles),
      metricSub: "total",
    },
    {
      show: can(user, PV.REPORT_TRIAGE),
      group: "Editorial",
      label: "Scam Reports",
      desc: "Triage, verify and publish inbound scam reports.",
      href: "/admin/reports",
      metric: num(reports),
      metricSub: "awaiting triage",
    },
    {
      show: can(user, PV.SCAM_EDIT),
      group: "Editorial",
      label: "Scam Database",
      desc: "Maintain the tracked-scam intelligence base.",
      href: "/admin/scams",
      metric: num(scams),
      metricSub: "tracked",
    },
    {
      show: can(user, PV.ORDER_MANAGE),
      group: "Operations",
      label: "Orders",
      desc: "Fulfil crypto store orders and update tracking.",
      href: "/admin/orders",
      metric: num(orders),
      metricSub: "to fulfil",
    },
    {
      show: can(user, PV.STORE_MANAGE),
      group: "Operations",
      label: "Store & Products",
      desc: "Manage the merch catalogue and stock.",
      href: "/admin/store",
      metric: "—",
      metricSub: "catalogue",
    },
    {
      show: can(user, PV.DONATION_MANAGE),
      group: "Operations",
      label: "Donations",
      desc: "Confirm pledged crypto donations.",
      href: "/admin/donations",
      metric: num(donations),
      metricSub: "pledged",
    },
    {
      show: can(user, PV.CONSULT_HANDLE),
      group: "Operations",
      label: "Consultations",
      desc: "Respond to and schedule victim support cases.",
      href: "/admin/consultations",
      metric: num(consults),
      metricSub: "open",
    },
    {
      show: can(user, PV.COMMUNITY_MANAGE),
      group: "Operations",
      label: "Community",
      desc: "Events, sting operations, scam art & media.",
      href: "/admin/community",
      metric: "—",
      metricSub: "manage",
    },
  ];

  const visible = sections.filter((s) => s.show);
  const groups = [...new Set(visible.map((s) => s.group))];

  return (
    <div>
      <div className="border-b-2 border-ink pb-5 mb-8">
        <Kicker color="red">Administration</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">Admin Panel</h1>
        <p className="mt-3 text-ink-600 max-w-2xl">
          Full administrative control of BTCSCAM.COM. Every action taken here is written to the audit log.
        </p>
      </div>

      {groups.map((g) => (
        <div key={g} className="mb-10">
          <SectionHeader title={g} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
            {visible
              .filter((s) => s.group === g)
              .map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group bg-paper-2 p-5 hover:bg-paper transition-colors flex flex-col justify-between gap-6"
                >
                  <div>
                    <span className="kicker text-ink group-hover:text-btc-dark">{s.label} →</span>
                    <p className="mono text-[11px] text-ink-500 mt-2 leading-snug">{s.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl text-ink">{s.metric}</span>
                    <span className="mono text-[10px] uppercase tracking-wide text-ink-500">{s.metricSub}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
