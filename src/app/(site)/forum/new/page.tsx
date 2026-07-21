import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { trustScore } from "../_components/trust";
import { NewThreadForm } from "./_components/NewThreadForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Thread · Forum · BTCSCAM.COM",
  description: "Start a new forum thread — post a scam sighting, ask for help, or open an investigation.",
};

export default async function NewThreadPage() {
  const user = await requireUser("/forum/new");
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
  const ts = trustScore(user.reputation);

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-8 pb-16 fade-up">
      {/* ── breadcrumb (v4) ── */}
      <div className="text-[14px] text-meta tracking-[.05em]">
        <Link href="/forum" className="text-ink font-bold hover:underline underline-offset-4">
          ← ALL THREADS
        </Link>{" "}
        / New thread
      </div>

      <div className="mt-4 min-w-0">
        <div className="kicker text-meta">Community watch</div>
        <h1
          className="font-display text-ink mt-1.5"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
        >
          Start a thread
        </h1>
        <p className="mt-2.5 text-[18px] leading-[1.65] text-body-2 max-w-[60ch]">
          Raise the alarm, request help, or crowdsource a trace. Keep it factual — the forum
          verifies everything.
        </p>
      </div>

      {/* ── composer card (v4) ── */}
      <div className="mt-5 bg-white shadow-card p-5">
        <div className="kicker text-meta">
          New thread — posting as {user.displayName} · TS {ts}
        </div>
        <NewThreadForm categories={categories} />
      </div>
    </div>
  );
}
