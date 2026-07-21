import Link from "next/link";
import { MediaPlaceholder, Tag } from "@/components/ui";
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

export function ProductCard({ product }: { product: ProductLike }) {
  const images = toStrArray(product.imageLabels);
  const cover = images[0] || `[ ${product.category} ]`;

  return (
    <article className="group flex flex-col border border-line bg-paper p-4">
      <Link href={`/store/${product.slug}`} className="block">
        <MediaPlaceholder src={product.imageUrl} label={cover} ratio="4/3" />
      </Link>
      <div className="mt-3 flex items-center gap-2">
        {product.badge && <Tag tone="orange">{product.badge}</Tag>}
        <span className="kicker text-ink-500 capitalize">{product.category}</span>
      </div>
      <h3 className="mt-2 font-extrabold leading-tight text-ink group-hover:text-btc-dark">
        <Link href={`/store/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-600 leading-snug">{product.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-2xl text-ink">{usd(product.priceUsd)}</span>
        <Link href={`/store/${product.slug}`} className="kicker text-btc-dark hover:text-ink">
          Details →
        </Link>
      </div>
      <QuickAdd productId={product.id} />
    </article>
  );
}
