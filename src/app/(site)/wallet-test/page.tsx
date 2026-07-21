import { WalletTestForm } from "./_components/WalletTestForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Wallet Test — Check Before You Send",
  description:
    "Paste any wallet address and match it against every cluster linked to the community scam database. One second, free, no signup.",
};

const BULLETS = [
  "Checks first/last characters against every linked wallet across all tracked entries.",
  "Lookalike in your history? That's address poisoning — read the field guide.",
  "Flagged address in the wild? File a sighting — it sharpens the cluster for everyone.",
];

export default async function WalletTestPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-9 fade-up">
      <div className="kicker text-meta">Wallet Test · Check Before You Send</div>
      <h1
        className="font-display mt-2"
        style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.1 }}
      >
        Test any wallet address.
      </h1>
      <p className="mt-3 text-[18px] leading-[1.65] text-body-2 max-w-[62ch]">
        Paste an address before you send. We match it against every wallet cluster linked to the
        scam database — one second, free, no signup.
      </p>

      <WalletTestForm initialQuery={sp.q ?? ""} />

      <div
        className="mt-7 border-t border-ink pt-4 grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
      >
        {BULLETS.map((b, i) => (
          <div key={i} className="flex gap-2.5 text-[16px] leading-[1.5]">
            <span className="flex-none w-1.5 h-1.5 bg-brand mt-[7px]" aria-hidden="true" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
