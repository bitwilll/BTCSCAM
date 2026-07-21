import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { canAny } from "@/lib/rbac";
import { PRIVILEGES, ROLE_LABELS } from "@/lib/constants";
import {
  Container,
  Kicker,
  SectionHeader,
  Tag,
  Avatar,
  ButtonLink,
  EmptyState,
} from "@/components/ui";
import { ArticleCard } from "@/components/content/cards";
import { byline, compactUsd, num, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Desk — BTCSCAM.COM",
  description: "Your saved intel, filed reports, orders, threads and consultation requests on BTCSCAM.COM.",
};

// ─── status → Tag tone maps ───
const REPORT_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline" | "paper"> = {
  pending: "outline",
  triaging: "orange",
  verified: "green",
  published: "black",
  rejected: "red",
  duplicate: "paper",
};

const ORDER_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline" | "paper"> = {
  pending_payment: "outline",
  paid: "orange",
  processing: "orange",
  shipped: "black",
  delivered: "green",
  cancelled: "red",
};

const CONSULT_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline" | "paper"> = {
  new: "orange",
  scheduled: "black",
  in_progress: "orange",
  closed: "outline",
};

const URGENCY_TONE: Record<string, "black" | "orange" | "red" | "green" | "outline" | "paper"> = {
  low: "paper",
  normal: "outline",
  high: "orange",
  critical: "red",
};

function pretty(s: string) {
  return s.replace(/_/g, " ").replace(/-/g, " ");
}

export default async function DeskPage() {
  const user = await requireUser("/desk");
  const isStaff = canAny(user, [PRIVILEGES.STAFF_ACCESS, PRIVILEGES.ADMIN_ACCESS]);

  const [saved, reports, orders, threads, consults] = await Promise.all([
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
  ]);

  return (
    <Container className="py-8 lg:py-10">
      {/* ── Identity header ── */}
      <header className="border-2 border-ink bg-paper-2 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={user.displayName} size={76} />
          <div className="flex-1 min-w-0">
            <Kicker color="orange">My Desk</Kicker>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mt-1">
              {user.displayName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Tag tone="black">{ROLE_LABELS[user.role]}</Tag>
              {user.title && (
                <span className="mono text-[11px] text-ink-600 uppercase tracking-wide">{user.title}</span>
              )}
              <span className="mono text-[11px] text-ink-400">·</span>
              <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">@{user.username}</span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
            <div className="sm:text-right">
              <div className="eyebrow">Reputation</div>
              <div className="font-display text-4xl text-btc-dark leading-none mt-0.5">{num(user.reputation)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/desk/profile" variant="outline" size="sm">
                Edit profile
              </ButtonLink>
              {isStaff && (
                <ButtonLink href="/staff" variant="dark" size="sm">
                  Go to Staff Console
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-12 space-y-14">
        {/* ── Saved articles ── */}
        <section>
          <SectionHeader
            title={`Saved Articles · ${num(saved.length)}`}
            action={{ label: "Browse the wire", href: "/" }}
          />
          {saved.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {saved.map((row) => (
                <ArticleCard key={row.id} article={row.article} saved compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing saved yet"
              hint="Tap Save on any story across the site and it will be pinned here for later."
              action={<ButtonLink href="/" variant="outline" size="sm">Read the front page</ButtonLink>}
            />
          )}
        </section>

        {/* ── Reports + Orders ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          <section>
            <SectionHeader
              title={`My Reports · ${num(reports.length)}`}
              action={{ label: "File a report", href: "/report" }}
            />
            {reports.length > 0 ? (
              <div>
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-4 py-3.5 border-b border-line last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate">{r.scamName}</div>
                      <div className="mono text-[11px] text-ink-500 uppercase tracking-wide capitalize mt-1">
                        {pretty(r.category)}
                        {r.chain ? ` · ${r.chain}` : ""}
                        {r.amountLostUsd != null ? ` · ${compactUsd(Number(r.amountLostUsd))} lost` : ""}
                        {" · "}
                        {byline(r.createdAt)}
                      </div>
                    </div>
                    <Tag tone={REPORT_TONE[r.status] ?? "outline"} className="shrink-0">
                      {pretty(r.status)}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No reports filed"
                hint="Spotted a scam? File it and the newsroom will triage the evidence."
                action={<ButtonLink href="/report" variant="primary" size="sm">Report a scam</ButtonLink>}
              />
            )}
          </section>

          <section>
            <SectionHeader
              title={`My Orders · ${num(orders.length)}`}
              action={{ label: "Visit the store", href: "/store" }}
            />
            {orders.length > 0 ? (
              <div>
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.orderNumber}`}
                    className="group flex items-center justify-between gap-4 py-3.5 border-b border-line last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="mono font-bold text-ink group-hover:text-btc-dark">{o.orderNumber}</div>
                      <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-1">
                        {num(o._count.items)} {o._count.items === 1 ? "item" : "items"} · {byline(o.createdAt)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-xl text-ink leading-none">{usd(o.totalUsd)}</div>
                      <div className="mt-1.5">
                        <Tag tone={ORDER_TONE[o.status] ?? "outline"}>{pretty(o.status)}</Tag>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                hint="Merch and print funds independent investigations. Crypto checkout only."
                action={<ButtonLink href="/store" variant="outline" size="sm">Browse the store</ButtonLink>}
              />
            )}
          </section>
        </div>

        {/* ── Threads + Consultations ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          <section>
            <SectionHeader
              title={`My Forum Threads · ${num(threads.length)}`}
              action={{ label: "Open the forum", href: "/forum" }}
            />
            {threads.length > 0 ? (
              <div>
                {threads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/forum/${t.slug}`}
                    className="group block py-3.5 border-b border-line last:border-0"
                  >
                    <div className="font-bold text-ink group-hover:text-btc-dark leading-snug">{t.title}</div>
                    <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-1">
                      {t.category.name} · {num(t.score)} pts · {num(t._count.comments)}{" "}
                      {t._count.comments === 1 ? "reply" : "replies"} · {byline(t.createdAt)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No threads started"
                hint="Share a sighting or ask the community — start your first thread."
                action={<ButtonLink href="/forum" variant="outline" size="sm">Go to the forum</ButtonLink>}
              />
            )}
          </section>

          <section>
            <SectionHeader
              title={`My Consultation Requests · ${num(consults.length)}`}
              action={{ label: "Request help", href: "/consultation" }}
            />
            {consults.length > 0 ? (
              <div>
                {consults.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-4 py-3.5 border-b border-line last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-ink capitalize">{pretty(c.topic)}</div>
                      <div className="mono text-[11px] text-ink-500 uppercase tracking-wide mt-1">
                        <Tag tone={URGENCY_TONE[c.urgency] ?? "outline"} className="mr-1.5 align-middle">
                          {c.urgency}
                        </Tag>
                        {c.amountUsd != null ? `${compactUsd(Number(c.amountUsd))} at stake · ` : ""}
                        {byline(c.createdAt)}
                      </div>
                    </div>
                    <Tag tone={CONSULT_TONE[c.status] ?? "outline"} className="shrink-0">
                      {pretty(c.status)}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No consultation requests"
                hint="Lost funds or need guidance? Request a confidential consultation with the team."
                action={<ButtonLink href="/consultation" variant="outline" size="sm">Request a consultation</ButtonLink>}
              />
            )}
          </section>
        </div>
      </div>

      <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-14 text-center">
        Consultation requests are matched to your account email · {user.email}
      </p>
    </Container>
  );
}
