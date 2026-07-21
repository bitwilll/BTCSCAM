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
    <div className="border border-rule bg-surface-dim p-4">
      <div className="eyebrow mb-1">Already sent payment?</div>
      <p className="mb-3 text-[16px] leading-[1.5] text-body-2">
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
        className="flex flex-col gap-2.5 sm:flex-row"
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
          className="mono min-w-0 flex-1 border border-ink bg-paper px-3.5 py-2.5 text-[14px] text-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || txHash.trim().length < 6}
          className="kicker inline-flex cursor-pointer items-center justify-center border border-ink bg-ink px-[18px] py-2.5 text-paper hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit hash"}
        </button>
      </form>
      {done && !err && (
        <div className="mt-3 inline-flex items-center gap-2 border border-safe px-3.5 py-2 kicker text-safe">
          ✓ Recorded — awaiting confirmation
        </div>
      )}
      {err && <p className="mt-2 text-[14px] font-bold text-danger">{err}</p>}
    </div>
  );
}
