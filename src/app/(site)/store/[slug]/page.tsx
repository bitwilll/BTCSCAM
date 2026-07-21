import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, MediaPlaceholder, Tag, Kicker, SectionHeader } from "@/components/ui";
import { usd, toStrArray } from "@/lib/format";
import { ProductCard } from "../_components/ProductCard";
import { AddToCart } from "./_components/AddToCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product not found — BTCSCAM.COM" };
  return {
    title: `${product.name} — BTCSCAM.COM Store`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: { isActive: true, category: product.category, id: { not: product.id } },
    orderBy: { createdAt: "asc" },
    take: 3,
  });

  const images = toStrArray(product.imageLabels);
  const cover = images[0] || `[ ${product.category} ]`;
  const inStock = product.stock > 0;

  return (
    <Container className="py-10">
      <nav className="mb-6 mono text-[11px] uppercase tracking-wide text-ink-500">
        <Link href="/store" className="hover:text-btc-dark">
          Store
        </Link>{" "}
        <span className="text-ink-400">/</span>{" "}
        <Link href={`/store?category=${encodeURIComponent(product.category)}`} className="capitalize hover:text-btc-dark">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Gallery */}
        <div>
          <MediaPlaceholder src={product.imageUrl} label={cover} ratio="4/3" />
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {images.slice(1, 4).map((label, i) => (
                <MediaPlaceholder key={i} label={label} ratio="1/1" />
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          <div className="flex items-center gap-2">
            {product.badge && <Tag tone="orange">{product.badge}</Tag>}
            <Kicker color="muted" className="capitalize">
              {product.category}
            </Kicker>
          </div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl leading-[0.95] text-ink">{product.name}</h1>
          <div className="mt-4 font-display text-4xl text-btc-dark">{usd(product.priceUsd)}</div>
          <p className="mt-4 text-lg text-ink-600 leading-relaxed">{product.description}</p>

          <div className="mt-5 flex items-center gap-2">
            {inStock ? (
              <Tag tone="green">In stock</Tag>
            ) : (
              <Tag tone="red">Sold out</Tag>
            )}
            <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
              Ships worldwide · Crypto only
            </span>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            {inStock ? (
              <AddToCart productId={product.id} />
            ) : (
              <p className="mono text-sm text-ink-500">
                This item is currently sold out. Follow The Rug Report for restock alerts.
              </p>
            )}
          </div>

          <div className="mt-6 border border-line bg-paper-2 p-4">
            <div className="eyebrow mb-1">Where your money goes</div>
            <p className="text-sm text-ink-600 leading-snug">
              100% of store proceeds fund investigations, the community Scam Database and victim support.
              Not financial advice — just a good tee.
            </p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader title="More In This Category" action={{ label: "Open Store", href: "/store" }} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
