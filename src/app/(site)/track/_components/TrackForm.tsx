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
        <span className="kicker mb-1.5 block text-ink">Order number</span>
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
          placeholder="BTCS-XXXXXX"
          className="mono w-full border border-ink bg-paper px-3.5 py-2.5 text-[14px] text-ink focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="kicker mb-1.5 block text-ink">Email on the order</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-ink bg-paper px-3.5 py-2.5 text-[16px] text-ink focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="kicker inline-flex w-full cursor-pointer items-center justify-center border border-ink bg-ink px-6 py-3 text-paper hover:bg-action-hover"
      >
        Track order
      </button>
    </form>
  );
}
