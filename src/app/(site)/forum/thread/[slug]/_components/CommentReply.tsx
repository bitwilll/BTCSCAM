"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

export function CommentReply({ threadId, parentId }: { threadId: string; parentId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="kicker text-ink-500 hover:text-btc-dark"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2">
      <CommentForm
        threadId={threadId}
        parentId={parentId}
        compact
        autoFocus
        onSubmitted={() => setOpen(false)}
      />
    </div>
  );
}
