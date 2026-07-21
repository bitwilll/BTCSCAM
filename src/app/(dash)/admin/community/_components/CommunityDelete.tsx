"use client";

import { useState, useTransition } from "react";
import {
  deleteStingOp,
  deleteGathering,
  deleteScamArt,
  deleteMediaItem,
  type Result,
} from "@/actions/admin-ops";

export type CommunityKind = "sting" | "gathering" | "art" | "media";

const DISPATCH: Record<CommunityKind, (id: string) => Promise<Result>> = {
  sting: deleteStingOp,
  gathering: deleteGathering,
  art: deleteScamArt,
  media: deleteMediaItem,
};

export function CommunityDelete({ kind, id }: { kind: CommunityKind; id: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const remove = () =>
    start(async () => {
      setErr(null);
      const r = await DISPATCH[kind](id);
      if (!r.ok) {
        setErr(r.error ?? "Error");
        setConfirming(false);
      }
    });

  if (confirming) {
    return (
      <span className="inline-flex gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={remove}
          className="kicker px-2 py-1 border bg-danger text-white border-danger disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="kicker px-2 py-1 border bg-paper text-body-2 border-ink hover:border-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="kicker px-2 py-1 border bg-paper text-danger border-ink hover:border-danger disabled:opacity-50"
      >
        Delete
      </button>
      {err && <span className="mono text-[10px] text-danger">{err}</span>}
    </span>
  );
}
