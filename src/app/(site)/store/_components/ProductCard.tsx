import Link from "next/link";
import { Tag } from "@/components/ui";
import { usd, toStrArray } from "@/lib/format";
import { QuickAdd } from "./QuickAdd";

type ProductLike = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceUsd: number;
  category: string;
  imageLabels: unknown;
  imageUrl?: string | null;
  badge: string | null;
};

// v4 store card: white + shadow-card, image top (4/3, hatch fallback),
// category kicker, 700 18px Geist name (products are caps-named), ink ADD button.
export function ProductCard({ product }: { product: ProductLike }) {
  const images = toStrArray(product.imageLabels);
  const alt = (images[0] || product.name).replace(/[[\]]/g, "").trim();

  return (
    <article className="group flex min-w-0 flex-col bg-white shadow-card transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#101010]">
      <Link href={`/store/${product.slug}`} className="block border-b border-ink">
        {product.imageUrl ? (
          <div
            className="bg-surface-alt bg-cover bg-center"
            style={{ aspectRatio: "4/3", backgroundImage: `url(${product.imageUrl})` }}
            role="img"
            aria-label={alt}
          />
        ) : (
          <div className="hatch" style={{ aspectRatio: "4/3" }} role="img" aria-label={alt} />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-[18px] pt-4 pb-[18px]">
        <div className="flex items-center gap-2.5">
          <span className="kicker text-meta">{product.category}</span>
          {product.badge && <Tag tone="black">{product.badge}</Tag>}
        </div>
        <div className="flex items-baseline justify-between gap-2.5">
          <Link
            href={`/store/${product.slug}`}
            className="min-w-0 font-bold text-[18px] leading-[1.3] text-ink hover:underline underline-offset-4"
          >
            {product.name}
          </Link>
          <span className="flex-none font-bold text-[18px] text-ink">{usd(product.priceUsd)}</span>
        </div>
        <p className="line-clamp-2 text-[16px] leading-[1.5] text-body-2">{product.description}</p>
        <div className="mt-auto pt-2">
          <QuickAdd productId={product.id} />
        </div>
      </div>
    </article>
  );
}
