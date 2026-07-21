import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES as PV } from "@/lib/constants";
import { PageHeader, Tag, EmptyState, ButtonLink } from "@/components/ui";
import { categoryMeta } from "@/components/content/cards";
import { num, byline } from "@/lib/format";
import { ArticleControls } from "./_components/ArticleControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Article Desk · Staff · BTCSCAM.COM",
  description: "Manage the editorial pipeline — draft, review, publish, feature and archive articles.",
};

const STATUS_TONE: Record<string, "paper" | "orange" | "green" | "outline"> = {
  draft: "paper",
  review: "orange",
  published: "green",
  archived: "outline",
};

const th = "text-left kicker text-ink-500 px-3 py-2 whitespace-nowrap";
const td = "px-3 py-3 align-top border-t border-line";

export default async function ArticlesAdminPage() {
  const user = await requirePrivilege(PV.ARTICLE_CREATE);
  const canPublish = can(user, PV.ARTICLE_PUBLISH);
  const canDelete = can(user, PV.ARTICLE_DELETE);

  const articles = await prisma.article.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { author: { select: { displayName: true } } },
    take: 300,
  });

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft" || a.status === "review").length;

  return (
    <div>
      <PageHeader
        kicker="Editorial"
        title="Article Desk"
        lede="The full pipeline across every status. Publishing and deletion are privilege-gated; featured stories surface on the front page."
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 -mt-2">
        <div className="flex flex-wrap gap-6 mono text-[11px] uppercase tracking-wide text-ink-500">
          <span><strong className="text-ink">{num(articles.length)}</strong> total</span>
          <span><strong className="text-up">{num(published)}</strong> published</span>
          <span><strong className="text-btc-dark">{num(drafts)}</strong> in progress</span>
        </div>
        <ButtonLink href="/admin/articles/new" variant="primary" size="md">+ New Article</ButtonLink>
      </div>

      {articles.length === 0 ? (
        <EmptyState title="No articles yet" hint="Seed the database or create a story from the Editor Desk." />
      ) : (
        <div className="border border-line-strong bg-paper overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-2">
              <tr>
                <th className={th}>Headline</th>
                <th className={th}>Category</th>
                <th className={th}>Author</th>
                <th className={th}>Views</th>
                <th className={th}>Status</th>
                <th className={th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                const meta = categoryMeta(a.category);
                return (
                  <tr key={a.id} className="hover:bg-paper-2/60">
                    <td className={td}>
                      <Link
                        href={`/article/${a.slug}`}
                        className="font-bold text-ink leading-tight hover:text-btc-dark block max-w-[320px]"
                      >
                        {a.title}
                      </Link>
                      <div className="mono text-[10px] text-ink-400 mt-1">
                        {a.publishedAt ? byline(a.publishedAt) : "unpublished"} · {a.readMinutes} min
                      </div>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <span className="mono text-[11px] uppercase text-ink-600">{meta.label}</span>
                      {a.isFeatured && (
                        <span className="block mono text-[10px] text-btc-dark mt-1">★ Featured</span>
                      )}
                    </td>
                    <td className={`${td} mono text-[11px] text-ink-600 whitespace-nowrap`}>
                      {a.author?.displayName ?? "—"}
                    </td>
                    <td className={`${td} font-display text-lg text-ink whitespace-nowrap`}>
                      {num(a.viewCount)}
                    </td>
                    <td className={td}>
                      <Tag tone={STATUS_TONE[a.status] ?? "paper"}>{a.status}</Tag>
                    </td>
                    <td className={td}>
                      <Link href={`/admin/articles/${a.id}/edit`} className="kicker text-btc-dark hover:text-ink inline-block mb-2">
                        ✎ Edit
                      </Link>
                      <ArticleControls
                        articleId={a.id}
                        status={a.status}
                        isFeatured={a.isFeatured}
                        canPublish={canPublish}
                        canDelete={canDelete}
                      />
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
