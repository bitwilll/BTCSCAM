import { requireStaff } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV } from "@/lib/constants";
import { DashShell, type DashNavItem } from "@/components/dash/DashShell";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  const all: (DashNavItem & { show: boolean })[] = [
    { label: "Overview", href: "/staff", group: "", show: true },
    // Editorial
    { label: "Editor Desk", href: "/editor", group: "Editorial", show: can(user, PV.STAFF_ACCESS) },
    { label: "Articles", href: "/admin/articles", group: "Editorial", show: can(user, PV.ARTICLE_CREATE) },
    { label: "News Aggregator", href: "/admin/news", group: "Editorial", show: can(user, PV.ARTICLE_CREATE) },
    { label: "Reports", href: "/admin/reports", group: "Editorial", show: can(user, PV.REPORT_TRIAGE) },
    { label: "Scam Database", href: "/admin/scams", group: "Editorial", show: can(user, PV.SCAM_EDIT) },
    // Operations
    { label: "Manager Console", href: "/manager", group: "Operations", show: can(user, PV.STORE_MANAGE) || can(user, PV.CONSULT_HANDLE) },
    { label: "Store & Products", href: "/admin/store", group: "Operations", show: can(user, PV.STORE_MANAGE) },
    { label: "Orders", href: "/admin/orders", group: "Operations", show: can(user, PV.ORDER_MANAGE) },
    { label: "Donations", href: "/admin/donations", group: "Operations", show: can(user, PV.DONATION_MANAGE) },
    { label: "Consultations", href: "/admin/consultations", group: "Operations", show: can(user, PV.CONSULT_HANDLE) },
    { label: "Community", href: "/admin/community", group: "Operations", show: can(user, PV.COMMUNITY_MANAGE) },
    // Administration
    { label: "Admin Panel", href: "/admin", group: "Administration", show: can(user, PV.ADMIN_ACCESS) },
    { label: "Users & Roles", href: "/admin/users", group: "Administration", show: can(user, PV.USER_MANAGE) },
    { label: "Audit Log", href: "/admin/audit", group: "Administration", show: can(user, PV.AUDIT_VIEW) },
    { label: "Settings", href: "/admin/settings", group: "Administration", show: can(user, PV.SETTINGS_MANAGE) },
  ];

  const items = all.filter((i) => i.show).map(({ show: _show, ...rest }) => rest);

  return (
    <DashShell items={items} user={{ displayName: user.displayName, role: user.role }}>
      {children}
    </DashShell>
  );
}
