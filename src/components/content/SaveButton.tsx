"use client";

import { useState, useTransition } from "react";
import { toggleSaveArticle } from "@/actions/engagement";

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
      className={`kicker inline-flex items-center gap-1 ${saved ? "text-btc-dark" : "text-ink-500 hover:text-ink"}`}
      title={err ?? undefined}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
