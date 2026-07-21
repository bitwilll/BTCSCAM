"use client";

import { useActionState } from "react";
import { recordDonation, type ServiceState } from "@/actions/services";
import { Button } from "@/components/ui";
import { CRYPTO_METHODS } from "@/lib/constants";

export function DonationPledgeForm() {
  const [state, action, pending] = useActionState<ServiceState, FormData>(recordDonation, null);

  return (
    <form action={action} className="space-y-4">
      {state?.ok && (
        <div className="border border-up bg-up/10 px-3 py-2.5 mono text-[12px] text-ink">
          {state.message}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Text label="Name (optional)" name="donorName" autoComplete="name" placeholder="Satoshi N." />
        <Text
          label="Email (optional)"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          hint="Only used to send a receipt / confirm your gift."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Asset</span>
          <select
            name="cryptoMethod"
            defaultValue="BTC"
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          >
            {CRYPTO_METHODS.map((m) => (
              <option key={m.method} value={m.method}>
                {m.label} · {m.method}
              </option>
            ))}
          </select>
        </label>
        <Text
          label="Amount in USD (optional)"
          name="amountUsd"
          type="number"
          inputMode="decimal"
          placeholder="100"
          hint="Estimated value at time of sending."
        />
      </div>

      <Text
        label="Transaction hash (optional)"
        name="txHash"
        placeholder="0x… / bc1…"
        hint="Paste it here after you send and we'll confirm on-chain faster."
      />

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Message (optional)</span>
        <textarea
          name="message"
          rows={3}
          maxLength={500}
          placeholder="Keep exposing them."
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink resize-y"
        />
      </label>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          name="isAnonymous"
          className="mt-0.5 h-4 w-4 accent-[#f7931a] shrink-0"
        />
        <span className="text-sm text-ink-600">
          List me as <strong className="text-ink">Anonymous</strong> on the supporters wall.
        </span>
      </label>

      {state && !state.ok && state.error && (
        <p className="mono text-[12px] text-alert">{state.error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" full disabled={pending}>
        {pending ? "Recording…" : "Record my pledge"}
      </Button>
      <p className="mono text-[10px] text-ink-400 leading-relaxed">
        Crypto only — no card processor, no middleman. Recording a pledge does not move funds; send
        from your own wallet using the address above.
      </p>
    </form>
  );
}

function Text({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  return (
    <label className="block">
      <span className="kicker text-ink-600 block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
      {hint && <span className="mono text-[10px] text-ink-400 mt-1 block">{hint}</span>}
    </label>
  );
}
