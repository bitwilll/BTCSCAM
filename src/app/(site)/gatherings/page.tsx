import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, Tag, ButtonLink, EmptyState } from "@/components/ui";
import { dateline } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gatherings — BTCSCAM.COM",
  description:
    "Meetups, watch parties and workshops for the community of investigators tracking crypto scams — in person and virtual.",
};

type GatheringRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  isVirtual: boolean;
  startsAt: Date;
};

function EventCard({ g, faded = false }: { g: GatheringRow; faded?: boolean }) {
  return (
    <article
      className={`border border-line bg-paper-2 p-6 flex flex-col ${faded ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {g.isVirtual ? <Tag tone="orange">Virtual</Tag> : <Tag tone="black">In person</Tag>}
        <span className="mono text-[11px] uppercase tracking-wide text-ink-500">{g.location}</span>
      </div>
      <div className="eyebrow">{dateline(g.startsAt)}</div>
      <h3 className="font-display text-3xl text-ink leading-none mt-1">{g.title}</h3>
      <p className="mt-3 text-ink-600 flex-1">{g.description}</p>
    </article>
  );
}

export default async function GatheringsPage() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.gathering.findMany({ where: { startsAt: { gte: now } }, orderBy: { startsAt: "asc" } }),
    prisma.gathering.findMany({
      where: { startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <Container className="py-10">
      <PageHeader
        kicker="Community · Events"
        title="Gatherings"
        lede="Watch meetups, on-chain tracing workshops and victim-support circles. The people who expose scams for a living — and the people learning how — getting together in person and online."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="#host" variant="primary" size="md">
            Host a gathering
          </ButtonLink>
          <ButtonLink href="/consultation" variant="outline" size="md">
            Ask about an event
          </ButtonLink>
        </div>
      </PageHeader>

      {/* Upcoming */}
      <section className="mb-12">
        <SectionHeader title="Upcoming" />
        {upcoming.length === 0 ? (
          <EmptyState
            title="No gatherings on the calendar"
            hint="Nothing scheduled right now. Want to change that? Host one — we'll help you promote it to the community."
            action={<ButtonLink href="#host">Host a gathering</ButtonLink>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((g) => (
              <EventCard key={g.id} g={g} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Recently" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((g) => (
              <EventCard key={g.id} g={g} faded />
            ))}
          </div>
        </section>
      )}

      {/* Host a gathering CTA */}
      <div id="host" className="scroll-mt-24 bg-dark text-paper p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="kicker text-btc">Host a gathering</span>
            <h2 className="font-display text-4xl text-paper leading-none mt-3">
              Got a room, a bar, or a video call and ten people who are tired of getting drained?
            </h2>
            <p className="text-paper/70 mt-3 max-w-2xl">
              Meetups are grassroots. Tell us the where and the when — we&apos;ll list it here, send
              you a starter kit, and put it in front of the watchmen in your region.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <ButtonLink
              href="mailto:community@btcscam.com?subject=Host%20a%20gathering"
              variant="primary"
              size="lg"
            >
              Email the community team
            </ButtonLink>
            <Link
              href="/consultation"
              className="kicker text-paper/70 hover:text-btc text-center"
            >
              Or book a call →
            </Link>
          </div>
        </div>
      </div>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-6 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
