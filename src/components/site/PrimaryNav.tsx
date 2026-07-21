"use client";

import { useState } from "react";
import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/nav";

type NavUser = { displayName: string; isStaff: boolean } | null;

export function PrimaryNav({ user, cartCount = 0 }: { user: NavUser; cartCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-paper border-b border-ink sticky top-0 z-40">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* desktop nav */}
          <ul className="hidden lg:flex items-stretch h-full">
            {PRIMARY_NAV.map((g) => (
              <li key={g.label} className="group relative flex items-center">
                {g.href ? (
                  <Link
                    href={g.href}
                    className="kicker px-3 h-full flex items-center text-ink hover:text-btc-dark"
                  >
                    {g.label}
                  </Link>
                ) : (
                  <>
                    <button className="kicker px-3 h-full flex items-center gap-1 text-ink group-hover:text-btc-dark">
                      {g.label} <span className="text-[8px]">▾</span>
                    </button>
                    <div className="absolute left-0 top-full min-w-[220px] bg-paper border border-ink shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-opacity z-50">
                      {g.children?.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block px-4 py-2.5 kicker text-ink-700 hover:bg-panel hover:text-ink border-b border-line last:border-0"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* mobile hamburger */}
          <button
            className="lg:hidden kicker flex items-center gap-2 py-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <span className="text-lg leading-none">{mobileOpen ? "✕" : "☰"}</span> Menu
          </button>

          {/* right actions */}
          <ul className="flex items-center gap-1 sm:gap-2 h-full">
            <li>
              <Link
                href="/cart"
                className="kicker px-3 h-full flex items-center gap-1 text-ink hover:text-btc-dark relative"
              >
                Cart
                {cartCount > 0 && (
                  <span className="bg-btc text-black rounded-full min-w-[16px] h-4 px-1 text-[10px] flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            {user ? (
              <li>
                <Link href="/desk" className="kicker px-3 h-full flex items-center text-ink hover:text-btc-dark">
                  My Desk
                </Link>
              </li>
            ) : (
              <li>
                <Link href="/login" className="kicker px-3 h-full flex items-center text-ink hover:text-btc-dark">
                  Log In
                </Link>
              </li>
            )}
            {user?.isStaff && (
              <li>
                <Link
                  href="/staff"
                  className="kicker px-3 py-1 flex items-center bg-ink text-paper hover:bg-btc hover:text-black"
                >
                  Staff
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-paper max-h-[70vh] overflow-y-auto">
          {PRIMARY_NAV.map((g) => (
            <div key={g.label} className="border-b border-line">
              {g.href ? (
                <Link
                  href={g.href}
                  className="block px-5 py-3 kicker text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  {g.label}
                </Link>
              ) : (
                <div className="py-2">
                  <div className="px-5 py-1 kicker text-ink-400">{g.label}</div>
                  {g.children?.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-7 py-2 kicker text-ink-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
