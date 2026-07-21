import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canAny } from "@/lib/rbac";
import { PRIVILEGES, ROLE_LABELS } from "@/lib/constants";
import { Container, Tag, Avatar, ButtonLink, EmptyState } from "@/components/ui";
import { ArticleRow } from "@/components/content/cards";
import { byline, compactUsd, dateline, num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Desk — BTCSCAM.COM",
  description: "Your saved intel, filed reports, orders, threads and consultation requests on BTCSCAM.COM.",
};

// ─── status → Tag tone maps (v4 chip tones) ───
const REPORT_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline" | "neutral"> = {
  pending: "outline",
  triaging: "warn",
  verified: "green",
  published: "black",
  rejected: "red",
  duplicate: "neutral",
};

const ORDER_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline" | "neutral"> = {
  pending_payment: "outline",
  paid: "warn",
  processing: "warn",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

const CONSULT_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline" | "neutral"> = {
  new: "warn",
  scheduled: "black",
  in_progress: "warn",
  closed: "neutral",
};

const URGENCY_TONE: Record<string, "black" | "warn" | "red" | "green" | "outline" | "neutral"> = {
  low: "neutral",
  normal: "outline",
  high: "warn",
  critical: "red",
};

function pretty(s: string) {
  return s.replace(/_/g, " ").replace(/-/g, " ");
}

// ─── Reputation tiers: RECRUIT → WATCHMAN → GUARDIAN → SENTINEL ───
const TIERS = [
  { name: "Recruit", min: 0 },
  { name: "Watchman", min: 100 },
  { name: "Guardian", min: 500 },
  { name: "Sentinel", min: 2000 },
] as const;

function tierInfo(rep: number) {
  let idx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (rep >= TIERS[i].min) {
      idx = i;
      break;
    }
  }
  const current = TIERS[idx];
  const next = idx + 1 < TIERS.length ? TIERS[idx + 1] : null;
  const pct = next
    ? Math.min(100, Math.round(((rep - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, pct };
}

const SECTIONS = [
  { id: "saved", label: "Saved" },
  { id: "reports", label: "Reports" },
  { id: "orders", label: "Orders" },
  { id: "threads", label: "Threads" },
  { id: "consultations", label: "Consultations" },
] as const;

export default async function DeskPage() {
  const user = await requireUser("/desk");
  const isStaff = canAny(user, [PRIVILEGES.STAFF_ACCESS, PRIVILEGES.ADMIN_ACCESS]);

  const [saved, reports, orders, threads, consults, record] = await Promise.all([
    prisma.savedArticle.findMany({
      where: { userId: user.id },
      include: { article: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.scamReport.findMany({
      where: { submittedById: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.forumThread.findMany({
      where: { authorId: user.id },
      include: { category: true, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultationRequest.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } }),
  ]);

  const { current, next, pct } = tierInfo(user.reputation);

  const stats = [
    { l: "Reports filed", v: num(reports.length) },
    { l: "Saved stories", v: num(saved.length) },
    { l: "Orders", v: num(orders.length) },
    { l: "Threads", v: num(threads.length) },
  ];

  return (
    <Container className="pt-8 pb-10 fade-up">
      {/* ── Identity card: avatar + name + TS + tier bar | stat grid (v4) ── */}
      <header className="border border-ink bg-white flex flex-wrap">
        <div className="min-w-0 p-[26px] flex gap-[18px] items-center" style={{ flex: "1.6 1 380px" }}>
          <Avatar name={user.displayName} size={76} />
          <div className="min-w-0">
            <h1 className="font-display text-[32px] leading-[1.15] text-ink">{user.displayName}</h1>
            <div className="mt-1 text-[16px] text-meta">
              {ROLE_LABELS[user.role]} · @{user.username}
              {record?.createdAt ? ` · Member since ${dateline(record.createdAt)}` : ""}
            </div>
            <div className="mt-2.5 flex gap-2.5 items-center flex-wrap">
              <span className="bg-safe text-white px-2.5 py-[3px] mono font-bold text-[16px]">
                TS {num(user.reputation)}
              </span>
              <span className="text-[14px] font-bold uppercase tracking-[.05em]">
                {TIERS.map((t, i) => (
                  <span key={t.name}>
                    {i > 0 && <span className="text-faint font-normal"> → </span>}
                    <span className={t.name === current.name ? "text-ink" : "text-faint"}>
                      {t.name}
                    </span>
                  </span>
                ))}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-2.5 h-2 bg-surface-alt border border-ink"
              style={{ width: "min(280px,100%)" }}
            >
              <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1.5 text-[14px] text-meta uppercase tracking-[.02em]">
              {next
                ? `${num(next.min - user.reputation)} points to ${next.name} — verify reports to climb`
                : "Top tier — the Watch salutes you"}
            </div>
            <div className="mt-3.5 flex gap-2 flex-wrap">
              <ButtonLink href="/desk/profile" variant="ghost" size="sm">
                Edit profile
              </ButtonLink>
              {isStaff && (
                <ButtonLink href="/staff" variant="primary" size="sm">
                  Staff console
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
        <div className="border-l border-rule grid grid-cols-2" style={{ flex: "1 1 320px" }}>
          {stats.map((s) => (
            <div key={s.l} className="px-5 py-[18px] border-b border-l border-rule">
              <div className="text-[16px] text-meta">{s.l}</div>
              <div className="mt-0.5 font-black text-[40px] leading-none text-ink">{s.v}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Section tabs: chip row of anchor links (v4 tabs) ── */}
      <nav className="mt-6 flex gap-1.5 flex-wrap" aria-label="Desk sections">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-4 py-2.5 text-[14px] font-bold uppercase tracking-[.05em] border border-ink text-ink hover:bg-ink hover:text-paper hover:no-underline"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* ── Saved articles ── */}
      <section id="saved" className="mt-6 border-t border-ink pt-5 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="kicker text-meta">Saved articles · {num(saved.length)}</h2>
          <Link href="/" className="kicker text-accent hover:underline underline-offset-4">
            Browse the wire →
          </Link>
        </div>
        {saved.length > 0 ? (
          <div className="mt-1">
            {saved.map((row) => (
              <ArticleRow key={row.id} article={row.article} showDek={false} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Nothing saved yet"
              hint="Hit Save on any story to keep it on your desk."
              action={
                <ButtonLink href="/" variant="ghost" size="sm">
                  Read the front page
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>

      {/* ── My reports ── */}
      <section id="reports" className="mt-10 border-t border-ink pt-5 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="kicker text-meta">My reports · {num(reports.length)}</h2>
          <Link href="/report" className="kicker text-accent hover:underline underline-offset-4">
            File a report →
          </Link>
        </div>
        {reports.length > 0 ? (
          <>
            <div className="mt-1">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex gap-x-[18px] gap-y-1.5 items-baseline py-4 px-2.5 border-b border-rule flex-wrap"
                >
                  <span className="flex-none text-[14px] font-bold uppercase tracking-[.05em] text-accent">
                    {pretty(r.category)}
                  </span>
                  <span className="font-display text-[18px] leading-[1.4] text-ink min-w-0 flex-1">
                    {r.scamName}
                  </span>
                  <Tag tone={REPORT_TONE[r.status] ?? "outline"}>{pretty(r.status)}</Tag>
                  <span className="flex-none text-[14px] text-meta uppercase tracking-[.02em]">
                    Filed {byline(r.createdAt)}
                    {r.chain ? ` · ${r.chain}` : ""}
                    {r.amountLostUsd != null
                      ? ` · ${compactUsd(Number(r.amountLostUsd))} lost`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-[18px]">
              <ButtonLink href="/report" variant="primary" size="md">
                + File a new report
              </ButtonLink>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No reports filed"
              hint="Spotted a scam? File it and the newsroom will triage the evidence."
              action={
                <ButtonLink href="/report" variant="primary" size="sm">
                  Report a scam
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>

      {/* ── My orders ── */}
      <section id="orders" className="mt-10 border-t border-ink pt-5 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="kicker text-meta">My orders · {num(orders.length)}</h2>
          <Link href="/store" className="kicker text-accent hover:underline underline-offset-4">
            Visit the store →
          </Link>
        </div>
        {orders.length > 0 ? (
          <div className="mt-1">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.orderNumber}`}
                className="flex gap-x-[18px] gap-y-1.5 items-baseline py-4 px-2.5 border-b border-rule flex-wrap hover:bg-surface-dim hover:no-underline group"
              >
                <span className="flex-none mono font-bold text-[16px] text-accent group-hover:underline underline-offset-4">
                  {o.orderNumber}
                </span>
                <span className="min-w-0 flex-1 text-[16px] text-body-2">
                  {num(o._count.items)} {o._count.items === 1 ? "item" : "items"}
                </span>
                <span className="flex-none mono font-bold text-[16px] text-ink">{usd(o.totalUsd)}</span>
                <Tag tone={ORDER_TONE[o.status] ?? "outline"}>{pretty(o.status)}</Tag>
                <span className="flex-none text-[14px] text-meta uppercase tracking-[.02em]">
                  {byline(o.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No orders yet"
              hint="Merch and print funds independent investigations. Crypto checkout only."
              action={
                <ButtonLink href="/store" variant="ghost" size="sm">
                  Browse the store
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>

      {/* ── My threads ── */}
      <section id="threads" className="mt-10 border-t border-ink pt-5 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="kicker text-meta">My threads · {num(threads.length)}</h2>
          <Link href="/forum" className="kicker text-accent hover:underline underline-offset-4">
            Open the forum →
          </Link>
        </div>
        {threads.length > 0 ? (
          <div className="mt-1">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/forum/${t.slug}`}
                className="flex gap-x-[18px] gap-y-1.5 items-baseline py-4 px-2.5 border-b border-rule flex-wrap hover:bg-surface-dim hover:no-underline group"
              >
                <span className="flex-none text-[14px] font-bold uppercase tracking-[.05em] text-accent">
                  {t.category.name}
                </span>
                <span className="font-display text-[18px] leading-[1.4] text-ink min-w-0 flex-1 group-hover:underline underline-offset-4 decoration-1">
                  {t.title}
                </span>
                <span className="flex-none text-[14px] text-meta uppercase tracking-[.02em]">
                  {num(t.score)} pts · {num(t._count.comments)}{" "}
                  {t._count.comments === 1 ? "reply" : "replies"} · {byline(t.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No threads started"
              hint="Share a sighting or ask the community — start your first thread."
              action={
                <ButtonLink href="/forum" variant="ghost" size="sm">
                  Go to the forum
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>

      {/* ── Consultations ── */}
      <section id="consultations" className="mt-10 border-t border-ink pt-5 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="kicker text-meta">Consultations · {num(consults.length)}</h2>
          <Link href="/consultation" className="kicker text-accent hover:underline underline-offset-4">
            Request help →
          </Link>
        </div>
        {consults.length > 0 ? (
          <div className="mt-1">
            {consults.map((c) => (
              <div
                key={c.id}
                className="flex gap-x-[18px] gap-y-1.5 items-baseline py-4 px-2.5 border-b border-rule flex-wrap"
              >
                <span className="font-display text-[18px] leading-[1.4] text-ink capitalize min-w-0 flex-1">
                  {pretty(c.topic)}
                </span>
                <Tag tone={URGENCY_TONE[c.urgency] ?? "outline"}>{c.urgency}</Tag>
                <Tag tone={CONSULT_TONE[c.status] ?? "outline"}>{pretty(c.status)}</Tag>
                <span className="flex-none text-[14px] text-meta uppercase tracking-[.02em]">
                  {c.amountUsd != null ? `${compactUsd(Number(c.amountUsd))} at stake · ` : ""}
                  {byline(c.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No consultation requests"
              hint="Lost funds or need guidance? Request a confidential consultation with the team."
              action={
                <ButtonLink href="/consultation" variant="ghost" size="sm">
                  Request a consultation
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>

      <p className="mt-14 text-center text-[14px] text-meta uppercase tracking-[.02em]">
        Consultation requests are matched to your account email · <span className="mono">{user.email}</span>
      </p>
    </Container>
  );
}
