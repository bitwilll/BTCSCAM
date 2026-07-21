"use client";

import { useActionState } from "react";
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

export function ConsultationForm() {
  const [state, action, pending] = useActionState<ServiceState, FormData>(requestConsultation, null);

  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="How should we address you?"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Track</span>
          <select
            name="topic"
            defaultValue="victim-support"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          >
            {CONSULT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {TOPIC_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Urgency</span>
          <select
            name="urgency"
            defaultValue="normal"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          >
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">What&apos;s going on?</span>
        <textarea
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={4000}
          placeholder="Tell us what happened, what platform was involved, and what you need help with. Do not include seed phrases, private keys, or passwords."
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink resize-y"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Wallet / platform involved (optional)</span>
          <input
            name="walletInvolved"
            placeholder="Exchange name, URL, or address"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Amount at stake in USD (optional)</span>
          <input
            name="amountUsd"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="12000"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </label>
      </div>

      {state && !state.ok && state.error && (
        <p className="mono text-[12px] text-alert">{state.error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" full disabled={pending}>
        {pending ? "Sending securely…" : "Request confidential help"}
      </Button>
      <p className="mono text-[10px] text-ink-400 leading-relaxed">
        Free &amp; confidential. We will <strong className="text-ink-600">never</strong> ask for your
        seed phrase, private keys, passwords, or remote access to your device. A volunteer replies by
        email — usually within 24 hours.
      </p>
    </form>
  );
}
