import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canAny } from "@/lib/rbac";
import { PRIVILEGES, ROLE_LABELS } from "@/lib/constants";
import { Container, PageHeader, Avatar } from "@/components/ui";
import { ProfileForm } from "./_components/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Profile — My Desk · BTCSCAM.COM",
  description: "Update your display name, byline title and bio on BTCSCAM.COM.",
};

export default async function ProfilePage() {
  const user = await requireUser("/desk/profile");
  const isStaff = canAny(user, [PRIVILEGES.STAFF_ACCESS, PRIVILEGES.ADMIN_ACCESS]);

  // SessionUser has no bio — pull it fresh for the form default.
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bio: true },
  });

  return (
    <Container className="py-8 lg:py-10 max-w-3xl">
      <PageHeader kicker="My Desk" title="Edit Profile" lede="Control how you appear across the Watch — on bylines, forum threads and reports.">
        <Link href="/desk" className="kicker text-btc-dark hover:text-ink">
          ← Back to My Desk
        </Link>
      </PageHeader>

      <div className="grid lg:grid-cols-[1fr_240px] gap-8 lg:gap-10">
        <div>
          <ProfileForm
            displayName={user.displayName}
            bio={record?.bio ?? ""}
            title={user.title ?? ""}
            isStaff={isStaff}
          />
        </div>

        <aside className="lg:border-l lg:border-line lg:pl-8">
          <div className="flex items-center gap-3">
            <Avatar name={user.displayName} size={48} />
            <div className="min-w-0">
              <div className="font-display text-xl text-ink leading-none truncate">{user.displayName}</div>
              <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-1">@{user.username}</div>
            </div>
          </div>
          <dl className="mt-5 space-y-3">
            <div>
              <dt className="eyebrow">Role</dt>
              <dd className="mono text-sm text-ink-700">{ROLE_LABELS[user.role]}</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mono text-sm text-ink-700 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="eyebrow">Reputation</dt>
              <dd className="font-display text-2xl text-btc-dark">{user.reputation.toLocaleString("en-US")}</dd>
            </div>
          </dl>
          <p className="mono text-[10px] text-ink-400 uppercase tracking-wide mt-6 leading-relaxed">
            Role, email and reputation are managed by the newsroom and cannot be changed here.
          </p>
        </aside>
      </div>
    </Container>
  );
}
