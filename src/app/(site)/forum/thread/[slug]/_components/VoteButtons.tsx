"use client";

import { useState, useTransition } from "react";
import { voteAction } from "@/actions/engagement";
import { num } from "@/lib/format";
import { ArrowUpIcon } from "../../../_components/icons";

export function VoteButtons({
  targetType,
  targetId,
  initialScore,
  initialVote = 0,
}: {
  targetType: "thread" | "comment";
  targetId: string;
  initialScore: number;
  initialVote?: 1 | 0 | -1;
}) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<1 | 0 | -1>(initialVote);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function cast(next: 1 | -1) {
    if (pending) return;
    const prevVote = vote;
    const prevScore = score;

    // Mirror the server's toggle logic: same direction clears the vote,
    // opposite direction flips it (delta of 2).
    let newVote: 1 | 0 | -1;
    let delta: number;
    if (prevVote === next) {
      newVote = 0;
      delta = -next;
    } else if (prevVote === 0) {
      newVote = next;
      delta = next;
    } else {
      newVote = next;
      delta = 2 * next;
    }

    setVote(newVote);
    setScore(prevScore + delta);
    setErr(null);

    start(async () => {
      const r = await voteAction(targetType, targetId, next);
      if (!r.ok) {
        setVote(prevVote);
        setScore(prevScore);
        setErr(r.error ?? "Vote failed");
      }
    });
  }

  // v4 thread screen: big ghost UPVOTE button — 1px ink border, hover surface-alt.
  if (targetType === "thread") {
    return (
      <button
        type="button"
        aria-label="Upvote thread"
        aria-pressed={vote === 1}
        onClick={() => cast(1)}
        disabled={pending}
        title={err ?? undefined}
        className={`inline-flex items-center gap-[7px] px-4 py-2 font-sans font-bold text-[14px] uppercase tracking-[.05em] border cursor-pointer select-none disabled:opacity-50 ${
          vote === 1
            ? "border-brand bg-masthead text-ink"
            : "border-ink bg-transparent text-ink hover:bg-surface-alt"
        }`}
      >
        <ArrowUpIcon />
        Upvote · {num(score)}
      </button>
    );
  }

  // v4 comment vote: quiet button with arrow — text-body-2, hover surface-alt.
  return (
    <button
      type="button"
      aria-label="Upvote comment"
      aria-pressed={vote === 1}
      onClick={() => cast(1)}
      disabled={pending}
      title={err ?? undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-sans font-bold text-[14px] border cursor-pointer select-none disabled:opacity-50 ${
        vote === 1
          ? "border-brand bg-masthead text-ink"
          : "border-transparent bg-transparent text-body-2 hover:bg-surface-alt hover:text-ink"
      }`}
    >
      <ArrowUpIcon />
      {num(score)}
    </button>
  );
}
