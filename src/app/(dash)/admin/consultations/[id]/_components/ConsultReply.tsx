"use client";

import { useRef, useState, useTransition } from "react";
import { replyConsult, type Result } from "@/actions/admin-ops";

export function ConsultReply({ requestId }: { requestId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const body = ref.current?.value ?? "";
    start(async () => {
      setMsg(null);
      const r: Result = await replyConsult(requestId, body);
      if (r.ok) {
        if (ref.current) ref.current.value = "";
        setMsg({ ok: true, text: "Reply sent." });
      } else {
        setMsg({ ok: false, text: r.error ?? "Error" });
      }
    });
  };

  return (
    <div>
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Staff reply</span>
        <textarea
          ref={ref}
          rows={4}
          disabled={pending}
          placeholder="Write a reply to the requester…"
          aria-label="Staff reply"
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink disabled:opacity-50"
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="kicker inline-flex items-center justify-center gap-2 bg-btc text-black hover:bg-btc-dark hover:text-white px-4 py-2.5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Sending…" : "Send Reply"}
        </button>
        {msg && (
          <span className={`mono text-[11px] ${msg.ok ? "text-up" : "text-alert-strong"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
