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
      {/* sidebar */}
      <aside
        className={`bg-dark text-paper lg:w-64 lg:shrink-0 lg:min-h-screen ${
          open ? "block" : "hidden lg:block"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="font-display text-2xl leading-none">
            <span className="text-btc">BTC</span>
            <span className="strike-scam text-paper">SCAM</span>
            <span className="mono text-[10px] text-ink-400 align-top"> STAFF</span>
          </Link>
        </div>
        <nav className="p-3 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              {g && <div className="kicker text-ink-400 px-2 mb-1">{g}</div>}
              {items
                .filter((i) => (i.group ?? "") === g)
                .map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 kicker transition-colors ${
                      isActive(i.href)
                        ? "bg-btc text-black"
                        : "text-paper/70 hover:bg-white/10 hover:text-paper"
                    }`}
                  >
                    {i.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-paper border-b-2 border-ink px-5 py-3 flex items-center justify-between gap-4">
          <button className="lg:hidden kicker" onClick={() => setOpen((v) => !v)}>
            ☰ Menu
          </button>
          <div className="hidden lg:block mono text-[11px] uppercase tracking-wide text-ink-500">
            Staff Console
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="kicker text-ink">{user.displayName}</div>
              <div className="mono text-[10px] text-ink-500 uppercase tracking-wide">{user.role}</div>
            </div>
            <Link href="/" className="kicker text-ink-500 hover:text-ink">
              View Site ↗
            </Link>
            <form action={logoutAction}>
              <button className="kicker bg-ink text-paper px-3 py-1.5 hover:bg-alert-strong">
                Log Out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8 max-w-[1200px] w-full">{children}</main>
      </div>
    </div>
  );
}
