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
    <form action={action}>
      {/* v4 composer: ink-bordered paper fields */}
      <input
        name="title"
        type="text"
        required
        minLength={5}
        maxLength={160}
        placeholder="Thread title — specific beats loud"
        className="mt-3 w-full border border-ink bg-paper px-4 py-[13px] font-sans font-bold text-[18px] text-ink placeholder:text-faint placeholder:font-normal focus:outline-none focus:outline-2"
      />

      <select
        name="categoryId"
        required
        defaultValue={defaultCategoryId ?? ""}
        className="mt-2.5 w-full border border-ink bg-paper px-4 py-[13px] font-sans text-[16px] text-ink focus:outline-none"
      >
        <option value="" disabled>
          Choose a desk…
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        name="body"
        required
        minLength={10}
        rows={6}
        placeholder="What happened, when, links and evidence. The forum verifies — give it something to verify."
        className="mt-2.5 w-full border border-ink bg-paper px-4 py-[13px] font-sans text-[16px] leading-[1.55] text-ink placeholder:text-faint resize-y focus:outline-none"
      />

      {state?.error && <p className="mt-2.5 text-[14px] text-danger">{state.error}</p>}

      <div className="mt-3 flex items-center gap-4 flex-wrap">
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Posting…" : "Post thread"}
        </Button>
        <span className="text-[14px] text-meta uppercase tracking-[.02em]">
          Not financial advice · Verify everything
        </span>
      </div>
    </form>
  );
}
