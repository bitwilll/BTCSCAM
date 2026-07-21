import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, Avatar, ButtonLink } from "@/components/ui";
import { roleRank } from "@/lib/rbac";
import { ROLE_LABELS, SITE, type Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — BTCSCAM.COM",
  description:
    "Who we are, how we verify scam intelligence, and why editorial independence matters. Community-verified scam intelligence — not financial advice.",
};

const VERIFY_STEPS = [
  {
    n: "01",
    title: "Intake",
    body: "Signals arrive from victims, watchmen on patrol, sting operations and exchange partners. Everything is logged — nothing is published on a single word.",
  },
  {
    n: "02",
    title: "Corroborate",
    body: "An entry needs at least two independent signals: on-chain evidence, matching victim testimony, or a reproduction of the scam under controlled conditions.",
  },
  {
    n: "03",
    title: "Community verify",
    body: "Members verify entries in the open. Verification counts are public, disputes are recorded, and anyone can challenge a claim with evidence.",
  },
  {
    n: "04",
    title: "Publish & revise",
    body: "Verified entries go live in the Scam Database and are updated as the operator moves wallets, rebrands or resurfaces. Corrections are never silent.",
  },
];

export default async function AboutPage() {
  const team = await prisma.user.findMany({
    where: {
      role: { in: ["editor", "manager", "admin", "copywriter"] },
      isActive: true,
      isBanned: false,
    },
    select: { id: true, displayName: true, title: true, role: true, bio: true },
  });

  const sortedTeam = [...team].sort(
    (a, b) => roleRank(b.role) - roleRank(a.role) || a.displayName.localeCompare(b.displayName),
  );

  return (
    <Container className="py-10">
      <PageHeader
        kicker="About BTCSCAM.COM"
        title="We Document the Scam So You Don't Fund It"
        lede="BTCSCAM.COM is a community-verified scam-intelligence newsroom. We investigate crypto fraud, verify reports in the open, and publish what we find — so the next person recognises the trap before the money is gone."
      />

      {/* Mission strip */}
      <div className="bg-ink text-paper py-8 px-6 text-center -mx-4 sm:-mx-6 mb-12">
        <div className="eyebrow text-ink-400 mb-2">Our mission</div>
        <p className="font-display text-3xl sm:text-5xl text-btc leading-none">{SITE.mission}</p>
      </div>

      {/* How verification works */}
      <section className="mb-14">
        <SectionHeader title="How Verification Works" />
        <p className="text-ink-600 max-w-2xl mb-6">
          &ldquo;Community-verified&rdquo; is not a slogan — it is a process. An accusation is not a
          finding. Here is the path every entry takes before it earns a place in the database.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VERIFY_STEPS.map((s) => (
            <div key={s.n} className="border border-line bg-paper-2 p-6">
              <div className="font-display text-4xl text-btc-dark leading-none">{s.n}</div>
              <h3 className="font-extrabold text-ink mt-3">{s.title}</h3>
              <p className="text-sm text-ink-600 mt-2 leading-snug">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial independence */}
      <section className="mb-14">
        <SectionHeader title="Editorial Independence" />
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="prose-bs">
            <p>
              We take <strong>crypto only</strong> — donations, store sales and reader support — and
              we take it transparently. We do not run &ldquo;sponsored&rdquo; threat assessments, we
              do not sell placement in the Scam Database, and we do not accept payment to remove an
              entry. There is no button an operator can press to make a verified finding disappear.
            </p>
            <p>
              Recovery agents who promise to claw back stolen funds for an up-front fee are, in our
              experience, a second scam aimed at people already hurting. We name them like any other
              operator. Coverage is not for sale — not to them, not to anyone.
            </p>
          </div>
          <div className="border-2 border-ink bg-paper-2 p-6">
            <div className="kicker text-btc-dark mb-3">What that means in practice</div>
            <ul className="space-y-3 text-ink-700">
              <li className="border-b border-line pb-3">No paid removals. No paid rankings.</li>
              <li className="border-b border-line pb-3">
                Every claim traces to evidence a reader can check.
              </li>
              <li className="border-b border-line pb-3">
                Corrections are published, not quietly edited away.
              </li>
              <li>We are not licensed advisers. We report; you decide.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-14">
        <SectionHeader title="The Newsroom" />
        {sortedTeam.length === 0 ? (
          <p className="text-ink-600">The masthead is being assembled.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {sortedTeam.map((member) => (
              <div key={member.id} className="flex gap-4 border-b border-line pb-6">
                <Avatar name={member.displayName} size={52} />
                <div className="min-w-0">
                  <div className="font-extrabold text-ink leading-tight">{member.displayName}</div>
                  {member.title && (
                    <div className="text-sm text-ink-600 mt-0.5">{member.title}</div>
                  )}
                  <div className="mono text-[10px] uppercase tracking-wide text-btc-dark mt-1.5">
                    {ROLE_LABELS[member.role as Role] ?? member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* For Satoshi */}
      <section id="for-satoshi" className="scroll-mt-24 mb-14">
        <div className="bg-dark text-paper p-8 sm:p-10">
          <span className="kicker text-btc">For Satoshi</span>
          <h2 className="font-display text-4xl sm:text-5xl text-paper leading-none mt-3 max-w-3xl">
            The name on the door is a promise we made to someone who trusted the wrong voice.
          </h2>
          <div className="mt-5 grid md:grid-cols-2 gap-6 text-paper/75 max-w-4xl">
            <p>
              Bitcoin was meant to let strangers trust each other without a middleman taking a cut.
              Predators turned that same openness into a hunting ground. We named this project{" "}
              <span className="text-paper font-semibold">For Satoshi</span> for both: the ideal
              worth defending, and the people it was supposed to protect.
            </p>
            <p>
              Satoshi is every reader who sent &ldquo;just to test it,&rdquo; every grandparent
              talked through a fake recovery, every trader who thought they were early. We are making
              a documentary so their stories reach the people about to make the same call — and so
              the operators can be seen in full daylight.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ButtonLink href="/film-fundraiser" variant="primary" size="lg">
              Back the film
            </ButtonLink>
            <Link href="/film-fundraiser" className="kicker text-paper/70 hover:text-btc">
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-6">
        <SectionHeader title="Get In Touch" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ContactCard
            label="Been scammed?"
            body="Talk to our victim-support team, in confidence."
            href="/consultation"
            cta="Request a consultation"
          />
          <ContactCard
            label="Spotted a scam"
            body="File a report — it feeds the database within hours."
            href="/report"
            cta="Report a scam"
          />
          <ContactCard
            label="Press & partners"
            body="Journalists, exchanges and researchers, reach the desk."
            href="mailto:press@btcscam.com?subject=Press%20enquiry"
            cta="Email the press desk"
          />
          <ContactCard
            label="Join the watch"
            body="Trade notes with other investigators in the forum."
            href="/forum"
            cta="Open the forum"
          />
        </div>
      </section>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-8 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}

function ContactCard({
  label,
  body,
  href,
  cta,
}: {
  label: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border border-line bg-paper-2 p-5 flex flex-col">
      <div className="kicker text-btc-dark">{label}</div>
      <p className="text-sm text-ink-600 mt-2 flex-1">{body}</p>
      <Link href={href} className="kicker text-ink hover:text-btc-dark mt-3">
        {cta} →
      </Link>
    </div>
  );
}
