"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/actions/store";
import { CRYPTO_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui";

export function CheckoutForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, null);

  return (
    <form action={action} className="space-y-5">
      <fieldset className="space-y-4">
        <legend className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4 w-full">
          Shipping Details
        </legend>
        <Field label="Full name" name="name" autoComplete="name" />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          hint="We send order updates and payment confirmation here."
        />
        <Field label="Street address" name="address" autoComplete="street-address" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" autoComplete="address-level2" />
          <Field label="Postal / ZIP code" name="zip" autoComplete="postal-code" />
        </div>
        <Field label="Country" name="country" autoComplete="country-name" />
      </fieldset>

      <fieldset>
        <legend className="kicker text-sm !tracking-[0.16em] border-b border-line pb-2 mb-4 w-full">
          Payment Method
        </legend>
        <label className="block">
          <span className="kicker text-ink-600 block mb-1.5">Pay with</span>
          <select
            name="cryptoMethod"
            defaultValue="BTC"
            required
            className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          >
            {CRYPTO_METHODS.map((m) => (
              <option key={m.method} value={m.method}>
                {m.label} ({m.method}) — {m.network}
              </option>
            ))}
          </select>
          <span className="mono text-[10px] text-ink-400 mt-1 block">
            You&apos;ll get the exact wallet address and QR code on the next screen.
          </span>
        </label>
      </fieldset>

      {state?.error && <p className="mono text-[12px] text-alert-strong">{state.error}</p>}

      <Button type="submit" variant="primary" size="lg" full disabled={pending}>
        {pending ? "Placing order…" : "Place order & get payment address"}
      </Button>
      <p className="mono text-[11px] uppercase tracking-wide text-ink-500 text-center">
        No charge is taken now · You send crypto after the order is created
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="kicker text-ink-600 block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
      {hint && <span className="mono text-[10px] text-ink-400 mt-1 block">{hint}</span>}
    </label>
  );
}
