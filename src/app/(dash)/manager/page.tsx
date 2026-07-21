import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV, ROLE_LABELS, type Role } from "@/lib/constants";
import { ButtonLink, Kicker, SectionHeader, EmptyState } from "@/components/ui";
import { num, usd } from "@/lib/format";
import {
  OrderRow,
  ConsultationRow,
  type OrderQueueItem,
  type ConsultQueueItem,
} from "./_components/ConsoleRows";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manager Console · BTCSCAM Staff",
  description: "Operations overview — orders to fulfill, open consultations, donations, and community.",
};

export default async function ManagerConsolePage() {
  const user = await getSession();
  const now = new Date();

  const [
    ordersOpenCount,
    consultsOpenCount,
    donationAgg,
    activeProductCount,
    upcomingGatheringCount,
    orderRows,
    consultRows,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["pending_payment", "processing"] } } }),
    prisma.consultationRequest.count({ where: { status: { in: ["new", "in_progress"] } } }),
    prisma.donation.aggregate({
      where: { status: "pledged" },
      _count: true,
      _sum: { amountUsd: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.gathering.count({ where: { startsAt: { gte: now } } }),
    prisma.order.findMany({
      where: { status: { in: ["paid", "processing"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { items: true } } },
    }),
    prisma.consultationRequest.findMany({
      where: { status: { in: ["new", "scheduled", "in_progress"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const pledgedCount = donationAgg._count;
  const pledgedSum = donationAgg._sum.amountUsd ?? 0;

  const orders: OrderQueueItem[] = orderRows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    totalUsd: o.totalUsd,
    status: o.status,
    itemCount: o._count.items,
    createdAt: o.createdAt,
  }));

  const consults: ConsultQueueItem[] = consultRows.map((c) => ({
    id: c.id,
    name: c.name,
    topic: c.topic,
    urgency: c.urgency,
    status: c.status,
    amountUsd: c.amountUsd != null ? Number(c.amountUsd) : null,
    createdAt: c.createdAt,
  }));

  // Friendly heads-up if this staffer can view the console but lacks acting privileges.
  const gaps: string[] = [];
  if (!can(user, PV.ORDER_MANAGE)) gaps.push("fulfill orders");
  if (!can(user, PV.CONSULT_HANDLE)) gaps.push("handle consultations");
  if (!can(user, PV.STORE_MANAGE)) gaps.push("manage the store");

  const statTiles: { label: string; value: string; sub: string; tone?: "accent" | "red" }[] = [
    { label: "Orders open", value: num(ordersOpenCount), sub: "pending payment + processing", tone: "accent" },
    { label: "Consultations", value: num(consultsOpenCount), sub: "new + in progress", tone: "accent" },
    { label: "Pledged", value: num(pledgedCount), sub: `${usd(pledgedSum)} pledged` },
    { label: "Active products", value: num(activeProductCount), sub: "live in store" },
    { label: "Gatherings", value: num(upcomingGatheringCount), sub: "upcoming" },
  ];

  return (
    <div>
      {/* Header */}
      <header className="border-b border-ink pb-5 mb-8">
        <Kicker color="accent">Operations</Kicker>
        <h1 className="font-display text-ink mt-2" style={{ fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.1 }}>
          Manager console
        </h1>
        <p className="mt-2 text-[16px] leading-[1.6] text-body-2 max-w-2xl">
          Orders to fulfill, open consultations, and the pulse of donations, store, and community.
          Open a queue item to act on it in the admin workspace.
        </p>
        {user && (
          <p className="eyebrow mt-3">
            Signed in as {user.displayName} · {ROLE_LABELS[user.role as Role] ?? user.role}
          </p>
        )}
      </header>

      {gaps.length > 0 && (
        <div className="bg-warn text-warn-fg px-4 py-3 mb-8 text-[14px] uppercase tracking-[.05em]">
          <span className="font-bold">Heads up —</span> your account can view this console but
          cannot {gaps.join(", ")}. Those controls will be unavailable on the linked pages.
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statTiles.map((s) => (
          <div key={s.label} className="bg-white shadow-card p-4">
            <div className="kicker text-meta">{s.label}</div>
            <div className={`mono font-black text-[32px] mt-1 ${s.tone === "accent" ? "text-accent" : "text-ink"}`}>
              {s.value}
            </div>
            <div className="text-[14px] text-meta mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Queues */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-10">
        <section>
          <SectionHeader title="Orders To Fulfill" action={{ label: "Open Orders", href: "/admin/orders" }} />
          {orders.length > 0 ? (
            <div className="border border-ink bg-white">
              {orders.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No orders waiting"
              hint="Nothing is paid or in processing right now."
              action={<ButtonLink href="/admin/orders" variant="outline" size="sm">Manage Orders</ButtonLink>}
            />
          )}
        </section>

        <section>
          <SectionHeader title="Consultations" action={{ label: "Open Consultations", href: "/admin/consultations" }} />
          {consults.length > 0 ? (
            <div className="border border-ink bg-white">
              {consults.map((c) => (
                <ConsultationRow key={c.id} consult={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No open consultations"
              hint="No new, scheduled, or in-progress requests."
              action={<ButtonLink href="/admin/consultations" variant="outline" size="sm">Manage Consultations</ButtonLink>}
            />
          )}
        </section>
      </div>

      {/* Quick links */}
      <section className="mt-12">
        <SectionHeader title="Quick Links" />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/store" variant="ghost" size="sm">Store &amp; products</ButtonLink>
          <ButtonLink href="/admin/orders" variant="ghost" size="sm">Orders</ButtonLink>
          <ButtonLink href="/admin/donations" variant="ghost" size="sm">Donations</ButtonLink>
          <ButtonLink href="/admin/consultations" variant="ghost" size="sm">Consultations</ButtonLink>
          <ButtonLink href="/admin/community" variant="ghost" size="sm">Community</ButtonLink>
        </div>
      </section>
    </div>
  );
}
