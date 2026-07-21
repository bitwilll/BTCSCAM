import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Tag, EmptyState } from "@/components/ui";

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

/** "Jul 22" — short month + day for the v4 date block (Fraunces, sentence case). */
function dateBlock(d: Date): string {
  const date = new Date(d);
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}

function GatheringLine({ g, past = false }: { g: GatheringRow; past?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-y-4 gap-x-6 py-5 px-2 border-b border-rule ${
        past ? "opacity-60" : ""
      }`}
    >
      {/* Date block */}
      <div className="flex-none w-[88px] text-center border border-ink bg-white px-1.5 py-2.5">
        <div className="font-display text-[21px] leading-none">{dateBlock(g.startsAt)}</div>
      </div>
      {/* Title + meta */}
      <div className="min-w-0" style={{ flex: "1 1 300px" }}>
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="black">{g.isVirtual ? "Online" : "In person"}</Tag>
          <span className="eyebrow">{g.location}</span>
        </div>
        <div className="font-sans font-bold text-[18px] leading-[1.3] tracking-[-0.01em] mt-1.5">
          {g.title}
        </div>
      </div>
      {/* RSVP — v4-sanctioned brand-fill control */}
      {past ? (
        <Link
          href="/scamcast"
          className="flex-none kicker text-accent hover:underline underline-offset-4"
        >
          Recording in the feed →
        </Link>
      ) : (
        <Link
          href="/register"
          className="flex-none px-[18px] py-[11px] font-sans font-bold text-[16px] tracking-[.05em] uppercase bg-brand text-ink border border-ink hover:bg-ink hover:text-brand"
        >
          RSVP free
        </Link>
      )}
    </div>
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
    <div className="max-w-[1100px] mx-auto px-6 pt-9 pb-16 fade-up">
      <div className="kicker text-meta">BTC Scam gatherings · Online + in person</div>
      <h1
        className="font-display mt-2"
        style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
      >
        Gatherings
      </h1>
      <p className="mt-3 text-[18px] leading-[1.65] text-body-2 max-w-[62ch]">
        Every workshop, meetup and exercise we host. All free, all recorded — sessions land in the
        ScamCast feed a week later.
      </p>

      {/* ── Upcoming rows (v4) ── */}
      <div className="mt-6" style={{ borderTop: "3px solid var(--ink)" }}>
        {upcoming.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              title="No gatherings on the calendar"
              hint="Nothing scheduled right now. Want to change that? Pitch one in the forum — we'll help you promote it to the community."
              action={
                <Link href="/forum" className="kicker text-accent hover:underline underline-offset-4">
                  Pitch it in the forum →
                </Link>
              }
            />
          </div>
        ) : (
          upcoming.map((g) => <GatheringLine key={g.id} g={g} />)
        )}
      </div>

      {/* ── Recently (recordings) ── */}
      {past.length > 0 && (
        <>
          <div className="mt-9 flex items-center gap-[18px]">
            <span className="kicker">Recently</span>
            <div className="flex-1 border-t border-ink" />
          </div>
          <div>
            {past.map((g) => (
              <GatheringLine key={g.id} g={g} past />
            ))}
          </div>
        </>
      )}

      <p className="mt-5 text-[16px] leading-[1.6] text-meta">
        WANT A GATHERING IN YOUR CITY?{" "}
        <Link href="/forum" className="text-accent hover:underline underline-offset-4">
          PITCH IT IN THE FORUM
        </Link>{" "}
        — WE COVER VENUES FOR VERIFIED HOSTS. OR{" "}
        <a
          href="mailto:community@btcscam.com?subject=Host%20a%20gathering"
          className="text-accent hover:underline underline-offset-4"
        >
          EMAIL THE COMMUNITY TEAM
        </a>
        .
      </p>
    </div>
  );
}
