import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canAny } from "@/lib/rbac";
import { PRIVILEGES, ROLE_LABELS } from "@/lib/constants";
import { Container, PageHeader, Avatar } from "@/components/ui";
import { ProfileForm } from "./_components/ProfileForm";
import { num } from "@/lib/format";

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
    <Container className="pt-8 pb-10 max-w-3xl fade-up">
      <PageHeader
        kicker="My Desk"
        title="Edit profile"
        lede="Control how you appear across the Watch — on bylines, forum threads and reports."
      >
        <Link href="/desk" className="kicker text-accent hover:underline underline-offset-4">
          ← Back to my desk
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

        <aside className="lg:border-l lg:border-rule lg:pl-8">
          <div className="flex items-center gap-3">
            <Avatar name={user.displayName} size={48} />
            <div className="min-w-0">
              <div className="font-display text-[21px] leading-[1.2] text-ink truncate">
                {user.displayName}
              </div>
              <div className="mt-1 text-[14px] text-meta uppercase tracking-[.02em]">
                @{user.username}
              </div>
            </div>
          </div>
          <dl className="mt-5 space-y-3.5">
            <div>
              <dt className="eyebrow">Role</dt>
              <dd className="mt-0.5 text-[16px] text-body-2">{ROLE_LABELS[user.role]}</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-0.5 mono text-[14px] text-body-2 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="eyebrow">Trust score</dt>
              <dd className="mt-0.5 mono font-bold text-[24px] text-ink">
                TS {num(user.reputation)}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-[14px] text-meta leading-[1.5]">
            Role, email and trust score are managed by the newsroom and cannot be changed here.
          </p>
        </aside>
      </div>
    </Container>
  );
}
