"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TrackForm({
  defaultOrder = "",
  defaultEmail = "",
}: {
  defaultOrder?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState(defaultOrder);
  const [email, setEmail] = useState(defaultEmail);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams({
          order: order.trim(),
          email: email.trim(),
        });
        router.push(`/track?${params.toString()}`);
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Order number</span>
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
          placeholder="BTCS-XXXXXX"
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Email on the order</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
      </label>
      <button
        type="submit"
        className="kicker inline-flex w-full items-center justify-center gap-2 bg-btc px-6 py-3.5 text-sm text-black transition-colors hover:bg-btc-dark hover:text-white"
      >
        Track order
      </button>
    </form>
  );
}
