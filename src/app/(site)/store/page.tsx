import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, EmptyState, ButtonLink } from "@/components/ui";
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
    <Container className="py-10">
      <PageHeader
        kicker="The Store"
        title="Merch That Funds The Watch"
        lede="Every tee, pin and print bankrolls investigations, the Scam Database and The Rug Report. Union-made, broadsheet-printed, community-owned."
      >
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500">
          We accept crypto only — no cards, no processors, no middlemen.
        </p>
      </PageHeader>

      {/* Category filter */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 border-b border-line pb-4">
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
        <EmptyState
          title="Nothing in this aisle"
          hint={
            active
              ? `No products in “${active}” right now. Browse the full store.`
              : "The shelves are being restocked. Check back soon."
          }
          action={<ButtonLink href="/store" variant="primary" size="md">Back to all products</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`kicker inline-flex items-center px-3 py-1.5 capitalize transition-colors ${
        active
          ? "bg-ink text-paper"
          : "border border-line-strong bg-paper-2 text-ink-600 hover:bg-panel"
      }`}
    >
      {label}
    </Link>
  );
}
