import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { usd, num, byline, shortAddr } from "@/lib/format";
import { DonationControls } from "./_components/DonationControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donations · Staff · BTCSCAM.COM",
  description: "Reconcile crypto donations and confirm on-chain receipts.",
};

const th = "text-left kicker text-meta px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-rule";

export default async function DonationsAdminPage() {
  await requirePrivilege(PV.DONATION_MANAGE);

  const donations = await prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 300 });

  const confirmed = donations.filter((d) => d.status === "confirmed");
  const confirmedTotal = confirmed.reduce((sum, d) => sum + (d.amountUsd ?? 0), 0);
  const pledged = donations.filter((d) => d.status !== "confirmed").length;

  return (
    <div>
      <PageHeader
        kicker="Support"
        title="Donations"
        lede="Every donation settles in crypto. Confirm a pledge once the transaction clears on-chain."
      />

      <div className="flex flex-wrap gap-6 mb-6 -mt-2 mono text-[11px] uppercase tracking-wide text-meta">
        <span><strong className="text-ink">{num(donations.length)}</strong> donations</span>
        <span><strong className="text-safe">{num(confirmed.length)}</strong> confirmed</span>
        <span><strong className="text-accent">{pledged}</strong> pending</span>
        <span>Confirmed value <strong className="text-ink">{usd(confirmedTotal)}</strong></span>
      </div>

      {donations.length === 0 ? (
        <EmptyState title="No donations yet" hint="Pledges from the Donate page will appear here." />
      ) : (
        <div className="border border-ink bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-surface-dim">
              <tr>
                <th className={th}>Donor</th>
                <th className={th}>Method</th>
                <th className={th}>Amount</th>
                <th className={th}>Tx Hash</th>
                <th className={th}>Message</th>
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-surface-dim">
                  <td className={td}>
                    <div className="font-bold text-ink">
                      {d.isAnonymous ? "Anonymous" : d.donorName || "Anonymous"}
                    </div>
                    {!d.isAnonymous && d.email && (
                      <div className="mono text-[10px] text-meta break-all">{d.email}</div>
                    )}
                    <div className="mono text-[10px] text-faint mt-1">{byline(d.createdAt)}</div>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <Tag tone="paper">{d.cryptoMethod}</Tag>
                  </td>
                  <td className={`${td} mono font-bold text-[16px] text-ink whitespace-nowrap`}>
                    {d.amountUsd != null ? usd(d.amountUsd) : "—"}
                  </td>
                  <td className={`${td} mono text-[11px] text-body-2 whitespace-nowrap`}>
                    {d.txHash ? shortAddr(d.txHash) : <span className="text-faint">—</span>}
                  </td>
                  <td className={`${td} text-xs text-body-2 max-w-[240px]`}>
                    {d.message ? (
                      <span className="line-clamp-3">“{d.message}”</span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className={td}>
                    <Tag tone={d.status === "confirmed" ? "green" : "paper"}>{d.status}</Tag>
                  </td>
                  <td className={td}>
                    <DonationControls donationId={d.id} status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
