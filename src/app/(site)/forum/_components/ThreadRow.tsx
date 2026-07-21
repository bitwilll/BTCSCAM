import Link from "next/link";
import { Tag } from "@/components/ui";
import { timeAgo, num } from "@/lib/format";

export type ThreadRowData = {
  id: string;
  slug: string;
  title: string;
  score: number;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: Date | string;
  author?: { displayName: string } | null;
  category?: { slug: string; name: string } | null;
  _count?: { comments: number };
};

export function ThreadRow({ thread, showCategory = true }: { thread: ThreadRowData; showCategory?: boolean }) {
  const comments = thread._count?.comments ?? 0;
  return (
    <article className="flex gap-4 py-4 border-b border-line last:border-0">
      <div className="flex flex-col items-center justify-center w-12 shrink-0 border-r border-line pr-3">
        <span className="font-display text-2xl text-ink leading-none">{num(thread.score)}</span>
        <span className="mono text-[10px] text-ink-500 uppercase tracking-wide mt-0.5">pts</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && <Tag tone="orange">Pinned</Tag>}
          {thread.isLocked && <Tag tone="red">Locked</Tag>}
          <h3 className="font-extrabold text-ink leading-tight text-lg hover:text-btc-dark">
            <Link href={`/forum/thread/${thread.slug}`}>{thread.title}</Link>
          </h3>
        </div>
        <div className="mt-1.5 mono text-[11px] text-ink-500 uppercase tracking-wide flex flex-wrap gap-x-3 gap-y-1">
          {showCategory && thread.category && (
            <Link href={`/forum/${thread.category.slug}`} className="text-btc-dark hover:text-ink">
              {thread.category.name}
            </Link>
          )}
          <span className="text-ink-700">{thread.author ? `by ${thread.author.displayName}` : "by [deleted]"}</span>
          <span>{comments} {comments === 1 ? "comment" : "comments"}</span>
          <span>{timeAgo(thread.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
