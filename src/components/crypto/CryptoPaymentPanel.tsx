"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";

export type WalletView = {
  method: string;
  label: string;
  network: string;
  address: string;
  memo?: string | null;
  qrSvg: string;
};

export function CryptoPaymentPanel({ wallets }: { wallets: WalletView[] }) {
  const [active, setActive] = useState(wallets[0]?.method ?? "");
  const w = wallets.find((x) => x.method === active) ?? wallets[0];
  if (!w) return <p className="mono text-sm text-ink-500">No payment methods configured.</p>;

  return (
    <div className="border-2 border-ink bg-paper">
      {/* method tabs */}
      <div className="flex flex-wrap border-b border-line">
        {wallets.map((x) => (
          <button
            key={x.method}
            onClick={() => setActive(x.method)}
            className={`kicker px-3 py-2.5 border-r border-line ${
              x.method === active ? "bg-ink text-paper" : "bg-paper-2 text-ink-600 hover:bg-panel"
            }`}
          >
            {x.method}
          </button>
        ))}
      </div>

      <div className="p-5 grid sm:grid-cols-[160px_1fr] gap-5 items-start">
        <div
          className="w-[160px] h-[160px] bg-white border border-line p-2 mx-auto sm:mx-0 [&_svg]:w-full [&_svg]:h-full"
          dangerouslySetInnerHTML={{ __html: w.qrSvg }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-2xl text-ink">{w.label}</span>
            <span className="kicker text-ink-400">{w.method}</span>
          </div>
          <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-3">{w.network}</div>
          <div className="border border-line-strong bg-paper-2 p-3">
            <div className="mono text-[11px] text-ink-500 mb-1 uppercase tracking-wide">Send to address</div>
            <div className="font-mono text-sm break-all text-ink">{w.address}</div>
            {w.memo && (
              <div className="mt-2 mono text-[11px] text-alert">
                Destination tag / memo required: <span className="text-ink">{w.memo}</span>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <CopyButton value={w.address} label="Copy address" />
              {w.memo && <CopyButton value={w.memo} label="Copy memo" />}
            </div>
          </div>
          <p className="mono text-[11px] text-ink-500 mt-3 leading-relaxed">
            Send only <strong className="text-ink">{w.method}</strong> over{" "}
            <strong className="text-ink">{w.network}</strong>. Other assets/networks will be lost.
            After sending, record the transaction below so we can confirm it.
          </p>
        </div>
      </div>
    </div>
  );
}
