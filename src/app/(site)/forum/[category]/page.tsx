import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, PageHeader, SectionHeader, ButtonLink, EmptyState } from "@/components/ui";
import { ThreadRow } from "../_components/ThreadRow";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await prisma.forumCategory.findUnique({ where: { slug } });
  if (!category) return { title: "Category not found · Forum · BTCSCAM.COM" };
  return {
    title: `${category.name} · Forum · BTCSCAM.COM`,
    description: category.description ?? `Community threads in ${category.name}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const { sort: rawSort } = await searchParams;
  const sort = rawSort === "new" ? "new" : "hot";

  const category = await prisma.forumCategory.findUnique({ where: { slug } });
  if (!category) notFound();

  const [user, threads] = await Promise.all([
    getSession(),
    prisma.forumThread.findMany({
      where: { categoryId: category.id },
      orderBy:
        sort === "new"
          ? [{ isPinned: "desc" }, { createdAt: "desc" }]
          : [{ isPinned: "desc" }, { score: "desc" }],
      include: {
        author: true,
        category: true,
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const newHref = user ? "/forum/new" : "/login?next=/forum/new";

  const tabClass = (active: boolean) =>
    `kicker px-3 py-1.5 border ${
      active ? "bg-ink text-paper border-ink" : "border-line-strong text-ink-500 hover:text-ink hover:border-ink"
    }`;

  return (
    <Container className="py-10">
      <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-4">
        <Link href="/forum" className="text-btc-dark hover:text-ink">Forum</Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </div>

      <PageHeader kicker="Community Forum" title={category.name} lede={category.description ?? undefined}>
        <ButtonLink href={newHref} variant="primary" size="md">
          + New Thread
        </ButtonLink>
      </PageHeader>

      <div className="flex items-center gap-2 mb-6">
        <Link href={`/forum/${category.slug}?sort=hot`} className={tabClass(sort === "hot")}>Hot</Link>
        <Link href={`/forum/${category.slug}?sort=new`} className={tabClass(sort === "new")}>New</Link>
      </div>

      <SectionHeader title={sort === "new" ? "Newest Threads" : "Hottest Threads"} />
      {threads.length ? (
        threads.map((t) => <ThreadRow key={t.id} thread={t} showCategory={false} />)
      ) : (
        <EmptyState
          title="No threads here yet"
          hint="This category is quiet. Start the conversation."
          action={<ButtonLink href={newHref} variant="primary" size="sm">+ New Thread</ButtonLink>}
        />
      )}
    </Container>
  );
}
