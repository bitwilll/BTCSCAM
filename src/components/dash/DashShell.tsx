"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";

export type DashNavItem = { label: string; href: string; group?: string };

export function DashShell({
  items,
  user,
  children,
}: {
  items: DashNavItem[];
  user: { displayName: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || (href !== "/staff" && href !== "/admin" && pathname.startsWith(href));

  const groups = [...new Set(items.map((i) => i.group ?? ""))];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper">
      {/* sidebar — v4 staff console rail */}
      <aside
        className={`bg-dark text-paper lg:w-64 lg:shrink-0 lg:min-h-screen ${
          open ? "block" : "hidden lg:block"
        }`}
      >
        <div className="px-[18px] pt-[22px] pb-4 border-b border-dark-line">
          <Link href="/" className="font-display text-2xl leading-none hover:no-underline">
            <span className="text-brand">BTC</span>
            <span className="strike-scam text-paper">SCAM</span>
          </Link>
          <div className="kicker text-brand mt-3">Staff console</div>
          <div className="mt-1 text-[14px] uppercase tracking-[.05em] text-meta">
            Signed in as {user.displayName}
          </div>
        </div>
        <nav className="py-3 mt-1">
          {groups.map((g) => (
            <div key={g} className="mb-4 last:mb-0">
              {g && (
                <div className="px-[18px] mb-1 text-[14px] font-bold uppercase tracking-[.05em] text-faint">
                  {g}
                </div>
              )}
              {items
                .filter((i) => (i.group ?? "") === g)
                .map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`block px-[18px] py-2 text-[14px] font-bold uppercase tracking-[.05em] transition-colors hover:no-underline ${
                      isActive(i.href)
                        ? "bg-paper text-ink"
                        : "text-ticker hover:bg-action-hover hover:text-paper"
                    }`}
                  >
                    {i.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="mx-[18px] mb-6 border border-dark-line bg-[#12120D] p-3.5">
          <div className="text-[14px] uppercase tracking-[.05em] text-meta">Shift status</div>
          <div className="flex items-center gap-2 mt-2 text-[14px] font-bold uppercase tracking-[.05em] text-up">
            <span className="w-2 h-2 bg-up blink-dot" aria-hidden="true" />
            On duty
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-paper border-b border-ink px-5 py-3 flex items-center justify-between gap-4">
          <button className="lg:hidden kicker cursor-pointer" onClick={() => setOpen((v) => !v)}>
            ☰ Menu
          </button>
          <div className="hidden lg:block kicker text-meta">Staff console</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="kicker text-ink">{user.displayName}</div>
              <div className="text-[14px] uppercase tracking-[.05em] text-meta">{user.role}</div>
            </div>
            <Link href="/" className="kicker text-meta hover:text-ink">
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button className="inline-flex items-center justify-center px-3.5 py-2 font-sans font-bold text-[14px] uppercase tracking-[.05em] bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper cursor-pointer">
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8 max-w-[1200px] w-full fade-up">{children}</main>
      </div>
    </div>
  );
}
