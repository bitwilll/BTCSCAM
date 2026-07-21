"use client";

import { useActionState, type ReactNode } from "react";
import { submitReport, type ReportState } from "@/actions/reports";
import { Button } from "@/components/ui";
import { SCAM_TYPES } from "@/lib/constants";

const INPUT_CLASS =
  "w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-ink";

function prettyType(t: string): string {
  return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="kicker text-ink-600 block mb-1.5">
      {label}
      {required && <span className="text-alert-strong"> *</span>}
    </span>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <span className="mono text-[10px] text-ink-400 mt-1 block">{children}</span>;
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  hint,
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "url" | "email" | "decimal" | "numeric";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={INPUT_CLASS}
      />
      {hint && <Hint>{hint}</Hint>}
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  rows = 4,
  placeholder,
  hint,
  minLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <textarea
        name={name}
        required={required}
        rows={rows}
        minLength={minLength}
        placeholder={placeholder}
        className={`${INPUT_CLASS} resize-y leading-relaxed`}
      />
      {hint && <Hint>{hint}</Hint>}
    </label>
  );
}

export function ReportForm({
  initialScamName = "",
  loggedIn = false,
  userName,
  userEmail,
}: {
  initialScamName?: string;
  loggedIn?: boolean;
  userName?: string;
  userEmail?: string;
}) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport, null);

  return (
    <form action={action} className="space-y-6">
      {/* Prominent disclaimer strip */}
      <div className="bg-ink text-paper px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="kicker text-btc">Not Financial Advice</span>
        <span className="mono text-[11px] uppercase tracking-wide text-paper/70">
          Your report helps the community
        </span>
      </div>

      {/* Reporter status */}
      {loggedIn ? (
        <div className="border-l-2 border-btc bg-paper-2 px-4 py-3">
          <p className="mono text-[11px] uppercase tracking-wide text-ink-500">Filing as</p>
          <p className="text-sm text-ink mt-0.5">
            <span className="font-bold">{userName ?? "Watchman"}</span>
            {userEmail && <span className="text-ink-500"> · {userEmail}</span>}
          </p>
          <p className="mono text-[10px] text-ink-400 mt-1">
            This report will be attached to your desk so you can track it.
          </p>
        </div>
      ) : (
        <div className="border-l-2 border-line-strong bg-paper-2 px-4 py-3">
          <p className="mono text-[11px] uppercase tracking-wide text-ink-500">Anonymous filing</p>
          <p className="text-sm text-ink-600 mt-0.5">
            You are not signed in. An email is required so our triage team can follow up.
          </p>
        </div>
      )}

      {/* Core details */}
      <div className="space-y-5">
        <TextField
          label="Scam name or project"
          name="scamName"
          required
          defaultValue={initialScamName}
          placeholder="e.g. QuantumYield AI"
          hint="The brand, app, token, website or handle used to run the scam."
          autoComplete="off"
        />

        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <FieldLabel label="Category" required />
            <select name="category" defaultValue="other" className={INPUT_CLASS}>
              {SCAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {prettyType(t)}
                </option>
              ))}
            </select>
            <Hint>What kind of scam best describes it?</Hint>
          </label>

          <TextField
            label="Chain"
            name="chain"
            placeholder="e.g. bitcoin, ethereum, tron"
            hint="Network the funds moved on, if known."
            autoComplete="off"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <TextField
            label="Amount lost (USD)"
            name="amountLostUsd"
            inputMode="decimal"
            placeholder="e.g. 12500"
            hint="Optional. Approximate US-dollar value."
            autoComplete="off"
          />
          <TextField
            label="Scam URL"
            name="url"
            type="text"
            inputMode="url"
            placeholder="https://…"
            hint="Optional. The site, app store, or social link."
            autoComplete="off"
          />
        </div>

        <TextArea
          label="Wallet addresses"
          name="walletAddresses"
          rows={3}
          placeholder={"bc1q…\n0xabc…"}
          hint="Optional. One per line, or separated by commas."
        />

        <TextArea
          label="What happened"
          name="description"
          required
          minLength={20}
          rows={6}
          placeholder="Walk us through it: how you were contacted, what was promised, what you were asked to do, and how the funds moved."
          hint="Required. At least 20 characters — the more detail, the faster we can verify."
        />

        <TextArea
          label="Evidence links"
          name="evidenceUrls"
          rows={3}
          placeholder={"https://twitter.com/…\nhttps://etherscan.io/tx/…"}
          hint="Optional. Screenshots, block-explorer links, chat logs. One per line or comma-separated."
        />

        {!loggedIn && (
          <TextField
            label="Your email"
            name="reporterEmail"
            type="email"
            required
            placeholder="you@example.com"
            hint="Required so we can follow up. Never shown publicly."
            autoComplete="email"
            inputMode="email"
          />
        )}
      </div>

      {state?.error && (
        <p className="mono text-[12px] text-alert-strong border-l-2 border-alert-strong pl-3 py-1">
          {state.error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? "Submitting Report…" : "Submit Report"}
        </Button>
        <p className="mono text-[10px] uppercase tracking-wide text-ink-400">
          Never share your seed phrase or private keys — we will never ask for them.
        </p>
      </div>
    </form>
  );
}
