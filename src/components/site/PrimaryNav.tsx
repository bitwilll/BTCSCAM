"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// v4 nav structure
const NAV: { label: string; href?: string; items?: [string, string][] }[] = [
  { label: "SCAM DATABASE", href: "/database" },
  { label: "ALERTS", href: "/alerts" },
  {
    label: "COMMUNITY",
    items: [
      ["Forum", "/forum"],
      ["Sting Operations", "/sting-operations"],
      ["Gatherings", "/gatherings"],
      ["Scam Art", "/scam-art"],
    ],
  },
  {
    label: "MEDIA",
    items: [
      ["ScamCast", "/scamcast"],
      ["Magazine", "/magazine"],
      ["Film Fund", "/film-fundraiser"],
      ["Latest News", "/news"],
    ],
  },
  {
    label: "SERVICES",
    items: [
      ["Wallet Test", "/wallet-test"],
      ["Consultation", "/consultation"],
      ["Donate", "/donate"],
      ["For Satoshi", "/for-satoshi"],
    ],
  },
  { label: "STORE", href: "/store" },
];

type NavUser = { displayName: string; isStaff: boolean } | null;

export function PrimaryNav({ user, cartCount = 0 }: { user: NavUser; cartCount?: number }) {
  const [open, setOpen] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (g: (typeof NAV)[number]) =>
    g.href
      ? pathname === g.href || (g.href !== "/" && pathname.startsWith(g.href))
      : (g.items ?? []).some(([, h]) => pathname.startsWith(h.split("#")[0]));

  return (
    <nav className="sticky top-0 z-40 bg-masthead border-t border-ink rule-double">
      <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-between gap-3 flex-wrap">
        {/* desktop nav */}
        <div className="hidden lg:flex flex-wrap items-baseline">
          {NAV.map((g) => {
            const act = isActive(g);
            const isOpen = open === g.label;
            return (
              <div
                key={g.label}
                className="relative"
                onMouseEnter={() => setOpen(g.items ? g.label : "")}
                onMouseLeave={() => setOpen("")}
              >
                {g.href ? (
                  <Link
                    href={g.href}
                    className={`inline-block px-4 py-[13px] font-sans text-[16px] hover:text-accent hover:no-underline ${
                      act ? "font-bold text-ink" : "font-normal text-body-2"
                    }`}
                  >
                    {g.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => setOpen(isOpen ? "" : g.label)}
                    aria-expanded={isOpen}
                    className={`px-4 py-[13px] font-sans text-[16px] bg-transparent border-0 cursor-pointer hover:text-accent ${
                      act ? "font-bold text-ink" : "font-normal text-body-2"
                    }`}
                  >
                    {g.label} <span className="text-[14px] text-meta">{isOpen ? "−" : "+"}</span>
                  </button>
                )}
                {g.items && isOpen && (
                  <div className="absolute top-full left-0 z-50 min-w-[240px] bg-paper border border-ink fade-up-fast">
                    {g.items.map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen("")}
                        className={`block text-left px-5 py-[13px] font-sans text-[18px] text-ink border-b border-rule last:border-b-0 hover:bg-surface-alt hover:no-underline ${
                          pathname === href.split("#")[0] ? "bg-masthead" : ""
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* mobile toggle */}
        <button
          className="lg:hidden font-sans font-bold text-[16px] py-3 bg-transparent border-0 cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕ CLOSE" : "☰ MENU"}
        </button>

        {/* right actions */}
        <div className="flex gap-[22px] py-[9px] font-sans text-[16px] items-center">
          <Link
            href="/cart"
            className="text-body-2 inline-flex items-center gap-[7px] hover:underline underline-offset-4"
          >
            CART
            {cartCount > 0 && (
              <span className="bg-ink text-paper px-2 border border-ink text-[16px]">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/desk" : "/login"}
            className="text-body-2 hover:underline underline-offset-4 hidden sm:inline"
          >
            {user ? "MY DESK" : "LOG IN"}
          </Link>
          {user?.isStaff && (
            <Link
              href="/staff"
              className="text-body-2 hover:underline underline-offset-4 hidden sm:inline"
            >
              STAFF
            </Link>
          )}
          <Link
            href="/report"
            className="px-4 py-[9px] font-sans text-[14px] tracking-[.05em] bg-ink text-paper border border-ink hover:bg-action-hover hover:no-underline"
          >
            REPORT A SCAM
          </Link>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-rule bg-paper max-h-[70vh] overflow-y-auto">
          {NAV.map((g) => (
            <div key={g.label} className="border-b border-rule">
              {g.href ? (
                <Link
                  href={g.href}
                  className="block px-6 py-3.5 font-sans font-bold text-[16px] text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  {g.label}
                </Link>
              ) : (
                <div className="py-2">
                  <div className="px-6 py-1.5 eyebrow">{g.label}</div>
                  {g.items?.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-8 py-2.5 font-sans text-[16px] text-body-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="px-6 py-3.5 flex gap-5">
            <Link
              href={user ? "/desk" : "/login"}
              className="font-sans font-bold text-[16px]"
              onClick={() => setMobileOpen(false)}
            >
              {user ? "MY DESK" : "LOG IN"}
            </Link>
            {user?.isStaff && (
              <Link
                href="/staff"
                className="font-sans font-bold text-[16px]"
                onClick={() => setMobileOpen(false)}
              >
                STAFF
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
