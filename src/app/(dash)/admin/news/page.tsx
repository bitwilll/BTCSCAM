import Link from "next/link";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { byline, timeAgo } from "@/lib/format";
import { looksScammy } from "@/lib/news-sources";
import { Tag } from "@/components/ui";
import { FetchBar, ItemActions, RestoreButton, SourceForm, SourceControls } from "./_components/NewsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "News Aggregator" };

const STATUS_TABS = ["fetched", "published", "dismissed"] as const;

export default async function NewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePrivilege(PRIVILEGES.ARTICLE_CREATE, "/admin/news");
  const sp = await searchParams;
  const status = STATUS_TABS.includes(sp.status as (typeof STATUS_TABS)[number])
    ? (sp.status as string)
    : "fetched";

  const [items, sources, counts] = await Promise.all([
    prisma.newsFeedItem.findMany({ where: { status }, orderBy: { publishedAt: "desc" }, take: 60 }),
    prisma.newsSource.findMany({ orderBy: { name: "asc" } }),
    prisma.newsFeedItem.groupBy({ by: ["status"], _count: true }).catch(() => []),
  ]);
  const countFor = (s: string) =>
    (counts as { status: string; _count: number }[]).find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="space-y-8">
      <div className="border-b border-ink pb-4">
        <h1 className="font-display text-4xl">News Aggregator</h1>
        <p className="text-body-2 mt-2 max-w-2xl">
          Pull the latest crypto headlines from multiple sources, then push the ones worth covering
          into an <strong>attributed draft</strong> for a copywriter to rewrite before publishing.
        </p>
      </div>

      <FetchBar />

      {/* Sources */}
      <section className="border border-rule bg-surface-dim p-5">
        <h2 className="kicker text-ink mb-3">Sources ({sources.filter((s) => s.isActive).length} active)</h2>
        <SourceForm />
        <div className="mt-4 divide-y divide-rule">
          {sources.length === 0 && <p className="mono text-sm text-meta">No sources yet — add defaults above.</p>}
          {sources.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <div className="font-bold text-ink">{s.name}</div>
                <div className="mono text-[11px] text-meta truncate">{s.feedUrl}</div>
                {s.lastFetchedAt && <div className="mono text-[10px] text-faint">last fetched {timeAgo(s.lastFetchedAt)}</div>}
              </div>
              <SourceControls id={s.id} active={s.isActive} />
            </div>
          ))}
        </div>
      </section>

      {/* Status tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/news?status=${t}`}
            className={`kicker px-3 py-2 border ${t === status ? "bg-ink text-paper border-ink" : "border-ink text-body-2 hover:bg-surface-alt"}`}
          >
            {t} ({countFor(t)})
          </Link>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="border border-dashed border-faint p-8 text-center mono text-sm text-meta">
            No {status} items. Click “Fetch latest news”.
          </div>
        )}
        {items.map((it) => (
          <article key={it.id} className="border border-rule bg-paper p-4 flex gap-4">
            <div className="w-32 shrink-0 hidden sm:block">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt="" className="w-32 h-24 object-cover border border-rule" />
              ) : (
                <div className="hatch w-32 h-24" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="kicker text-accent">{it.sourceName}</span>
                {looksScammy(`${it.title} ${it.summary ?? ""}`) && <Tag tone="red">Scam-relevant</Tag>}
                {it.publishedAt && <span className="mono text-[10px] text-faint uppercase">{byline(it.publishedAt)}</span>}
              </div>
              <h3 className="font-extrabold text-ink leading-tight">
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{it.title} ↗</a>
              </h3>
              {it.summary && <p className="text-sm text-body-2 mt-1 line-clamp-3">{it.summary}</p>}
              <div className="mt-3">
                {status === "dismissed" ? (
                  <RestoreButton id={it.id} />
                ) : status === "published" ? (
                  it.pushedArticleId ? (
                    <Link href={`/admin/articles/${it.pushedArticleId}/edit`} className="kicker text-accent hover:text-ink">Edit draft →</Link>
                  ) : (
                    <span className="mono text-[11px] text-faint">pushed</span>
                  )
                ) : (
                  <ItemActions id={it.id} pushed={!!it.pushedArticleId} />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
