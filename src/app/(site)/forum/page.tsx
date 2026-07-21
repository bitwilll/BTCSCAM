import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ButtonLink, EmptyState } from "@/components/ui";
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
  const totalThreads = categories.reduce((n, c) => n + c._count.threads, 0);

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
            The Forum
          </h1>
          <p className="mt-2.5 text-[18px] leading-[1.65] text-body-2 max-w-[60ch]">
            Watchmen comparing notes. Sourced claims rise; hype gets flagged.
          </p>
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
              className="flex justify-between gap-2.5 px-3.5 py-3 font-sans font-bold text-[14px] uppercase tracking-[.05em] bg-ink text-paper border border-ink"
            >
              <span>All threads</span>
              <span className="font-bold text-[16px] normal-case tracking-normal">
                {num(totalThreads)}
              </span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/forum/${c.slug}`}
                className="flex justify-between gap-2.5 px-3.5 py-3 font-sans font-bold text-[14px] uppercase tracking-[.05em] text-ink-700 border border-transparent hover:bg-surface-dim hover:text-ink"
              >
                <span>{c.name}</span>
                <span className="font-bold text-[16px] normal-case tracking-normal">
                  {num(c._count.threads)}
                </span>
              </Link>
            ))}
          </div>

          {/* house rules (v4 dark box) */}
          <div className="mt-5 bg-dark p-[18px]" style={{ color: "#E9E5DA" }}>
            <div className="kicker text-brand">House rules</div>
            <div className="flex flex-col gap-2.5 mt-3 text-[16px] leading-[1.5]">
              <div className="flex gap-2.5">
                <span className="text-brand font-bold">01</span>
                <span>Evidence first. Screenshots, txids, domains.</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-brand font-bold">02</span>
                <span>Label speculation as speculation.</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-brand font-bold">03</span>
                <span>No shaming victims. Ever.</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── thread river ── */}
        <div className="min-w-0" style={{ flex: "2.4 1 520px" }}>
          {/* intro card (v4, rendered statically) */}
          <div className="bg-masthead border-l-[3px] border-brand px-[18px] py-4 mb-3.5">
            <span className="kicker text-accent">New to the watch?</span>
            <p className="mt-2 text-[16px] leading-[1.6] text-body-2">
              Trust Scores (TS 0–100) are earned — verified reports and confirmed replies move you
              up. Post evidence first: txids, domains, screenshots. Speculation is welcome when you
              label it.
            </p>
            <Link
              href="/report"
              className="inline-block mt-2.5 kicker text-accent hover:underline underline-offset-4"
            >
              File your first report →
            </Link>
          </div>

          {hot.length ? (
            hot.map((t) => <ThreadRow key={t.id} thread={t} />)
          ) : (
            <EmptyState
              title="No threads yet"
              hint="Be the first to raise the alarm."
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
