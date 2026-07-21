"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitTxHash } from "@/actions/store";

export function TxHashForm({
  orderNumber,
  existingTxHash,
}: {
  orderNumber: string;
  existingTxHash: string | null;
}) {
  const router = useRouter();
  const [txHash, setTxHash] = useState(existingTxHash ?? "");
  const [done, setDone] = useState(Boolean(existingTxHash));
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="border border-line-strong bg-paper-2 p-4">
      <div className="eyebrow mb-1">Already sent payment?</div>
      <p className="text-sm text-ink-600 leading-snug mb-3">
        Paste the transaction hash so a volunteer can confirm it on-chain and release your order.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setErr(null);
            const r = await submitTxHash(orderNumber, txHash.trim());
            if (r.ok) {
              setDone(true);
              router.refresh();
            } else {
              setErr(r.error ?? "Could not submit hash.");
            }
          });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label className="sr-only" htmlFor="txHash">
          Transaction hash
        </label>
        <input
          id="txHash"
          name="txHash"
          value={txHash}
          onChange={(e) => {
            setTxHash(e.target.value);
            setDone(false);
          }}
          placeholder="0x… or transaction id"
          className="min-w-0 flex-1 border border-line-strong bg-paper px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pending || txHash.trim().length < 6}
          className="kicker inline-flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-xs text-paper transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit hash"}
        </button>
      </form>
      {done && !err && <p className="kicker text-up mt-2">✓ Recorded — awaiting confirmation</p>}
      {err && <p className="mono text-[12px] text-alert-strong mt-2">{err}</p>}
    </div>
  );
}
