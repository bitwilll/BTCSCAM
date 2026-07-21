import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Satoshi",
  description:
    "Free tools, techniques and open-source work. No license fees, no telemetry — a tithe to the protocol that started all of this.",
};

const SAT_TOOLS = [
  {
    n: "scamcheck-cli",
    d: "Domain age, TLS history and wallet-cluster lookups from your terminal.",
    meta: "V2.4 · MIT",
    href: "/database",
  },
  {
    n: "drainer-sig-db",
    d: "Machine-readable signatures of known drainer contracts. Nightly builds.",
    meta: "DATASET · CC0",
    href: "/database",
  },
  {
    n: "poison-guard",
    d: "Browser extension that flags lookalike addresses before you paste.",
    meta: "V1.1 · GPL-3",
    href: "/database",
  },
];

const SAT_TECHS = [
  {
    n: "Verifying a proof-of-reserves page",
    d: "The 20-minute method, no tools required",
    href: "/forum",
  },
  {
    n: "Reading a token contract for exit hatches",
    d: "The four functions that matter",
    href: "/forum",
  },
  {
    n: "Tracing a rug through a bridge",
    d: "A follow-the-funds walkthrough",
    href: "/forum",
  },
];

const SAT_OSS = [
  {
    n: "btcscam/database-exports",
    d: "The full scam database as JSON, refreshed hourly.",
    meta: "412 FORKS",
    href: "/database",
  },
  {
    n: "btcscam/indicator-feeds",
    d: "Blocklists for wallets, extensions and DNS filters.",
    meta: "96 CONTRIBUTORS",
    href: "/forum",
  },
];

export default function ForSatoshiPage() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 pt-9 fade-up">
      <div className="kicker text-meta">Given back to the commons</div>
      <h1
        className="mt-2 font-display text-ink"
        style={{ fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 1 }}
      >
        For Satoshi
      </h1>
      <p
        className="mt-3 max-w-[64ch] text-[18px] leading-[1.65] text-body-2"
        style={{ textWrap: "pretty" }}
      >
        Free tools, techniques and open-source work. No license fees, no telemetry — a tithe to the
        protocol that started all of this.
      </p>

      <div
        className="mt-[26px] grid items-start gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}
      >
        {/* ── Tools ── */}
        <div className="border-t-4 border-brand">
          <div className="px-1 py-3 font-sans font-bold text-[16px] uppercase tracking-[.05em] text-ink">
            Tools
          </div>
          {SAT_TOOLS.map((t) => (
            <div key={t.n} className="mt-2.5 border border-ink bg-white px-[18px] py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2.5">
                <code className="mono font-bold text-[18px] text-ink">{t.n}</code>
                <span className="font-sans font-bold text-[16px] text-safe">{t.meta}</span>
              </div>
              <p className="mt-2 text-[16px] leading-[1.5] text-body-2">{t.d}</p>
              <div className="mt-2.5">
                <ButtonLink href={t.href} variant="ghost" size="sm">
                  Get it free →
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        {/* ── Techniques ── */}
        <div className="border-t-4 border-ink">
          <div className="px-1 py-3 font-sans font-bold text-[16px] uppercase tracking-[.05em] text-ink">
            Techniques
          </div>
          {SAT_TECHS.map((t) => (
            <div key={t.n} className="mt-2.5 border border-ink bg-white px-[18px] py-4">
              <div className="font-display text-[18px] leading-[1.4] tracking-[-0.01em] text-ink">
                {t.n}
              </div>
              <div className="mt-1 text-[16px] text-meta">{t.d}</div>
              <div className="mt-2.5">
                <ButtonLink href={t.href} variant="ghost" size="sm">
                  Read the guide →
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        {/* ── Open source work ── */}
        <div className="border-t-4 border-safe">
          <div className="px-1 py-3 font-sans font-bold text-[16px] uppercase tracking-[.05em] text-ink">
            Open source work
          </div>
          {SAT_OSS.map((t) => (
            <div key={t.n} className="mt-2.5 border border-ink bg-white px-[18px] py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2.5">
                <code className="mono font-bold text-[18px] text-ink">{t.n}</code>
                <span className="font-sans font-bold text-[16px] text-safe">{t.meta}</span>
              </div>
              <p className="mt-2 text-[16px] leading-[1.5] text-body-2">{t.d}</p>
              <div className="mt-2.5">
                <ButtonLink href={t.href} variant="ghost" size="sm">
                  Contribute →
                </ButtonLink>
              </div>
            </div>
          ))}
          <div className="mt-3.5 border border-dashed border-faint p-4 text-[16px] leading-[1.55] text-meta">
            PRS WELCOME. FIRST-TIMERS GET A REVIEW BUDDY FROM THE FORUM.
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
