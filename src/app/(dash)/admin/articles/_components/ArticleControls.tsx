"use client";

import { useState, useTransition } from "react";
import {
  setArticleStatus,
  toggleFeature,
  deleteArticle,
  type Result,
} from "@/actions/admin-ops";

const ARTICLE_STATUSES = ["draft", "review", "published", "archived"] as const;

const sel =
  "mt-1 border border-line-strong bg-paper px-2 py-1.5 text-xs focus:outline-none focus:border-ink disabled:opacity-50";
const cap = "mono text-[10px] uppercase tracking-wide text-ink-400";
const btn = "kicker px-2 py-1.5 border transition-colors disabled:opacity-50";

export function ArticleControls({
  articleId,
  status,
  isFeatured,
  canPublish,
  canDelete,
}: {
  articleId: string;
  status: string;
  isFeatured: boolean;
  canPublish: boolean;
  canDelete: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const run = (fn: () => Promise<Result>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      setMsg({ ok: r.ok, text: r.ok ? "Saved" : r.error ?? "Error" });
    });

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <label className="block">
        <span className={cap}>Status</span>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) => run(() => setArticleStatus(articleId, e.target.value))}
          className={`${sel} w-full`}
          aria-label="Article status"
        >
          {ARTICLE_STATUSES.map((s) => (
            <option key={s} value={s} disabled={s === "published" && !canPublish}>
              {s}
              {s === "published" && !canPublish ? " (no permission)" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleFeature(articleId))}
          className={`${btn} ${
            isFeatured
              ? "bg-btc text-black border-btc"
              : "bg-paper text-ink-600 border-line-strong hover:border-ink"
          }`}
        >
          {isFeatured ? "★ Featured" : "☆ Feature"}
        </button>

        {canDelete &&
          (confirming ? (
            <span className="flex gap-1">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteArticle(articleId))}
                className={`${btn} bg-alert-strong text-white border-alert-strong`}
              >
                Confirm
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className={`${btn} bg-paper text-ink-600 border-line-strong hover:border-ink`}
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(true)}
              className={`${btn} bg-paper text-alert-strong border-line-strong hover:border-alert-strong`}
            >
              Delete
            </button>
          ))}
      </div>

      {msg && (
        <span className={`mono text-[10px] ${msg.ok ? "text-up" : "text-alert-strong"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
