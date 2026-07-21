"use client";

import { useState } from "react";

// v4 quiet button: 9px 14px · 700 14px caps · transparent, fills surface-alt on hover.
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable — leave the label unchanged
        }
      }}
      className={`px-3.5 py-[9px] font-sans font-bold text-[14px] tracking-[.05em] uppercase border border-transparent cursor-pointer ${
        copied ? "text-safe" : "text-body-2 hover:bg-surface-alt hover:text-ink"
      }`}
    >
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
