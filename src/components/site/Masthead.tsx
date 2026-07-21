import Link from "next/link";
import { prisma } from "@/lib/db";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui";
import { SITE } from "@/lib/constants";
import { dateline, num } from "@/lib/format";

export async function Dateline() {
  const setting = await prisma.siteSetting
    .findUnique({ where: { key: "watchmen" } })
    .catch(() => null);
  const watchmen = setting ? Number(setting.value) : 41208;
  return (
    <div className="bg-paper-2 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 mono text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-ink-600">
        <span className="hidden sm:block">{dateline(new Date())}</span>
        <span className="text-ink-700 font-semibold text-center flex-1 sm:flex-none">
          {SITE.tagline}
        </span>
        <span className="hidden sm:block text-btc-dark">{num(watchmen)} WATCHMEN ON DUTY</span>
      </div>
    </div>
  );
}

export function Masthead() {
  return (
    <div className="bg-paper border-b-2 border-ink">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <Wordmark size="lg" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ButtonLink href="/subscribe" variant="dark" size="md" className="hidden sm:inline-flex">
            Subscribe
          </ButtonLink>
          <ButtonLink href="/report" variant="primary" size="md">
            Report a Scam
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
