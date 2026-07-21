import Link from "next/link";
import { requirePrivilege } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { PRIVILEGES } from "@/lib/constants";
import { createArticle } from "@/actions/cms";
import { ArticleEditor } from "../_components/ArticleEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Article" };

export default async function NewArticlePage() {
  const user = await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/articles/new");
  return (
    <div>
      <div className="flex items-center justify-between mb-6 border-b border-ink pb-4">
        <h1 className="font-display text-4xl">New Article</h1>
        <Link href="/admin/articles" className="kicker text-meta hover:text-ink">← Back to articles</Link>
      </div>
      <ArticleEditor action={createArticle} canPublish={can(user, PRIVILEGES.ARTICLE_PUBLISH)} submitLabel="Create article" />
    </div>
  );
}
