import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, ButtonLink, Kicker } from "@/components/ui";
import { byline } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { StatusTag } from "../_components/StatusTag";
import { Prose } from "../_components/Prose";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const op = await prisma.stingOperation.findUnique({ where: { slug } });
  if (!op) return { title: "Operation not found — BTCSCAM.COM" };
  return {
    title: `${op.title} — Sting Operations · BTCSCAM.COM`,
    description: op.summary,
  };
}

export default async function StingOperationDetail({ params }: Params) {
  const { slug } = await params;
  const op = await prisma.stingOperation.findUnique({ where: { slug } });
  if (!op) notFound();

  return (
    <Container className="py-10 max-w-3xl">
      <Link href="/sting-operations" className="kicker text-btc-dark hover:text-ink">
        ← All operations
      </Link>

      <header className="border-b-2 border-ink pb-6 mb-8 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <StatusTag status={op.status} />
          <Kicker color="muted">Operation File</Kicker>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[0.9]">{op.title}</h1>
        <p className="mt-4 text-lg text-ink-600">{op.summary}</p>
        <div className="mt-4 mono text-[11px] uppercase tracking-wide text-ink-500">
          Filed {byline(op.createdAt)}
        </div>
      </header>

      {op.body ? (
        <Prose body={op.body} />
      ) : (
        <p className="text-ink-600">
          The full write-up for this operation has not been released yet. Check back once the
          evidence has been cleared for publication.
        </p>
      )}

      {/* Sidebar-style callout */}
      <aside className="mt-10 border border-line bg-paper-2 p-6">
        <Kicker color="orange">Spotted this operator?</Kicker>
        <p className="text-ink-600 mt-2">
          If you have first-hand evidence — screenshots, wallet addresses or scripts — send it to
          our investigators. Verified reports feed straight into the Scam Database.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/report" variant="primary" size="md">
            Report a scam
          </ButtonLink>
          <ButtonLink href="/consultation" variant="outline" size="md">
            Contact the team
          </ButtonLink>
        </div>
      </aside>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-8 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
