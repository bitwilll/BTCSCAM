import Link from "next/link";
import { prisma } from "@/lib/db";
import { Wordmark } from "./Wordmark";
import { FOOTER_NAV } from "@/lib/nav";
import { SITE } from "@/lib/constants";

export async function Footer() {
  const setting = await prisma.siteSetting
    .findUnique({ where: { key: "threatcon" } })
    .catch(() => null);
  const threatcon = setting?.value ?? "ELEVATED";

  return (
    <footer className="bg-dark text-paper mt-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <Wordmark size="lg" invert />
            <p className="kicker text-ink-400 mt-3">{SITE.mission}</p>
          </div>
          <div className="kicker flex items-center gap-2">
            <span className="text-ink-400">THREATCON:</span>
            <span className="bg-btc text-black px-2 py-1">{threatcon}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h3 className="kicker text-btc mb-4">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-paper/70 hover:text-btc transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row justify-between gap-2 mono text-[11px] tracking-wide text-ink-400 uppercase">
          <span>© {new Date().getFullYear()} BTCSCAM.COM — {SITE.tagline}</span>
          <span className="text-alert">{SITE.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
