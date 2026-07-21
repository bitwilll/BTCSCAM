"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

export function CommentReply({
  threadId,
  parentId,
  posterName,
  posterTs,
}: {
  threadId: string;
  parentId: string;
  posterName?: string;
  posterTs?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-3 py-1.5 kicker text-body-2 border border-transparent hover:bg-surface-alt hover:text-ink cursor-pointer"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2.5">
      <CommentForm
        threadId={threadId}
        parentId={parentId}
        compact
        autoFocus
        posterName={posterName}
        posterTs={posterTs}
        onSubmitted={() => setOpen(false)}
      />
    </div>
  );
}
