"use client";

import { useActionState } from "react";
import { createThread, type ThreadFormState } from "@/actions/forum";
import { Button } from "@/components/ui";

export function NewThreadForm({
  categories,
  defaultCategoryId,
}: {
  categories: { id: string; name: string }[];
  defaultCategoryId?: string;
}) {
  const [state, action, pending] = useActionState<ThreadFormState, FormData>(createThread, null);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Title</span>
        <input
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={160}
          placeholder="What did you see? Be specific."
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
        <span className="mono text-[10px] text-ink-400 mt-1 block">At least 5 characters.</span>
      </label>

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Category</span>
        <select
          name="categoryId"
          required
          defaultValue={defaultCategoryId ?? ""}
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
        >
          <option value="" disabled>
            Choose a category…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Post</span>
        <textarea
          name="body"
          required
          minLength={10}
          rows={8}
          placeholder="Give the details: chains, addresses, links, screenshots described. Verify everything."
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink resize-y"
        />
        <span className="mono text-[10px] text-ink-400 mt-1 block">At least 10 characters.</span>
      </label>

      {state?.error && <p className="mono text-[12px] text-alert-strong">{state.error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Posting…" : "Post Thread"}
        </Button>
        <span className="mono text-[11px] uppercase tracking-wide text-ink-400">
          Not financial advice · Verify everything
        </span>
      </div>
    </form>
  );
}
