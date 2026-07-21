"use client";

import { useState, useTransition } from "react";
import { updateWallet } from "@/actions/admin-users";

export function WalletForm({
  method,
  label,
  network,
  address,
  memo,
}: {
  method: string;
  label: string;
  network: string;
  address: string;
  memo: string | null;
}) {
  const [addr, setAddr] = useState(address);
  const [memoVal, setMemoVal] = useState(memo ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isPlaceholder = /PLACEHOLDER/i.test(addr);
  const dirty = addr !== address || memoVal !== (memo ?? "");
  const inputCls =
    "w-full px-3 py-2.5 text-sm border bg-paper text-ink focus:outline-none focus:border-ink font-mono";

  function save() {
    start(async () => {
      const r = await updateWallet(method, addr, memoVal);
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Saved." : r.error ?? "Error." });
    });
  }

  return (
    <div className={`border p-4 ${isPlaceholder ? "border-danger/40 bg-danger/5" : "border-rule bg-surface-dim"}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <span className="kicker text-ink">{method}</span>
          <span className="mono text-[11px] text-meta ml-2">{label} · {network}</span>
        </div>
        {isPlaceholder && (
          <span className="kicker inline-flex items-center px-2 py-[3px] leading-none bg-danger text-white">
            Placeholder
          </span>
        )}
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="eyebrow block mb-1">Receiving address</span>
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            className={`${inputCls} ${isPlaceholder ? "border-danger/50" : "border-rule"}`}
            aria-label={`${method} address`}
            spellCheck={false}
          />
        </label>
        <label className="block">
          <span className="eyebrow block mb-1">Memo / destination tag (optional)</span>
          <input
            value={memoVal}
            onChange={(e) => setMemoVal(e.target.value)}
            placeholder="XRP / Cosmos destination tag"
            className={`${inputCls} border-rule`}
            aria-label={`${method} memo`}
            spellCheck={false}
          />
        </label>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={save}
          className="kicker bg-ink text-paper px-5 py-2.5 hover:bg-action-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : "Save Address"}
        </button>
        {msg && (
          <span className={`mono text-[11px] ${msg.ok ? "text-safe" : "text-danger"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
