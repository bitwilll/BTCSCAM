import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { CryptoPaymentPanel, type WalletView } from "./CryptoPaymentPanel";

/**
 * Server component: loads active crypto wallets, pre-renders QR SVGs, and
 * hands them to the interactive panel. Used by donate / checkout / fundraiser.
 * `methods` optionally filters which methods to show.
 */
export async function CryptoPay({ methods }: { methods?: string[] }) {
  const wallets = await prisma.cryptoWallet
    .findMany({
      where: { isActive: true, ...(methods ? { method: { in: methods } } : {}) },
      orderBy: { order: "asc" },
    })
    .catch(() => []);

  const views: WalletView[] = await Promise.all(
    wallets.map(async (w) => ({
      method: w.method,
      label: w.label,
      network: w.network,
      address: w.address,
      memo: w.memo,
      qrSvg: await QRCode.toString(w.address, {
        type: "svg",
        margin: 0,
        color: { dark: "#101010", light: "#ffffff" },
      }),
    })),
  );

  if (!views.length)
    return (
      <div className="border border-dashed border-line-strong p-6 mono text-sm text-ink-500">
        No crypto wallets are configured yet.
      </div>
    );

  return <CryptoPaymentPanel wallets={views} />;
}
