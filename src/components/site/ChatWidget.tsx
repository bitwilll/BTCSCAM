"use client";

import { useState } from "react";

// v4 live chat: round black FAB with green presence dot; panel titled LIVE WATCHDESK.
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "you" | "agent"; t: string }[]>([
    { from: "agent", t: "Watchdesk here. Question about a scam, a report, or your account?" },
  ]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { from: "you", t },
      {
        from: "agent",
        t: "Logged. A volunteer watchman will pick this up shortly. If funds just moved: stop contact, screenshot everything, and file at Report a Scam. Never share your seed phrase — not even with us.",
      },
    ]);
    setDraft("");
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Live chat with the watchdesk"
        className="fixed right-5 bottom-5 z-[290] w-14 h-14 rounded-full bg-ink border-0 text-paper flex items-center justify-center cursor-pointer shadow-[0_6px_20px_rgba(16,16,16,.3)] transition-transform hover:scale-106 hover:shadow-[0_10px_28px_rgba(16,16,16,.4)]"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            <span
              className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-up border-2 border-paper"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed right-5 bottom-24 z-[290] w-[min(370px,calc(100vw-40px))] bg-white border border-ink shadow-overlay flex flex-col fade-up-fast">
          <div className="bg-dark text-paper px-4 py-3 flex justify-between items-center gap-2.5">
            <span className="inline-flex items-center gap-[9px] font-sans font-bold text-[16px] tracking-[.05em]">
              <span className="w-[9px] h-[9px] bg-up blink-dot" />
              LIVE WATCHDESK
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="bg-transparent border border-body-2 text-paper font-sans font-bold text-[14px] px-2 py-0.5 cursor-pointer hover:border-paper"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-4 flex flex-col gap-2.5 bg-paper">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "you" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[85%] text-left px-3 py-2 text-[16px] leading-normal ${
                    m.from === "you" ? "bg-ink text-paper" : "bg-surface-alt text-ink"
                  }`}
                >
                  {m.t}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex gap-2 p-3 border-t-2 border-ink bg-white"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 min-w-0 border border-ink px-3 py-[11px] bg-paper text-[16px] outline-ink"
            />
            <button
              type="submit"
              className="px-4 py-[11px] font-sans font-bold text-[14px] bg-ink text-paper border border-ink cursor-pointer hover:bg-action-hover"
            >
              SEND
            </button>
          </form>
          <div className="px-3 py-2 bg-surface-dim border-t border-rule text-[14px] text-meta uppercase tracking-[.02em]">
            Volunteer watchmen · humans, not bots
          </div>
        </div>
      )}
    </>
  );
}
