import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { Tag } from "@/components/ui";
import { timeAgo, toStrArray } from "@/lib/format";
import { trustScore, trustTier, TRUST_TITLE } from "../../_components/trust";
import { VoteButtons } from "./_components/VoteButtons";
import { CommentForm } from "./_components/CommentForm";
import { CommentReply } from "./_components/CommentReply";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const thread = await prisma.forumThread.findUnique({
    where: { slug },
    select: { title: true, body: true },
  });
  if (!thread) return { title: "Thread not found · Forum · BTCSCAM.COM" };
  return {
    title: `${thread.title} · Forum · BTCSCAM.COM`,
    description: thread.body.slice(0, 155),
  };
}

type CommentRecord = {
  id: string;
  body: string;
  score: number;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: Date;
  author: { displayName: string; title: string | null; reputation: number } | null;
};

type CommentNode = CommentRecord & { children: CommentNode[] };

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function ThreadPage({ params }: PageProps) {
  const { slug } = await params;

  const thread = await prisma.forumThread.findUnique({
    where: { slug },
    include: { author: true, category: true },
  });
  if (!thread) notFound();

  const [user, comments] = await Promise.all([
    getSession(),
    prisma.forumComment.findMany({
      where: { threadId: thread.id },
      orderBy: { score: "desc" },
      include: { author: { select: { displayName: true, title: true, reputation: true } } },
    }),
  ]);

  // Current user's existing votes for this thread + its comments (for arrow state).
  const voteMap = new Map<string, 1 | -1>();
  if (user) {
    const ids = [thread.id, ...comments.map((c) => c.id)];
    const votes = await prisma.vote.findMany({
      where: { userId: user.id, targetId: { in: ids } },
      select: { targetType: true, targetId: true, value: true },
    });
    for (const v of votes) voteMap.set(`${v.targetType}:${v.targetId}`, v.value === 1 ? 1 : -1);
  }
  const voteFor = (type: "thread" | "comment", id: string): 1 | 0 | -1 =>
    voteMap.get(`${type}:${id}`) ?? 0;

  // Build the nested comment tree by parentId (comments already sorted by score).
  const nodeById = new Map<string, CommentNode>();
  for (const c of comments) nodeById.set(c.id, { ...c, children: [] });
  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = nodeById.get(c.id)!;
    const parent = c.parentId ? nodeById.get(c.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const canComment = Boolean(user) && can(user, PRIVILEGES.FORUM_COMMENT) && !thread.isLocked;
  const poster = canComment && user ? { name: user.displayName, ts: trustScore(user.reputation) } : null;
  const tags = toStrArray(thread.tags);
  const bodyParagraphs = thread.body.split(/\n{2,}/).filter((p) => p.trim().length);
  const threadId = thread.id;
  const authorTs = trustScore(thread.author?.reputation);

  function renderNode(node: CommentNode, depth: number) {
    const ts = trustScore(node.author?.reputation);
    return (
      <div key={node.id}>
        {/* v4 reply row */}
        <div className="flex gap-3.5 py-5 px-1 border-b border-rule">
          <div className="flex-none w-[42px] h-[42px] bg-surface-alt text-ink flex items-center justify-center font-sans font-bold text-[16px]">
            {initials(node.isDeleted ? "??" : node.author?.displayName ?? "??")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex gap-2.5 items-baseline flex-wrap">
              <span className="font-sans font-bold text-[16px] text-ink">
                {node.isDeleted ? "[removed]" : node.author?.displayName ?? "[deleted]"}
              </span>
              {!node.isDeleted && node.author && (
                <span className="font-sans font-bold text-[14px] text-safe" title={TRUST_TITLE}>
                  TS {ts} · {trustTier(ts)}
                </span>
              )}
              {!node.isDeleted && node.author?.title && (
                <span className="text-[14px] text-meta">{node.author.title}</span>
              )}
              <span className="text-[14px] text-meta">{timeAgo(node.createdAt)}</span>
            </div>
            <p
              className={`mt-2 text-[16px] leading-[1.7] max-w-[64ch] ${
                node.isDeleted ? "text-faint italic" : "text-ink"
              }`}
            >
              {node.isDeleted ? "This comment was removed." : node.body}
            </p>
            {!node.isDeleted && (
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <VoteButtons
                  targetType="comment"
                  targetId={node.id}
                  initialScore={node.score}
                  initialVote={voteFor("comment", node.id)}
                />
                {poster && (
                  <CommentReply
                    threadId={threadId}
                    parentId={node.id}
                    posterName={poster.name}
                    posterTs={poster.ts}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {/* nested children: 1px rule + left indent (v4) */}
        {node.children.length > 0 && (
          <div className={depth < 6 ? "ml-[21px] border-l border-rule pl-[18px]" : ""}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[980px] mx-auto px-6 pt-8 pb-16 fade-up">
      {/* ── breadcrumb (v4) ── */}
      <div className="text-[14px] text-meta tracking-[.05em]">
        <Link href="/forum" className="text-ink font-bold hover:underline underline-offset-4">
          ← ALL THREADS
        </Link>{" "}
        /{" "}
        {thread.category ? (
          <Link
            href={`/forum/${thread.category.slug}`}
            className="hover:underline underline-offset-4"
          >
            {thread.category.name}
          </Link>
        ) : (
          "Forum"
        )}
      </div>

      {/* ── thread card (v4) ── */}
      <div className="mt-4 bg-white shadow-card">
        <div className="px-6 py-[22px]">
          <div className="flex gap-2 items-center flex-wrap">
            {thread.isPinned && <Tag tone="black">Pinned</Tag>}
            {thread.isLocked && <Tag tone="red">Locked</Tag>}
            {thread.category && (
              <span className="kicker text-meta">{thread.category.name}</span>
            )}
          </div>
          <h1
            className="font-display text-ink mt-2.5"
            style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.2, textWrap: "balance" }}
          >
            {thread.title}
          </h1>
          <div className="flex gap-3 items-center mt-4 flex-wrap">
            <div className="flex-none w-[42px] h-[42px] bg-ink text-paper flex items-center justify-center font-sans font-bold text-[16px]">
              {initials(thread.author?.displayName ?? "??")}
            </div>
            <div>
              <span className="font-sans font-bold text-[16px] text-ink">
                {thread.author ? thread.author.displayName : "[deleted]"}
              </span>
              {thread.author && (
                <span className="ml-2.5 font-sans font-bold text-[14px] text-safe" title={TRUST_TITLE}>
                  TS {authorTs} · {trustTier(authorTs)}
                </span>
              )}
              {thread.author?.title && (
                <span className="ml-2.5 text-[14px] text-meta">{thread.author.title}</span>
              )}
            </div>
            <span className="ml-auto text-[14px] text-meta">
              Active {timeAgo(thread.updatedAt)}
            </span>
          </div>

          <div className="prose-bs mt-5">
            {bodyParagraphs.length ? (
              bodyParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>{thread.body}</p>
            )}
          </div>

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Tag key={t} tone="paper">
                  #{t}
                </Tag>
              ))}
            </div>
          )}

          <div className="mt-4">
            <VoteButtons
              targetType="thread"
              targetId={thread.id}
              initialScore={thread.score}
              initialVote={voteFor("thread", thread.id)}
            />
          </div>
        </div>
        <div className="bg-surface-dim border-t border-rule px-6 py-2.5 text-[14px] text-meta uppercase tracking-[.02em]">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </div>
      </div>

      {/* ── replies (v4 nested rows) ── */}
      {roots.length ? (
        <div>{roots.map((r) => renderNode(r, 0))}</div>
      ) : (
        <p className="py-6 text-[16px] text-meta">No replies yet — start the discussion.</p>
      )}

      {/* ── composer (v4 card) ── */}
      <div className="mt-[22px]">
        {thread.isLocked ? (
          <div className="bg-surface-dim border border-rule px-4 py-3.5 text-[14px] text-meta uppercase tracking-[.02em]">
            This thread is locked. New replies are disabled.
          </div>
        ) : user ? (
          canComment && poster ? (
            <CommentForm threadId={thread.id} posterName={poster.name} posterTs={poster.ts} />
          ) : (
            <div className="bg-surface-dim border border-rule px-4 py-3.5 text-[14px] text-meta uppercase tracking-[.02em]">
              Your account can&apos;t reply on the forum.
            </div>
          )
        ) : (
          <div className="bg-surface-dim border border-rule px-4 py-3.5 text-[16px] text-body-2">
            <Link
              href={`/login?next=/forum/thread/${thread.slug}`}
              className="text-accent font-bold hover:underline underline-offset-4"
            >
              Log in
            </Link>{" "}
            to join the thread.
          </div>
        )}
      </div>
    </div>
  );
}
