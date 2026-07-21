import Link from "next/link";
import { Tag } from "@/components/ui";
import { timeAgo, num } from "@/lib/format";
import { trustScore, trustTier, TRUST_TITLE } from "./trust";
import { ArrowUpIcon } from "./icons";

export type ThreadRowData = {
  id: string;
  slug: string;
  title: string;
  score: number;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  author?: { displayName: string; reputation?: number } | null;
  category?: { slug: string; name: string } | null;
  _count?: { comments: number };
};

export function ThreadRow({
  thread,
  showCategory = true,
}: {
  thread: ThreadRowData;
  showCategory?: boolean;
}) {
  const comments = thread._count?.comments ?? 0;
  const ts = trustScore(thread.author?.reputation);

  return (
    <article className="flex items-start gap-4 bg-white px-3 py-4 border-b border-rule hover:bg-surface-dim">
      {/* upvote count block (v4: arrow + count, min 56px) */}
      <div className="flex flex-col items-center gap-0.5 min-w-[56px] shrink-0 border border-rule bg-white px-2.5 py-2">
        <span className="text-meta inline-flex">
          <ArrowUpIcon />
        </span>
        <span className="font-sans font-bold text-[16px] text-ink leading-tight">
          {num(thread.score)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.isPinned && <Tag tone="black">Pinned</Tag>}
          {thread.isLocked && <Tag tone="red">Locked</Tag>}
          {showCategory && thread.category && (
            <Link href={`/forum/${thread.category.slug}`} className="kicker text-meta hover:text-ink">
              {thread.category.name}
            </Link>
          )}
        </div>

        <Link
          href={`/forum/thread/${thread.slug}`}
          className="block mt-1.5 font-display text-[21px] leading-[1.35] text-ink hover:underline underline-offset-4 decoration-1"
        >
          {thread.title}
        </Link>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] text-meta">
          <span className="font-bold text-body-2">
            {thread.author ? thread.author.displayName : "[deleted]"}
          </span>
          {thread.author && (
            <span className="font-bold text-safe" title={TRUST_TITLE}>
              TS {ts} · {trustTier(ts)}
            </span>
          )}
          <span className="uppercase">
            {comments} {comments === 1 ? "reply" : "replies"}
          </span>
          <span>Active {timeAgo(thread.updatedAt ?? thread.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
