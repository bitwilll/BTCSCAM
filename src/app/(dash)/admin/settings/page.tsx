import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { Kicker, SectionHeader } from "@/components/ui";
import { SettingsForm } from "./_components/SettingsForm";
import { WalletForm } from "./_components/WalletForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Settings · BTCSCAM.COM",
  description: "Manage site-wide settings and crypto wallet addresses.",
};

export default async function AdminSettingsPage() {
  await requirePrivilege(PV.SETTINGS_MANAGE);

  const [settings, wallets] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.cryptoWallet.findMany({ orderBy: { order: "asc" } }),
  ]);

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <div className="border-b-2 border-ink pb-5 mb-8">
        <Kicker color="orange">Access Control</Kicker>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[0.9] mt-2">Site Settings</h1>
        <p className="mt-3 text-ink-600 max-w-2xl">
          Site-wide display values and the crypto addresses that receive all donations and store payments.
        </p>
      </div>

      {/* Site display settings */}
      <div className="mb-12">
        <SectionHeader title="Display &amp; Counters" />
        <div className="max-w-2xl">
          <SettingsForm
            threatcon={map.threatcon ?? "ELEVATED"}
            watchmen={map.watchmen ?? "0"}
            todaysNumber={map.todays_number ?? "$0"}
          />
        </div>
      </div>

      {/* Wallet addresses */}
      <div>
        <SectionHeader title="Crypto Wallet Addresses" />

        {/* Prominent warning */}
        <div className="border-2 border-alert-strong bg-alert-strong/5 p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="kicker inline-flex items-center px-2 py-[3px] leading-none bg-alert-strong text-white">
              Read before editing
            </span>
          </div>
          <p className="text-ink-700 text-sm leading-relaxed max-w-3xl">
            These addresses are <strong>placeholders</strong> shipped with the seed data. Every donation and store
            payment goes <strong>directly to whatever address is entered here</strong> — there is no processor and no
            reversal. Replace each one with a real, verified receiving address that you control{" "}
            <strong>before going live</strong>. Double-check every character; a wrong address means lost funds.
          </p>
        </div>

        {wallets.length === 0 ? (
          <p className="mono text-sm text-ink-500">No wallets are configured.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {wallets.map((w) => (
              <WalletForm
                key={w.id}
                method={w.method}
                label={w.label}
                network={w.network}
                address={w.address}
                memo={w.memo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
