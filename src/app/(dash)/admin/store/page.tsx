import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { usd, num, toStrArray } from "@/lib/format";
import { ProductControls } from "./_components/ProductControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store & Products · Staff · BTCSCAM.COM",
  description: "Manage merch — toggle availability and keep stock levels current.",
};

const th = "text-left kicker text-ink-500 px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-line";

export default async function StoreAdminPage() {
  await requirePrivilege(PV.STORE_MANAGE);

  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const activeCount = products.filter((p) => p.isActive).length;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  return (
    <div>
      <PageHeader
        kicker="Store"
        title="Products & Stock"
        lede="Toggle what's live in the shop and keep inventory honest. All sales settle in crypto only."
      />

      <div className="flex flex-wrap gap-6 mb-6 -mt-2 mono text-[11px] uppercase tracking-wide text-ink-500">
        <span><strong className="text-ink">{num(products.length)}</strong> products</span>
        <span><strong className="text-up">{num(activeCount)}</strong> active</span>
        <span><strong className="text-alert-strong">{num(lowStock)}</strong> low stock</span>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products" hint="Seed the store to populate the catalogue." />
      ) : (
        <div className="border border-line-strong bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-2">
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Category</th>
                <th className={th}>Price</th>
                <th className={th}>Stock</th>
                <th className={th}>State</th>
                <th className={th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const labels = toStrArray(p.imageLabels);
                return (
                  <tr key={p.id} className="hover:bg-paper-2/60">
                    <td className={td}>
                      <div className="font-bold text-ink leading-tight max-w-[280px]">{p.name}</div>
                      {p.badge && (
                        <span className="inline-block mt-1">
                          <Tag tone="orange">{p.badge}</Tag>
                        </span>
                      )}
                      <div className="mono text-[11px] text-ink-500 mt-1 line-clamp-2 max-w-[280px]">
                        {p.description}
                      </div>
                      {labels[0] && (
                        <div className="mono text-[10px] text-ink-400 mt-1">{labels[0]}</div>
                      )}
                    </td>
                    <td className={`${td} mono text-[11px] uppercase text-ink-600 whitespace-nowrap`}>
                      {p.category}
                    </td>
                    <td className={`${td} font-display text-lg text-ink whitespace-nowrap`}>
                      {usd(p.priceUsd)}
                    </td>
                    <td
                      className={`${td} font-display text-lg whitespace-nowrap ${
                        p.stock <= 5 ? "text-alert-strong" : "text-ink"
                      }`}
                    >
                      {num(p.stock)}
                    </td>
                    <td className={td}>
                      <Tag tone={p.isActive ? "green" : "outline"}>
                        {p.isActive ? "active" : "hidden"}
                      </Tag>
                    </td>
                    <td className={td}>
                      <ProductControls productId={p.id} isActive={p.isActive} stock={p.stock} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
