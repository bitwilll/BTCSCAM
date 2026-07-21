import { Ticker } from "@/components/site/Ticker";
import { Masthead } from "@/components/site/Masthead";
import { PrimaryNav } from "@/components/site/PrimaryNav";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { prisma } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  const isStaff =
    !!user && (can(user, PRIVILEGES.STAFF_ACCESS) || can(user, PRIVILEGES.ADMIN_ACCESS));
  const cartCount = user
    ? await prisma.cartItem
        .aggregate({ where: { userId: user.id }, _sum: { quantity: true } })
        .then((r) => r._sum.quantity ?? 0)
        .catch(() => 0)
    : 0;

  return (
    <>
      <Ticker />
      <Masthead />
      <PrimaryNav
        user={user ? { displayName: user.displayName, isStaff } : null}
        cartCount={cartCount}
      />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
