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
}: {
  threadId: string;
  parentId?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSubmitted?: () => void;
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

  return (
    <form action={action} className={compact ? "" : "border border-line bg-paper-2 p-4"}>
      <input type="hidden" name="threadId" value={threadId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">{isReply ? "Your reply" : "Add a comment"}</span>
        <textarea
          ref={ref}
          name="body"
          required
          rows={compact ? 3 : 4}
          autoFocus={autoFocus}
          placeholder={isReply ? "Reply with evidence, links, or next steps…" : "Share what you know. Verify everything."}
          className="w-full border border-line-strong bg-paper px-3 py-2.5 text-sm focus:outline-none focus:border-ink resize-y"
        />
      </label>
      {state?.error && <p className="mono text-[12px] text-alert-strong mt-2">{state.error}</p>}
      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? "Posting…" : isReply ? "Post reply" : "Post comment"}
        </Button>
        {isReply && onSubmitted && (
          <button type="button" onClick={onSubmitted} className="kicker text-ink-500 hover:text-ink">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
