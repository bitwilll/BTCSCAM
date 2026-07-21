"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type CommentState } from "@/actions/forum";
import { Button } from "@/components/ui";

export function CommentForm({
  threadId,
  parentId,
  compact = false,
  autoFocus = false,
  onSubmitted,
  posterName,
  posterTs,
}: {
  threadId: string;
  parentId?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSubmitted?: () => void;
  posterName?: string;
  posterTs?: number;
}) {
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment, null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (state?.ok && !handled.current) {
      handled.current = true;
      ref.current?.form?.reset();
      onSubmitted?.();
    }
  }, [state, onSubmitted]);

  const isReply = Boolean(parentId);

  // v4 comment composer: white card, shadow-card, paper textarea, posting-as line.
  return (
    <form action={action} className={`bg-white shadow-card ${compact ? "p-3.5" : "p-4"}`}>
      <input type="hidden" name="threadId" value={threadId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea
        ref={ref}
        name="body"
        required
        rows={3}
        autoFocus={autoFocus}
        placeholder="Sourced claims only — speculation gets labeled."
        className="w-full border border-rule bg-paper px-3.5 py-3 text-[16px] leading-[1.5] text-ink placeholder:text-faint resize-y focus:outline-none focus:border-ink"
      />
      {state?.error && <p className="mt-2 text-[14px] text-danger">{state.error}</p>}
      <div className="mt-2.5 flex justify-between items-center gap-2.5 flex-wrap">
        <span className="text-[14px] text-meta uppercase tracking-[.02em]">
          {isReply ? "Replying as" : "Posting as"}{" "}
          {posterName ? (
            <>
              {posterName}
              {typeof posterTs === "number" && <> · TS {posterTs}</>}
            </>
          ) : (
            "the watch"
          )}
        </span>
        <div className="flex items-center gap-3">
          {isReply && onSubmitted && (
            <button type="button" onClick={onSubmitted} className="kicker text-meta hover:text-ink">
              Cancel
            </button>
          )}
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Posting…" : "Post reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}
