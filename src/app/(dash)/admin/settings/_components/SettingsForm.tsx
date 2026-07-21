"use client";

import { useState, useTransition } from "react";
import { updateSetting } from "@/actions/admin-users";

const THREATCON_LEVELS = ["GUARDED", "ELEVATED", "HIGH", "SEVERE", "CRITICAL"] as const;

function Row({
  label,
  hint,
  children,
  onSave,
  dirty,
  pending,
  msg,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
  onSave: () => void;
  dirty: boolean;
  pending: boolean;
  msg: { ok: boolean; text: string } | null;
}) {
  return (
    <div className="border border-rule bg-surface-dim p-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <label className="flex-1 min-w-0">
          <span className="eyebrow block mb-1">{label}</span>
          {children}
          <span className="mono text-[11px] text-meta mt-1 block">{hint}</span>
        </label>
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={onSave}
          className="kicker bg-ink text-paper px-5 py-2.5 hover:bg-action-hover disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {pending ? "…" : "Save"}
        </button>
      </div>
      {msg && (
        <p className={`mono text-[11px] mt-2 ${msg.ok ? "text-safe" : "text-danger"}`}>{msg.text}</p>
      )}
    </div>
  );
}

export function SettingsForm({
  threatcon,
  watchmen,
  todaysNumber,
}: {
  threatcon: string;
  watchmen: string;
  todaysNumber: string;
}) {
  const inputCls =
    "w-full px-3 py-2.5 text-sm border border-rule bg-paper text-ink focus:outline-none focus:border-ink";

  // threatcon
  const [tc, setTc] = useState(THREATCON_LEVELS.includes(threatcon as (typeof THREATCON_LEVELS)[number]) ? threatcon : "ELEVATED");
  const [tcPending, tcStart] = useTransition();
  const [tcMsg, setTcMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // watchmen
  const [wm, setWm] = useState(watchmen);
  const [wmPending, wmStart] = useTransition();
  const [wmMsg, setWmMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // todays number
  const [tn, setTn] = useState(todaysNumber);
  const [tnPending, tnStart] = useTransition();
  const [tnMsg, setTnMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function save(
    key: string,
    value: string,
    start: (cb: () => void) => void,
    setMsg: (m: { ok: boolean; text: string }) => void,
  ) {
    start(async () => {
      const r = await updateSetting(key, value);
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? "Saved." : r.error ?? "Error." });
    });
  }

  return (
    <div className="space-y-4">
      <Row
        label="Threatcon Level"
        hint="Shown site-wide (footer / alert strip)."
        dirty={tc !== threatcon}
        pending={tcPending}
        msg={tcMsg}
        onSave={() => save("threatcon", tc, tcStart, setTcMsg)}
      >
        <select value={tc} onChange={(e) => setTc(e.target.value)} className={inputCls} aria-label="Threatcon level">
          {THREATCON_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Row>

      <Row
        label="Watchmen On Duty"
        hint="Community counter shown in the dateline bar (integer)."
        dirty={wm !== watchmen}
        pending={wmPending}
        msg={wmMsg}
        onSave={() => save("watchmen", wm, wmStart, setWmMsg)}
      >
        <input
          value={wm}
          onChange={(e) => setWm(e.target.value)}
          inputMode="numeric"
          className={inputCls}
          aria-label="Watchmen on duty"
        />
      </Row>

      <Row
        label="Today's Number"
        hint='Headline "at risk" figure on the front page, e.g. "$43.2M".'
        dirty={tn !== todaysNumber}
        pending={tnPending}
        msg={tnMsg}
        onSave={() => save("todays_number", tn, tnStart, setTnMsg)}
      >
        <input value={tn} onChange={(e) => setTn(e.target.value)} className={inputCls} aria-label="Today's number" />
      </Row>
    </div>
  );
}
