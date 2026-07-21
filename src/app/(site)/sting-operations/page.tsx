import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, ButtonLink, EmptyState } from "@/components/ui";
import { byline } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { StatusTag } from "./_components/StatusTag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sting Operations — BTCSCAM.COM",
  description:
    "Community-run honeypots and undercover operations that document scam infrastructure and feed the Scam Database.",
};

const STEPS = [
  {
    n: "01",
    title: "Pose as a target",
    body: "Trained volunteers set up plausible victim personas and make first contact with an operator — never sending real funds.",
  },
  {
    n: "02",
    title: "Document everything",
    body: "Scripts, hand-off numbers, wallet addresses and payment flows are captured verbatim and time-stamped as evidence.",
  },
  {
    n: "03",
    title: "Feed the database",
    body: "Verified findings are published to the Scam Database, shared with exchanges and, where relevant, with law enforcement.",
  },
];

export default async function StingOperationsPage() {
  const operations = await prisma.stingOperation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeCount = operations.filter((o) => o.status === "active").length;

  return (
    <Container className="py-10">
      <PageHeader
        kicker="Community · Undercover"
        title="Sting Operations"
        lede="Sting operations are coordinated, volunteer-run investigations. Watchmen pose as victims to map the scripts, wallets and infrastructure behind active scams — then hand the evidence to the Scam Database and our partners."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/consultation" variant="primary" size="md">
            Volunteer for an op
          </ButtonLink>
          <ButtonLink href="/database" variant="outline" size="md">
            Open the Scam Database
          </ButtonLink>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
            {activeCount} active · {operations.length} total on file
          </span>
        </div>
      </PageHeader>

      {/* How a sting works */}
      <section className="mb-12">
        <SectionHeader title="How a Sting Works" />
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="border border-line bg-paper-2 p-6">
              <div className="font-display text-4xl text-btc-dark leading-none">{s.n}</div>
              <h3 className="font-extrabold text-ink mt-3">{s.title}</h3>
              <p className="text-sm text-ink-600 mt-2 leading-snug">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operations */}
      <section>
        <SectionHeader title="Operation Files" />
        {operations.length === 0 ? (
          <EmptyState
            title="No operations on file yet"
            hint="Active operations are published here once the evidence has been secured and cleared for release."
            action={<ButtonLink href="/consultation">Get involved</ButtonLink>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {operations.map((op) => (
              <article key={op.id} className="border border-line bg-paper-2 p-6 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <StatusTag status={op.status} />
                  <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
                    Filed {byline(op.createdAt)}
                  </span>
                </div>
                <h3 className="font-display text-3xl text-ink leading-none">
                  <Link href={`/sting-operations/${op.slug}`} className="hover:text-btc-dark">
                    {op.title}
                  </Link>
                </h3>
                <p className="mt-3 text-ink-600 flex-1">{op.summary}</p>
                <Link
                  href={`/sting-operations/${op.slug}`}
                  className="kicker text-btc-dark hover:text-ink mt-4"
                >
                  Open the operation file →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Ethics note */}
      <div className="mt-12 bg-dark text-paper p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="font-display text-3xl text-paper leading-none">
              Rules of engagement
            </h2>
            <p className="text-paper/70 mt-3 max-w-2xl">
              Operations are staff-coordinated. We do not entrap, we do not access systems we are
              not authorised to, and no volunteer ever sends real funds. We document — we do not
              retaliate. Everything we publish is verifiable.
            </p>
          </div>
          <ButtonLink href="/consultation" variant="primary" size="lg">
            Talk to the team
          </ButtonLink>
        </div>
      </div>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-6 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
