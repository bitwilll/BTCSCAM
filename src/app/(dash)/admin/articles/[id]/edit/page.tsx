import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePrivilege } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { updateArticle } from "@/actions/cms";
import { toStrArray } from "@/lib/format";
import { ArticleEditor } from "../../_components/ArticleEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, `/admin/articles/${id}/edit`);
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();

  const action = updateArticle.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 border-b border-ink pb-4">
        <div>
          <h1 className="font-display text-4xl">Edit Article</h1>
          <p className="mono text-[11px] text-meta uppercase tracking-wide mt-1">{a.status} · /article/{a.slug}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/article/${a.slug}`} className="kicker text-meta hover:text-ink">View ↗</Link>
          <Link href="/admin/articles" className="kicker text-meta hover:text-ink">← Back</Link>
        </div>
      </div>
      <ArticleEditor
        action={action}
        canPublish={can(user, PRIVILEGES.ARTICLE_PUBLISH)}
        submitLabel="Save changes"
        initial={{
          title: a.title,
          dek: a.dek,
          body: a.body,
          category: a.category,
          kicker: a.kicker,
          severity: a.severity,
          coverImageUrl: a.coverImageUrl,
          coverLabel: a.coverLabel,
          sourceName: a.sourceName,
          sourceUrl: a.sourceUrl,
          readMinutes: a.readMinutes,
          tags: toStrArray(a.tags),
          isFeatured: a.isFeatured,
          isDeveloping: a.isDeveloping,
          status: a.status,
        }}
      />
    </div>
  );
}
