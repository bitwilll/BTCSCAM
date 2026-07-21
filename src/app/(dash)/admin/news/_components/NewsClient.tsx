"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  fetchNews,
  pushNewsItem,
  dismissNewsItem,
  restoreNewsItem,
  addSource,
  toggleSource,
  removeSource,
  seedDefaultSources,
  type NewsResult,
} from "@/actions/news";
import { useActionState } from "react";

export function FetchBar() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => start(async () => { const r = await fetchNews(); setMsg(r.message ?? r.error ?? ""); router.refresh(); })}
        disabled={pending}
        className="kicker bg-ink text-paper px-4 py-2.5 hover:bg-btc hover:text-black disabled:opacity-50"
      >
        {pending ? "Fetching…" : "⟳ Fetch latest news"}
      </button>
      <button
        onClick={() => start(async () => { const r = await seedDefaultSources(); setMsg(r.message ?? r.error ?? ""); router.refresh(); })}
        disabled={pending}
        className="kicker border border-line-strong px-4 py-2.5 hover:bg-panel disabled:opacity-50"
      >
        + Add default sources
      </button>
      {msg && <span className="mono text-[11px] text-ink-600">{msg}</span>}
    </div>
  );
}

export function ItemActions({ id, pushed }: { id: string; pushed: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const run = (fn: () => Promise<NewsResult>) =>
    start(async () => { const r = await fn(); setMsg(r.message ?? r.error ?? null); router.refresh(); });
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!pushed && (
        <button onClick={() => run(() => pushNewsItem(id))} disabled={pending} className="kicker bg-btc text-black px-3 py-1.5 hover:bg-btc-dark hover:text-white disabled:opacity-50">
          ↑ Push to draft
        </button>
      )}
      <button onClick={() => run(() => dismissNewsItem(id))} disabled={pending} className="kicker border border-line-strong px-3 py-1.5 hover:bg-panel disabled:opacity-50">
        Dismiss
      </button>
      {msg && <span className="mono text-[10px] text-ink-500">{msg}</span>}
    </div>
  );
}

export function RestoreButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button onClick={() => start(async () => { await restoreNewsItem(id); router.refresh(); })} disabled={pending} className="kicker border border-line-strong px-3 py-1.5 hover:bg-panel disabled:opacity-50">
      Restore
    </button>
  );
}

export function SourceForm() {
  const [state, action, pending] = useActionState<NewsResult, FormData>(async (_p, fd) => addSource(_p, fd), { ok: false });
  return (
    <form action={action} className="flex flex-wrap gap-2 items-end">
      <input name="name" placeholder="Source name" required className="border border-line-strong bg-paper px-3 py-2 text-sm w-40" />
      <input name="feedUrl" placeholder="https://…/rss" required className="border border-line-strong bg-paper px-3 py-2 text-sm w-64" />
      <input name="homepage" placeholder="Homepage (optional)" className="border border-line-strong bg-paper px-3 py-2 text-sm w-48" />
      <button type="submit" disabled={pending} className="kicker bg-ink text-paper px-4 py-2 hover:bg-btc hover:text-black disabled:opacity-50">Add source</button>
      {state?.error && <span className="mono text-[11px] text-alert">{state.error}</span>}
      {state?.message && <span className="mono text-[11px] text-up">{state.message}</span>}
    </form>
  );
}

export function SourceControls({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => start(async () => { await toggleSource(id); router.refresh(); })} disabled={pending} className={`kicker px-2 py-1 border ${active ? "border-up text-up" : "border-line-strong text-ink-500"}`}>
        {active ? "Active" : "Paused"}
      </button>
      <button onClick={() => start(async () => { await removeSource(id); router.refresh(); })} disabled={pending} className="kicker px-2 py-1 border border-line-strong text-ink-500 hover:text-alert hover:border-alert">
        Remove
      </button>
    </div>
  );
}
