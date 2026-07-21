import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SeverityTag, ButtonLink, EmptyState } from "@/components/ui";
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

const SEVERITY_GROUPS: { key: string; label: string; note: string }[] = [
  { key: "critical", label: "Critical", note: "Act now — funds actively at risk" },
  { key: "high", label: "High", note: "Confirmed threat spreading in the wild" },
  { key: "elevated", label: "Elevated", note: "Emerging pattern — stay sharp" },
];

function AlertItem({ alert }: { alert: AlertRow }) {
  return (
    <article className="py-5 border-b border-line last:border-0">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <SeverityTag severity={alert.severity} />
        {alert.chain && (
          <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">
            {alert.chain}
          </span>
        )}
        <span className="mono text-[11px] text-ink-400 uppercase tracking-wide ml-auto">
          {timeAgo(alert.createdAt)}
        </span>
      </div>
      <h3 className="font-extrabold text-lg text-ink leading-snug">{alert.title}</h3>
      {alert.body && <p className="mt-2 text-sm text-ink-600 leading-snug">{alert.body}</p>}
    </article>
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
  const grouped = SEVERITY_GROUPS.map((g) => ({
    ...g,
    items: alerts.filter((a) => a.severity === g.key),
  })).filter((g) => g.items.length > 0);

  return (
    <Container className="py-8 lg:py-10">
      <PageHeader
        kicker="Live Threat Feed"
        title="Crypto Scam Alerts"
        lede="Fresh sightings as the community logs them — trojanized apps, frozen ponzis, drainer kits and giveaway loops. Read it before your wallet does."
      >
        <ButtonLink href="/report" variant="primary" size="md">
          Report a Scam →
        </ButtonLink>
      </PageHeader>

      {/* Ticker-style intensity note */}
      <div className="bg-dark text-paper px-4 py-3 mb-8 flex flex-wrap items-center gap-x-4 gap-y-1 mono text-[11px] uppercase tracking-wide">
        <span className="text-btc">● Live</span>
        <span>Threatcon: {threatcon}</span>
        <span className="text-ink-400">·</span>
        <span>{num(alerts.length)} active alerts</span>
        <span className="text-ink-400">·</span>
        <span className={criticalCount > 0 ? "text-alert-strong" : "text-ink-400"}>
          {num(criticalCount)} critical
        </span>
        <span className="text-ink-400 ml-auto hidden sm:inline">{SITE.disclaimer}</span>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No active alerts right now"
          hint="The wire is quiet. Check the scam database for tracked entries, or file a report if you have spotted something new."
          action={
            <div className="flex gap-2">
              <ButtonLink href="/database" variant="outline" size="md">
                Open Scam Database
              </ButtonLink>
              <ButtonLink href="/report" variant="primary" size="md">
                Report a Scam
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {grouped.map((group) => (
            <section key={group.key}>
              <div className="flex items-end justify-between gap-4 section-rule pb-2 mb-3">
                <div className="flex items-center gap-3">
                  <SeverityTag severity={group.key} />
                  <h2 className="kicker text-sm !tracking-[0.16em]">{group.label} Alerts</h2>
                </div>
                <span className="mono text-[11px] text-ink-500 uppercase tracking-wide">
                  {num(group.items.length)} active
                </span>
              </div>
              <p className="mono text-[11px] text-ink-500 uppercase tracking-wide mb-2">
                {group.note}
              </p>
              <div>
                {group.items.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}
