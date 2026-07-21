"use client";

import { useState, useTransition } from "react";
import { toggleSaveArticle } from "@/actions/engagement";

// v4 quiet-button recipe: borderless, 700 14px, hover fills surface-alt.
export function SaveButton({ articleId, initialSaved = false }: { articleId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <button
      onClick={() =>
        start(async () => {
          setErr(null);
          const r = await toggleSaveArticle(articleId);
          if (r.ok) setSaved(r.message === "saved");
          else setErr(r.error ?? "Error");
        })
      }
      disabled={pending}
      className={`px-3.5 py-2 font-sans font-bold text-[14px] uppercase tracking-[.05em] border cursor-pointer disabled:opacity-60 ${
        saved
          ? "border-transparent bg-surface-alt text-ink"
          : "border-transparent bg-transparent text-body-2 hover:bg-surface-alt hover:text-ink"
      }`}
      title={err ?? undefined}
    >
      {saved ? "✓ Saved" : "Save"}
    </button>
  );
}
