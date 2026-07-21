"use client";

import { useState } from "react";

const CANNED = [
  "How do I report a scam?",
  "Is this address flagged?",
  "I think I've been scammed — help",
  "How does verification work?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "you" | "watch"; text: string }[]>([
    {
      from: "watch",
      text: "Community Watch here. This is a demo help desk — describe what you're seeing and we'll point you to the right resource. Never share seed phrases or private keys with anyone.",
    },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { from: "you", text: t },
      {
        from: "watch",
        text: "Thanks — a volunteer will follow up. Meanwhile: file details at /report, and search the Scam Database at /database. If funds just moved, act fast and document everything.",
      },
    ]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 bg-ink text-btc border-2 border-btc w-14 h-14 flex items-center justify-center kicker hover:bg-btc hover:text-black transition-colors shadow-lg"
        aria-label="Open community chat"
      >
        {open ? "✕" : "CHAT"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm bg-paper border-2 border-ink shadow-2xl flex flex-col max-h-[70vh]">
          <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
            <span className="kicker text-btc">COMMUNITY WATCH · LIVE</span>
            <span className="mono text-[10px] text-ink-400">DEMO</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-paper-2">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "you" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 text-sm ${
                    m.from === "you" ? "bg-btc text-black" : "bg-paper border border-line text-ink-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-line flex flex-wrap gap-1">
            {CANNED.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="mono text-[10px] px-2 py-1 border border-line hover:bg-panel text-ink-600"
              >
                {c}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-2 border-t border-line flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 border border-line px-3 py-2 text-sm bg-paper focus:outline-none"
            />
            <button type="submit" className="kicker bg-ink text-paper px-3 hover:bg-btc hover:text-black">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
