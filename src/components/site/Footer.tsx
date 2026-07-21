import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { FOOTER_NAV } from "@/lib/nav";
import { SITE } from "@/lib/constants";

// v4 footer: warm #FEF3E2, ink top rule, wordmark with .COM, quiet link columns.
export async function Footer() {
  return (
    <footer className="bg-masthead text-body-2 mt-24 border-t border-ink">
      <div className="mx-auto max-w-[1360px] px-6 pt-[52px] pb-10 flex flex-wrap gap-10">
        <div className="min-w-0" style={{ flex: "1.6 1 300px" }}>
          <Wordmark size="md" withCom />
          <div className="text-[16px] text-meta mt-1.5">{SITE.mission}</div>
        </div>
        {FOOTER_NAV.map((col) => (
          <div key={col.heading} className="min-w-0" style={{ flex: "1 1 170px" }}>
            <div className="kicker text-meta">{col.heading}</div>
            <div className="flex flex-col gap-[11px] mt-3.5">
              {col.links.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="text-[14px] text-ink-700 hover:underline underline-offset-4"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-dark-line">
        <div className="mx-auto max-w-[1360px] px-6 py-[18px] flex justify-between gap-3 flex-wrap text-[14px] text-meta">
          <span>
            © {new Date().getFullYear()} BTCSCAM.COM — {SITE.tagline}
          </span>
          <span>{SITE.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
