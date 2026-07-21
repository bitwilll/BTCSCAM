import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Container, PageHeader } from "@/components/ui";
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

  return (
    <Container className="py-12 max-w-2xl">
      <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-4">
        <Link href="/forum" className="text-btc-dark hover:text-ink">Forum</Link>
        <span className="mx-2">/</span>
        <span>New Thread</span>
      </div>

      <PageHeader
        kicker="Community Forum"
        title="Start a Thread"
        lede="Raise the alarm, request help, or crowdsource a trace. Keep it factual — the community verifies everything."
      />

      <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mb-6">
        Posting as <span className="text-ink-700 font-semibold">{user.displayName}</span>
      </p>

      <NewThreadForm categories={categories} />
    </Container>
  );
}
