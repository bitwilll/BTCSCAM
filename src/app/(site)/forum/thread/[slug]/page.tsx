import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { Container, SectionHeader, Tag, Avatar } from "@/components/ui";
import { byline, timeAgo, toStrArray } from "@/lib/format";
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
  author: { displayName: string; title: string | null } | null;
};

type CommentNode = CommentRecord & { children: CommentNode[] };

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
      include: { author: { select: { displayName: true, title: true } } },
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
  const tags = toStrArray(thread.tags);
  const bodyParagraphs = thread.body.split(/\n{2,}/).filter((p) => p.trim().length);
  const threadId = thread.id;

  function renderNode(node: CommentNode, depth: number) {
    const indent = Math.min(depth, 6) * 18;
    return (
      <div key={node.id} style={{ marginLeft: indent }} className="pt-4">
        <div className="flex gap-3">
          {!node.isDeleted && (
            <VoteButtons
              targetType="comment"
              targetId={node.id}
              initialScore={node.score}
              initialVote={voteFor("comment", node.id)}
              size="sm"
            />
          )}
          <div className="min-w-0 flex-1 border-l border-line pl-3">
            <div className="mono text-[11px] text-ink-500 uppercase tracking-wide flex flex-wrap gap-x-2 gap-y-0.5">
              <span className="text-ink-700 font-semibold">
                {node.isDeleted ? "[removed]" : node.author?.displayName ?? "[deleted]"}
              </span>
              {!node.isDeleted && node.author?.title && <span>{node.author.title}</span>}
              <span>{timeAgo(node.createdAt)}</span>
            </div>
            <p className={`mt-1.5 text-sm leading-snug ${node.isDeleted ? "text-ink-400 italic" : "text-ink-700"}`}>
              {node.isDeleted ? "This comment was removed." : node.body}
            </p>
            {canComment && !node.isDeleted && (
              <div className="mt-2">
                <CommentReply threadId={threadId} parentId={node.id} />
              </div>
            )}
          </div>
        </div>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <Container className="py-10 max-w-3xl">
      {/* Breadcrumb */}
      <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-5">
        <Link href="/forum" className="text-btc-dark hover:text-ink">Forum</Link>
        {thread.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/forum/${thread.category.slug}`} className="text-btc-dark hover:text-ink">
              {thread.category.name}
            </Link>
          </>
        )}
      </div>

      {/* Thread head */}
      <div className="flex gap-4 border-b-2 border-ink pb-6">
        <VoteButtons
          targetType="thread"
          targetId={thread.id}
          initialScore={thread.score}
          initialVote={voteFor("thread", thread.id)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {thread.isPinned && <Tag tone="orange">Pinned</Tag>}
            {thread.isLocked && <Tag tone="red">Locked</Tag>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.95]">{thread.title}</h1>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar name={thread.author?.displayName ?? "Anon"} size={30} />
            <div className="mono text-[11px] uppercase tracking-wide text-ink-500 flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="text-ink-700 font-semibold">
                {thread.author ? thread.author.displayName : "[deleted]"}
              </span>
              {thread.author?.title && <span>{thread.author.title}</span>}
              <span>{byline(thread.createdAt)}</span>
              <span>{timeAgo(thread.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thread body */}
      <div className="prose-bs mt-6">
        {bodyParagraphs.length ? (
          bodyParagraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p>{thread.body}</p>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Tag key={t} tone="paper">#{t}</Tag>
          ))}
        </div>
      )}

      {/* Comments */}
      <section className="mt-10">
        <SectionHeader title={`${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`} />
        {roots.length ? (
          <div>{roots.map((r) => renderNode(r, 0))}</div>
        ) : (
          <p className="mono text-sm text-ink-500 py-4">No comments yet — start the discussion.</p>
        )}
      </section>

      {/* Composer */}
      <section className="mt-8">
        {thread.isLocked ? (
          <div className="border border-line-strong bg-paper-2 p-4 mono text-[12px] uppercase tracking-wide text-ink-500">
            🔒 This thread is locked. New comments are disabled.
          </div>
        ) : user ? (
          canComment ? (
            <CommentForm threadId={thread.id} />
          ) : (
            <div className="border border-line-strong bg-paper-2 p-4 mono text-[12px] uppercase tracking-wide text-ink-500">
              Your account can't comment on the forum.
            </div>
          )
        ) : (
          <div className="border border-line-strong bg-paper-2 p-4 text-sm text-ink-600">
            <Link href={`/login?next=/forum/thread/${thread.slug}`} className="text-btc-dark underline font-semibold">
              Log in
            </Link>{" "}
            to comment.
          </div>
        )}
      </section>
    </Container>
  );
}
