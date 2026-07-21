import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ButtonLink, Kicker } from "@/components/ui";
import { byline } from "@/lib/format";
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
    <div className="max-w-[760px] mx-auto px-6 pt-10 pb-16 fade-up">
      <Link href="/sting-operations" className="kicker text-accent hover:underline underline-offset-4">
        ← All operations
      </Link>

      <header className="border-b border-ink pb-6 mb-8 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <StatusTag status={op.status} />
          <span className="mono font-semibold text-[14px] text-meta uppercase">
            OP {op.slug.replace(/-/g, " ")}
          </span>
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1, textWrap: "balance" }}
        >
          {op.title}
        </h1>
        <p className="mt-4 text-[18px] leading-[1.65] text-body-2" style={{ textWrap: "pretty" }}>
          {op.summary}
        </p>
        <div className="mt-4 text-[14px] text-meta uppercase tracking-[.02em]">
          Filed {byline(op.createdAt)}
        </div>
      </header>

      {op.body ? (
        <Prose body={op.body} />
      ) : (
        <p className="text-[16px] leading-[1.6] text-body-2">
          The full write-up for this operation has not been released yet. Check back once the
          evidence has been cleared for publication.
        </p>
      )}

      {/* Evidence callout */}
      <aside className="mt-10 border border-rule bg-surface-dim p-6">
        <Kicker color="accent">Spotted this operator?</Kicker>
        <p className="mt-2 text-[16px] leading-[1.6] text-body-2">
          If you have first-hand evidence — screenshots, wallet addresses or scripts — send it to
          our investigators. Verified reports feed straight into the Scam Database.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/report" variant="primary" size="md">
            Report a scam
          </ButtonLink>
          <ButtonLink href="/consultation" variant="ghost" size="md">
            Contact the team
          </ButtonLink>
        </div>
      </aside>

      <p className="mt-8 text-[14px] text-meta uppercase tracking-[.05em] text-center">
        Watch, don&apos;t touch · No real funds ever enter an op
      </p>
    </div>
  );
}
