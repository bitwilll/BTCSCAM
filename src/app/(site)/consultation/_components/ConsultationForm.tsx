"use client";

import { useActionState, useState } from "react";
import { requestConsultation, type ServiceState } from "@/actions/services";
import { Button } from "@/components/ui";
import { CONSULT_TOPICS } from "@/lib/constants";

const TOPIC_LABELS: Record<string, string> = {
  "victim-support": "Victim support — I was just scammed",
  "recovery-guidance": "Recovery guidance — tracing & reporting",
  "business-security": "Business security — protect a project/treasury",
  press: "Press & research inquiry",
  legal: "Legal orientation",
  other: "Something else",
};

const URGENCIES: { value: string; label: string }[] = [
  { value: "low", label: "Low — general question" },
  { value: "normal", label: "Normal — within a few days" },
  { value: "high", label: "High — this week" },
  { value: "critical", label: "Critical — funds moving right now" },
];

const PLANS = [
  {
    id: "FREE",
    name: "Community desk",
    price: "$0",
    desc: "Answer by email within 72h · handled by verified watchmen · thread published so others learn too",
  },
  {
    id: "PAID",
    name: "Expert session",
    price: "$149",
    desc: "60-min live video with a scam analyst · written teardown in 24h · fully private · proceeds fund the free desk",
  },
] as const;

const inputCls =
  "mt-2 w-full border border-ink bg-white px-4 py-[13px] font-sans text-[16px] outline-ink";

export function ConsultationForm() {
  const [state, action, pending] = useActionState<ServiceState, FormData>(requestConsultation, null);
  const [plan, setPlan] = useState<"FREE" | "PAID">("PAID");

  return (
    <form action={action}>
      {/* ── Plan cards (v4): border ink + masthead when active ── */}
      <div className="mt-6 flex flex-wrap gap-3.5">
        {PLANS.map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              aria-pressed={active}
              className={`min-w-0 flex-1 basis-[300px] cursor-pointer p-[22px] text-left border ${
                active ? "border-ink bg-masthead" : "border-rule bg-white"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2.5">
                <span className="font-sans font-bold text-[21px] uppercase">{p.name}</span>
                <span className="font-sans font-black text-[24px]">{p.price}</span>
              </div>
              <div className="mt-2 text-[16px] leading-[1.6] text-body-2">{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* ── Intake fields (v4-styled, wiring preserved) ── */}
      <div className="mt-[22px] flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="kicker text-meta">Your name *</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Name or handle"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="kicker text-meta">Email *</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="kicker text-meta">Track</span>
            <select name="topic" defaultValue="victim-support" className={inputCls}>
              {CONSULT_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {TOPIC_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="kicker text-meta">Urgency</span>
            <select name="urgency" defaultValue="normal" className={inputCls}>
              {URGENCIES.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="kicker text-meta">The project, the promise, and what worries you</span>
          <textarea
            name="message"
            rows={4}
            required
            minLength={10}
            maxLength={4000}
            placeholder="Links, the pitch you were given, yields promised, who approached you…"
            className={`${inputCls} leading-[1.55] resize-y`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="kicker text-meta">Wallet / platform involved (optional)</span>
            <input
              name="walletInvolved"
              placeholder="Exchange name, URL, or address"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="kicker text-meta">Amount at stake in USD (optional)</span>
            <input
              name="amountUsd"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="12000"
              className={inputCls}
            />
          </label>
        </div>
      </div>

      {state && !state.ok && state.error && (
        <p className="mt-4 text-[14px] font-bold text-danger">{state.error}</p>
      )}

      <div className="mt-[22px]">
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Sending securely…" : "Request consultation →"}
        </Button>
      </div>
      <p className="mt-3.5 text-[16px] text-meta">
        WE NEVER ASK FOR SEEDS, KEYS OR REMOTE ACCESS. ANYONE WHO DOES IS THE SCAM.
      </p>
    </form>
  );
}
