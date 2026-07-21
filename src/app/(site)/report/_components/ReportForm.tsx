"use client";

import { useActionState, useState, type ReactNode } from "react";
import { submitReport, type ReportState } from "@/actions/reports";
import { Button } from "@/components/ui";
import { SCAM_TYPES } from "@/lib/constants";

// v4 field recipe: 1px ink border · white · 13px/16px padding · 16px Geist · ink outline
const INPUT =
  "mt-2 w-full border border-ink bg-white px-4 py-[13px] text-[16px] text-ink placeholder:text-faint outline-ink";
const INPUT_MONO = `${INPUT} mono font-medium`;

type ScamType = (typeof SCAM_TYPES)[number];

const TYPE_META: Record<ScamType, { title: string; desc: string }> = {
  ponzi: { title: "Ponzi / yield program", desc: "Guaranteed returns, referral trees" },
  impersonation: { title: "Impersonation", desc: "Fake support, fake brands, deepfakes" },
  drainer: { title: "Wallet drainer", desc: "Malicious approvals, fake mints" },
  giveaway: { title: "Fake giveaway", desc: "Send one, get two back — never" },
  phishing: { title: "Phishing", desc: "Clone sites, fake airdrops" },
  "pig-butchering": { title: "Pig butchering", desc: "Long-con romance into trading apps" },
  "rug-pull": { title: "Rug pull", desc: "Token or NFT exit" },
  recovery: { title: "Recovery scam", desc: "“We'll get your funds back”" },
  other: { title: "Other", desc: "Everything else" },
};

const SEVERITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM"] as const;

// v4 chain select options — "Unknown" submits empty so the action stores null.
const CHAINS = ["Bitcoin", "Ethereum / EVM", "Solana", "TRON", "Multi-chain"] as const;

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="kicker text-meta block">{children}</span>;
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
  const [category, setCategory] = useState<ScamType>("other");
  const [severity, setSeverity] = useState<(typeof SEVERITY_OPTIONS)[number]>("MEDIUM");

  return (
    <form action={action} className="flex flex-col gap-[22px]">
      {/* Reporter status */}
      {loggedIn ? (
        <div className="border border-rule bg-surface-dim px-4 py-3">
          <span className="kicker text-meta">Filing as</span>
          <p className="mt-1 text-[16px] text-ink">
            <span className="font-bold">{userName ?? "Watchman"}</span>
            {userEmail && <span className="text-meta"> · {userEmail}</span>}
          </p>
          <p className="mt-0.5 text-[14px] text-meta">
            This report is attached to your desk so you can track the case.
          </p>
        </div>
      ) : (
        <div className="border border-rule bg-surface-dim px-4 py-3">
          <span className="kicker text-meta">Anonymous filing</span>
          <p className="mt-1 text-[16px] text-body-2">
            You are not signed in. Leave an email below so triage can follow up — it is never
            published.
          </p>
        </div>
      )}

      {state?.error && (
        <div
          role="alert"
          className="border border-danger bg-danger-soft text-danger-soft-fg px-4 py-3 font-bold text-[16px]"
        >
          {state.error}
        </div>
      )}

      {/* ── 01 · Category ── */}
      <section>
        <FieldLabel>What kind of scam is this?</FieldLabel>
        <input type="hidden" name="category" value={category} />
        <div
          className="mt-3 grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
        >
          {SCAM_TYPES.map((t) => {
            const active = category === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(t)}
                className={`text-left p-4 border cursor-pointer ${
                  active ? "border-ink bg-masthead" : "border-rule bg-white hover:bg-surface-dim"
                }`}
              >
                <span className="block font-display text-[18px] text-ink">
                  {TYPE_META[t].title}
                </span>
                <span className="block mt-1 text-[16px] text-meta">{TYPE_META[t].desc}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-[22px]">
          <FieldLabel>How severe, in your view?</FieldLabel>
        </div>
        <input type="hidden" name="severity" value={severity} />
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SEVERITY_OPTIONS.map((sv) => {
            const active = severity === sv;
            return (
              <button
                key={sv}
                type="button"
                aria-pressed={active}
                onClick={() => setSeverity(sv)}
                className={`px-3.5 py-2 font-sans font-bold text-[16px] tracking-[.05em] border cursor-pointer ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-white text-body-2 hover:bg-surface-alt"
                }`}
              >
                {sv}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 02 · Details ── */}
      <label className="block">
        <FieldLabel>Name of the scam / entity *</FieldLabel>
        <input
          name="scamName"
          required
          defaultValue={initialScamName}
          placeholder="e.g. QuantumYield AI"
          autoComplete="off"
          className={INPUT}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="block min-w-0" style={{ flex: "1 1 260px" }}>
          <FieldLabel>URL / handle</FieldLabel>
          <input
            name="url"
            inputMode="url"
            placeholder="domain.xyz · @handle"
            autoComplete="off"
            className={INPUT_MONO}
          />
        </label>
        <label className="block min-w-0" style={{ flex: "1 1 260px" }}>
          <FieldLabel>Chain</FieldLabel>
          <select
            name="chain"
            defaultValue=""
            className="mt-2 w-full border border-ink bg-white px-3 py-[13px] text-[16px] text-ink outline-ink"
          >
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="">Unknown</option>
          </select>
        </label>
      </div>

      <label className="block">
        <FieldLabel>Wallet address(es), if known</FieldLabel>
        <textarea
          name="walletAddresses"
          rows={2}
          placeholder={"bc1q… · 0x… — one per line"}
          className={`${INPUT_MONO} resize-y leading-[1.55]`}
        />
      </label>

      <label className="block sm:max-w-[260px]">
        <FieldLabel>Amount lost (USD)</FieldLabel>
        <input
          name="amountLostUsd"
          inputMode="decimal"
          placeholder="e.g. 12500"
          autoComplete="off"
          className={INPUT_MONO}
        />
      </label>

      <label className="block">
        <FieldLabel>What happened? *</FieldLabel>
        <textarea
          name="description"
          required
          minLength={20}
          rows={5}
          placeholder="Timeline, amounts, promises made, where you found them. Facts over feelings — moderators verify every line."
          className={`${INPUT} resize-y leading-[1.55]`}
        />
      </label>

      <label className="block">
        <FieldLabel>Evidence links</FieldLabel>
        <textarea
          name="evidenceUrls"
          rows={3}
          placeholder={"https://etherscan.io/tx/… · chat logs · screenshots — one per line"}
          className={`${INPUT_MONO} resize-y leading-[1.55]`}
        />
      </label>

      {/* ── 03 · Review & file ── */}
      {!loggedIn && (
        <label className="block">
          <FieldLabel>Contact email (for case updates) *</FieldLabel>
          <input
            name="reporterEmail"
            type="email"
            required
            placeholder="you@example.com — never published"
            autoComplete="email"
            inputMode="email"
            className={INPUT}
          />
        </label>
      )}

      <p className="text-[16px] leading-[1.6] text-meta">
        By submitting you confirm the report is truthful to your knowledge. False reports lower
        your trust score and may be removed.
      </p>

      <Button type="submit" variant="primary" size="lg" full disabled={pending}>
        {pending ? "Filing case…" : "Submit report"}
      </Button>
    </form>
  );
}
