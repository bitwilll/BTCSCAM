import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MediaPlaceholder, Tag, SectionHeader } from "@/components/ui";
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
  const alt = (images[0] || product.name).replace(/[[\]]/g, "").trim();
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-[1140px] px-6 py-10 fade-up">
      <nav className="mb-6 kicker text-meta">
        <Link href="/store" className="hover:text-ink">
          Store
        </Link>{" "}
        <span className="text-faint">/</span>{" "}
        <Link
          href={`/store?category=${encodeURIComponent(product.category)}`}
          className="hover:text-ink"
        >
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* ── Big image ── */}
        <div>
          {product.imageUrl ? (
            <div
              className="bg-surface-alt bg-cover bg-center shadow-card"
              style={{ aspectRatio: "4/3", backgroundImage: `url(${product.imageUrl})` }}
              role="img"
              aria-label={alt}
            />
          ) : (
            <div className="hatch shadow-card" style={{ aspectRatio: "4/3" }} role="img" aria-label={alt} />
          )}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {images.slice(1, 4).map((label, i) => (
                <MediaPlaceholder key={i} label={label} ratio="1/1" />
              ))}
            </div>
          )}
        </div>

        {/* ── Detail ── */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="kicker text-meta">{product.category}</span>
            {product.badge && <Tag tone="black">{product.badge}</Tag>}
          </div>
          <h1
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(28px,3.5vw,40px)", lineHeight: 1.12, textWrap: "balance" }}
          >
            {product.name}
          </h1>
          <div className="mt-3 font-bold text-[24px] text-ink">{usd(product.priceUsd)}</div>
          <p className="mt-4 text-[18px] leading-[1.65] text-body-2" style={{ textWrap: "pretty" }}>
            {product.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {inStock ? <Tag tone="green">In stock</Tag> : <Tag tone="red">Sold out</Tag>}
            <span className="text-[14px] uppercase tracking-[.05em] text-meta">
              Crypto only — BTC · LN · USDC
            </span>
          </div>

          <div className="mt-6 border-t border-ink pt-6">
            {inStock ? (
              <AddToCart productId={product.id} />
            ) : (
              <p className="text-[16px] leading-[1.5] text-meta">
                This item is currently sold out. Follow The Rug Report for restock alerts.
              </p>
            )}
          </div>

          <div className="mt-6 border border-rule bg-surface-dim p-4">
            <div className="eyebrow mb-1">Where your money goes</div>
            <p className="text-[16px] leading-[1.5] text-body-2">
              100% of store proceeds fund investigations, the community Scam Database and victim
              support. Not financial advice — just a good tee.
            </p>
          </div>
        </div>
      </div>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader title="More in this category" action={{ label: "Open store", href: "/store" }} />
          <div
            className="grid gap-[18px]"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}
          >
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
