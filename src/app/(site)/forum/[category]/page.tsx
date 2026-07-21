import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ButtonLink, EmptyState } from "@/components/ui";
import { num } from "@/lib/format";
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

  const [user, threads, categories] = await Promise.all([
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
    prisma.forumCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { threads: true } } },
    }),
  ]);

  const newHref = user ? "/forum/new" : "/login?next=/forum/new";
  const totalThreads = categories.reduce((n, c) => n + c._count.threads, 0);

  const sortTab = (active: boolean) =>
    `kicker px-3 py-1.5 border ${
      active
        ? "bg-ink text-paper border-ink"
        : "border-transparent text-body-2 hover:bg-surface-alt hover:text-ink"
    }`;

  return (
    <div className="max-w-[1360px] mx-auto px-6 pt-8 pb-16 fade-up">
      {/* ── header (v4) ── */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="kicker text-meta">Community watch</div>
          <h1
            className="font-display text-ink mt-1.5"
            style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2.5 text-[18px] leading-[1.65] text-body-2 max-w-[60ch]">
              {category.description}
            </p>
          )}
        </div>
        <ButtonLink href={newHref} variant="primary" size="lg">
          New thread
        </ButtonLink>
      </div>

      <div className="flex flex-wrap gap-8 mt-[26px]">
        {/* ── DESKS sidebar (v4) ── */}
        <aside className="grow" style={{ flexBasis: 250, maxWidth: 340 }}>
          <div className="kicker text-meta border-b border-ink pb-[9px]">Desks</div>
          <div className="flex flex-col gap-1 mt-3">
            <Link
              href="/forum"
              className="flex justify-between gap-2.5 px-3.5 py-3 font-sans font-bold text-[14px] uppercase tracking-[.05em] text-ink-700 border border-transparent hover:bg-surface-dim hover:text-ink"
            >
              <span>All threads</span>
              <span className="font-bold text-[16px] normal-case tracking-normal">
                {num(totalThreads)}
              </span>
            </Link>
            {categories.map((c) => {
              const active = c.id === category.id;
              return (
                <Link
                  key={c.id}
                  href={`/forum/${c.slug}`}
                  className={`flex justify-between gap-2.5 px-3.5 py-3 font-sans font-bold text-[14px] uppercase tracking-[.05em] border ${
                    active
                      ? "bg-ink text-paper border-ink"
                      : "text-ink-700 border-transparent hover:bg-surface-dim hover:text-ink"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-bold text-[16px] normal-case tracking-normal">
                    {num(c._count.threads)}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* ── thread river ── */}
        <div className="min-w-0" style={{ flex: "2.4 1 520px" }}>
          <div className="flex items-center gap-2 mb-3.5">
            <Link href={`/forum/${category.slug}?sort=hot`} className={sortTab(sort === "hot")}>
              Hot
            </Link>
            <Link href={`/forum/${category.slug}?sort=new`} className={sortTab(sort === "new")}>
              New
            </Link>
          </div>

          {threads.length ? (
            threads.map((t) => <ThreadRow key={t.id} thread={t} showCategory={false} />)
          ) : (
            <EmptyState
              title="No threads here yet"
              hint="This desk is quiet. Start the conversation."
              action={
                <ButtonLink href={newHref} variant="primary" size="sm">
                  New thread
                </ButtonLink>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
