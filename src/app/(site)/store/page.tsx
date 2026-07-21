import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { EmptyState, ButtonLink } from "@/components/ui";
import { ProductCard } from "./_components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store — BTCSCAM.COM",
  description: "Merch, print and field guides that fund community scam investigations. We accept crypto only.",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category?.trim() || null;

  const [products, categoryRows] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, ...(active ? { category: active } : {}) },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((r) => r.category);

  return (
    <div className="fade-up">
      {/* ── v4 orange store masthead band ── */}
      <div className="bg-brand border-b-4 border-ink">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-end justify-between gap-6 px-6 py-10">
          <div className="min-w-0">
            <div className="font-bold text-[16px] uppercase tracking-[.05em] text-ink">
              Scam swag — reader-funded since 2026
            </div>
            <h1
              className="mt-2 font-display text-ink"
              style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.06 }}
            >
              The store
            </h1>
            <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.55] text-ink">
              Every order funds moderation hours and server bills. No tokens, no presale, no
              roadmap — just merch.
            </p>
          </div>
          <div className="border border-ink bg-paper px-[18px] py-3.5 font-bold text-[16px] uppercase tracking-[.02em] text-ink">
            Ships Mondays · Crypto only · Gift cards available
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-6 pt-8 pb-2">
        {/* ── Category chips filter row ── */}
        <nav className="flex flex-wrap items-center gap-2" aria-label="Filter by category">
          <FilterChip href="/store" label="All" active={!active} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              href={`/store?category=${encodeURIComponent(c)}`}
              label={c}
              active={active === c}
            />
          ))}
        </nav>

        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Nothing in this aisle"
              hint={
                active
                  ? `No products in “${active}” right now. Browse the full store.`
                  : "The shelves are being restocked. Check back soon."
              }
              action={
                <ButtonLink href="/store" variant="primary" size="md">
                  Back to all products
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div
            className="mt-7 grid gap-[18px]"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* ── WHERE THE MONEY GOES dark strip (v4) ── */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-x-7 gap-y-3 border border-ink bg-dark px-6 py-5">
          <span className="font-bold text-[16px] uppercase tracking-[.05em] text-brand">
            Where the money goes
          </span>
          <span className="text-[16px] uppercase tracking-[.02em] text-ticker">
            62% moderation hours · 23% infrastructure · 15% legal fund
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`kicker inline-flex items-center px-3.5 py-1.5 border border-ink transition-colors ${
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-surface-alt"
      }`}
    >
      {label}
    </Link>
  );
}
