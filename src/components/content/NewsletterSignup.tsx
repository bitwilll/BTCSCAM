"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/actions/engagement";

export function NewsletterSignup({
  list = "rug-report",
  variant = "dark",
  cta = "Subscribe",
}: {
  list?: string;
  variant?: "dark" | "light";
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dark = variant === "dark";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await subscribeAction(email, list);
          setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Subscribed." : r.error ?? "Error" });
          if (r.ok) setEmail("");
        });
      }}
      className="w-full"
    >
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={`flex-1 px-3 py-3 text-sm border focus:outline-none ${
            dark ? "bg-white/10 border-white/25 text-paper placeholder:text-paper/40" : "bg-paper border-line text-ink"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="kicker bg-btc text-black px-5 hover:bg-btc-dark hover:text-white disabled:opacity-50"
        >
          {pending ? "…" : cta}
        </button>
      </div>
      {msg && (
        <p className={`mono text-[11px] mt-2 ${msg.ok ? "text-up" : "text-alert"}`}>{msg.text}</p>
      )}
    </form>
  );
}
