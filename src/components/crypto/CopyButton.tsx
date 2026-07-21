"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="kicker inline-flex items-center gap-1 px-2 py-1 border border-line-strong hover:bg-ink hover:text-paper transition-colors"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
