"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/actions/store";
import { CRYPTO_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui";

export function CheckoutForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, null);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-4 w-full border-b border-ink pb-2.5 kicker text-ink">
          Shipping details
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
        <legend className="mb-4 w-full border-b border-ink pb-2.5 kicker text-ink">
          Payment method
        </legend>
        <label className="block">
          <span className="kicker mb-1.5 block text-ink">Pay with</span>
          <select
            name="cryptoMethod"
            defaultValue="BTC"
            required
            className="w-full border border-ink bg-paper px-3.5 py-2.5 text-[16px] text-ink focus:outline-none"
          >
            {CRYPTO_METHODS.map((m) => (
              <option key={m.method} value={m.method}>
                {m.label} ({m.method}) — {m.network}
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-[14px] text-meta">
            You&apos;ll get the exact wallet address and QR code on the next screen.
          </span>
        </label>
      </fieldset>

      {state?.error && <p className="text-[14px] font-bold text-danger">{state.error}</p>}

      <Button type="submit" variant="primary" size="lg" full disabled={pending}>
        {pending ? "Placing order…" : "Place order & get payment address"}
      </Button>
      <p className="text-center text-[14px] text-meta">
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
      <span className="kicker mb-1.5 block text-ink">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className="w-full border border-ink bg-paper px-3.5 py-2.5 text-[16px] text-ink focus:outline-none"
      />
      {hint && <span className="mt-1.5 block text-[14px] text-meta">{hint}</span>}
    </label>
  );
}
