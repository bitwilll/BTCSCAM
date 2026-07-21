import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, SeverityTag, ButtonLink, EmptyState } from "@/components/ui";
import { num, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crypto Scam Alerts — BTCSCAM.COM",
  description:
    "Live warnings on active crypto scams as they are sighted: frozen ponzis, trojanized wallet apps, drainer kits, address-poisoning waves and deepfake giveaways.",
};

type AlertRow = {
  id: string;
  severity: string;
  title: string;
  body: string | null;
  chain: string | null;
  createdAt: Date;
};

// v4 urgency bands: dot color + how-to-act note
const SEVERITY_GROUPS: { key: string; label: string; dot: string; note: string }[] = [
  { key: "critical", label: "Critical", dot: "#D2322E", note: "— do not interact, warn others" },
  { key: "high", label: "High", dot: "#E0574F", note: "— assume compromised until verified" },
  { key: "elevated", label: "Elevated", dot: "#C9A227", note: "— verify before touching" },
];

// v4 "WHERE IT'S HITTING" regions data (design-source lines ~2235)
const REGIONS: [string, number][] = [
  ["NORTH AMERICA", 42],
  ["EUROPE", 38],
  ["SE ASIA", 33],
  ["LATAM", 21],
  ["AFRICA", 9],
  ["OCEANIA", 6],
];
const REGION_MAX = 42;

function AlertItem({ alert }: { alert: AlertRow }) {
  return (
    <Link
      href="/database"
      className="flex gap-3.5 px-2 py-3.5 border-b border-rule items-start flex-wrap bg-white transition-colors hover:bg-surface-dim hover:no-underline"
    >
      <span className="flex-none min-w-[84px] text-center">
        <SeverityTag severity={alert.severity} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[18px] leading-[1.4] text-ink">{alert.title}</div>
        <div className="mt-1 text-[14px] text-meta">
          {(alert.chain ?? "Global").toUpperCase()} · {timeAgo(alert.createdAt)}
        </div>
        {alert.body && (
          <p className="mt-1.5 text-[14px] leading-[1.5] text-body-2 max-w-[64ch]">{alert.body}</p>
        )}
      </div>
      <span className="flex-none kicker text-accent">Dossier →</span>
    </Link>
  );
}

export default async function AlertsPage() {
  const [alerts, threatconSetting] = await Promise.all([
    prisma.alert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findUnique({ where: { key: "threatcon" } }),
  ]);

  const threatcon = threatconSetting?.value ?? "ELEVATED";
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const updated = alerts[0] ? timeAgo(alerts[0].createdAt).toUpperCase() : "—";
  const grouped = SEVERITY_GROUPS.map((g) => ({
    ...g,
    items: alerts.filter((a) => a.severity === g.key),
  })).filter((g) => g.items.length > 0);

  return (
    <Container wide className="pt-9 pb-14 fade-up">
      {/* ── Watchdesk masthead (v4) ── */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="kicker text-meta flex items-center gap-[9px]">
            <span className="w-2 h-2 rounded-full bg-danger blink-dot" aria-hidden="true" />
            Live · Watchdesk
          </div>
          <h1 className="mt-2 font-display text-[32px] leading-[1.15] text-ink">Scam Alerts</h1>
          <p className="mt-2.5 text-[16px] leading-[1.6] text-body-2 max-w-[58ch]">
            Active incidents and unsafe practices, grouped by how urgently you should act.
          </p>
        </div>
        <div className="text-right mono font-medium text-[14px] text-meta uppercase">
          Updated
          <br />
          <span className="text-ink font-semibold">{updated}</span>
        </div>
      </div>

      {/* ── Threatcon strip (dark, ticker text) ── */}
      <div className="mt-6 bg-dark text-ticker px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="kicker text-paper flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger blink-dot inline-block" aria-hidden="true" />
          Dangerous right now · <span className="mono">{num(criticalCount)}</span>
        </span>
        <span className="kicker text-ticker">
          Threatcon: <span className="mono">{threatcon}</span>
        </span>
        <span className="kicker text-ticker">
          <span className="mono">{num(alerts.length)}</span> active alerts
        </span>
        <span className="ml-auto hidden sm:inline text-[14px] uppercase tracking-[.05em] text-faint">
          {SITE.disclaimer}
        </span>
      </div>

      <div className="mt-[30px] flex flex-wrap gap-8">
        {/* ── Alert bands ── */}
        <div className="min-w-0" style={{ flex: "1.8 1 480px" }}>
          <div className="flex justify-between gap-2.5 border-b-[3px] border-ink pb-2.5 flex-wrap items-baseline">
            <h2 className="font-display text-[24px] text-ink">Active alerts</h2>
            <span className="text-[16px] text-meta">UNSAFE PRACTICES · DO-NOT-SEND LIST</span>
          </div>

          {alerts.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No active alerts right now"
                hint="The wire is quiet. Check the scam database for tracked entries, or file a report if you have spotted something new."
                action={
                  <div className="flex gap-2">
                    <ButtonLink href="/database" variant="ghost" size="md">
                      Open Scam Database
                    </ButtonLink>
                    <ButtonLink href="/report" variant="primary" size="md">
                      Report a Scam
                    </ButtonLink>
                  </div>
                }
              />
            </div>
          ) : (
            grouped.map((group) => (
              <section key={group.key}>
                <div className="mt-[26px] flex items-baseline gap-2.5 flex-wrap">
                  <span
                    className="w-2 h-2 flex-none self-center"
                    style={{ background: group.dot }}
                    aria-hidden="true"
                  />
                  <span className="kicker text-ink">{group.label}</span>
                  <span className="text-[14px] text-meta">{group.note}</span>
                </div>
                {group.items.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </section>
            ))
          )}
        </div>

        {/* ── Where it's hitting (v4 regions) ── */}
        <aside className="min-w-0" style={{ flex: "1 1 320px" }}>
          <div className="bg-white shadow-card px-[18px] pt-[18px] pb-5">
            <div className="kicker text-meta">Where it&apos;s hitting · 30 days</div>
            <div className="mt-3 aspect-[16/9] hatch flex items-center justify-center">
              <span className="text-[16px] text-meta text-center px-3">
                [ map: incident heat by region ]
              </span>
            </div>
            <div className="flex flex-col gap-2.5 mt-3.5">
              {REGIONS.map(([region, n]) => (
                <div key={region}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[16px] text-body-2">{region}</span>
                    <span className="mono font-semibold text-[14px] text-body-2">{n}</span>
                  </div>
                  <div className="mt-1 h-[5px] bg-surface-dim" aria-hidden="true">
                    <div
                      className="h-full bg-faint"
                      style={{ width: `${Math.round((100 * n) / REGION_MAX)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Community jury trailhead (v4) ── */}
      <div className="mt-11 border-t border-rule pt-3.5 text-[16px] text-body-2">
        Not in the database yet?{" "}
        <Link
          href="/forum"
          className="font-bold text-accent hover:underline underline-offset-4"
        >
          See what the community jury says — Scam or Fame →
        </Link>
      </div>
    </Container>
  );
}
