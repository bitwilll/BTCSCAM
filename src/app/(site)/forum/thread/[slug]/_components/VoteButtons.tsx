"use client";

import { useState, useTransition } from "react";
import { voteAction } from "@/actions/engagement";
import { num } from "@/lib/format";

export function VoteButtons({
  targetType,
  targetId,
  initialScore,
  initialVote = 0,
  size = "md",
}: {
  targetType: "thread" | "comment";
  targetId: string;
  initialScore: number;
  initialVote?: 1 | 0 | -1;
  size?: "sm" | "md";
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

  const arrow = size === "sm" ? "text-sm" : "text-base";
  const scoreSize = size === "sm" ? "text-base" : "text-2xl";
  const scoreColor = vote === 1 ? "text-btc-dark" : vote === -1 ? "text-alert-strong" : "text-ink";

  return (
    <div className="flex flex-col items-center gap-0.5 select-none shrink-0" title={err ?? undefined}>
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={vote === 1}
        onClick={() => cast(1)}
        disabled={pending}
        className={`leading-none ${arrow} ${vote === 1 ? "text-btc-dark" : "text-ink-400 hover:text-ink"} disabled:opacity-50`}
      >
        ▲
      </button>
      <span className={`font-display leading-none ${scoreSize} ${scoreColor}`}>{num(score)}</span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={vote === -1}
        onClick={() => cast(-1)}
        disabled={pending}
        className={`leading-none ${arrow} ${vote === -1 ? "text-alert-strong" : "text-ink-400 hover:text-ink"} disabled:opacity-50`}
      >
        ▼
      </button>
    </div>
  );
}
