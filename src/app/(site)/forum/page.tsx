import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, SectionHeader, ButtonLink, EmptyState } from "@/components/ui";
import { num } from "@/lib/format";
import { ThreadRow } from "./_components/ThreadRow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Forum · BTCSCAM.COM",
  description:
    "Community-verified scam intelligence — fresh sightings, victim support, on-chain investigations and wallet-security discussion.",
};

export default async function ForumPage() {
  const user = await getSession();

  const [categories, hot] = await Promise.all([
    prisma.forumCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { threads: true } } },
    }),
    prisma.forumThread.findMany({
      orderBy: { score: "desc" },
      take: 10,
      include: {
        author: true,
        category: true,
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const newHref = user ? "/forum/new" : "/login?next=/forum/new";

  return (
    <Container className="py-10">
      <PageHeader
        kicker="Community"
        title="The Forum"
        lede="Where the watch compares notes — post a sighting, ask for help, or crowdsource an on-chain trace. Verify everything."
      >
        <ButtonLink href={newHref} variant="primary" size="md">
          + New Thread
        </ButtonLink>
      </PageHeader>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        {/* Hot threads */}
        <div>
          <SectionHeader title="Hot Threads" action={{ label: "Start a thread", href: newHref }} />
          {hot.length ? (
            hot.map((t) => <ThreadRow key={t.id} thread={t} />)
          ) : (
            <EmptyState
              title="No threads yet"
              hint="Be the first to raise the alarm."
              action={<ButtonLink href={newHref} variant="primary" size="sm">+ New Thread</ButtonLink>}
            />
          )}
        </div>

        {/* Categories */}
        <aside className="lg:border-l lg:border-line lg:pl-8">
          <SectionHeader title="Categories" />
          <div>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/forum/${c.slug}`}
                className="block py-4 border-b border-line last:border-0 group"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-extrabold text-ink group-hover:text-btc-dark">{c.name}</span>
                  <span className="mono text-[11px] text-ink-500 uppercase tracking-wide shrink-0">
                    {num(c._count.threads)} {c._count.threads === 1 ? "thread" : "threads"}
                  </span>
                </div>
                {c.description && <p className="mt-1 text-sm text-ink-600 leading-snug">{c.description}</p>}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </Container>
  );
}
