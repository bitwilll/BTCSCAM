import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, MediaPlaceholder, Tag, EmptyState } from "@/components/ui";
import { byline } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { EpisodeCard } from "./_components/EpisodeCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ScamCast — The BTCSCAM Podcast & Video — BTCSCAM.COM",
  description: "Deep-dives, victim interviews and on-chain post-mortems. Anatomy of the scams that mattered.",
};

const PLATFORMS = ["Apple Podcasts", "Spotify", "YouTube", "RSS Feed"];

export default async function ScamCastPage() {
  const episodes = await prisma.mediaItem.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const [featured, ...rest] = episodes;

  return (
    <>
      <Container className="py-8 lg:py-12">
        <PageHeader
          kicker="ScamCast"
          title="The Podcast"
          lede="Long-form audio and video breakdowns of the biggest scams — how they ran, who got hit, and how the money moved."
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker text-ink-500">Listen on</span>
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="kicker px-3 py-1.5 border border-line-strong text-ink-600"
              >
                {p}
              </span>
            ))}
          </div>
        </PageHeader>

        {featured ? (
          <>
            {/* Featured / latest episode */}
            <article className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center border-b border-line pb-12 mb-12">
              <div className="relative">
                <MediaPlaceholder src={featured.imageUrl} label={`[ ${featured.kind}: cover art ]`} ratio="16/9" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center bg-btc text-black text-3xl">
                    ▶
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag tone="orange">Latest Episode</Tag>
                  <Tag tone="black">{featured.kind}</Tag>
                  {featured.duration && (
                    <span className="mono text-[11px] uppercase tracking-wide text-ink-500">
                      {featured.duration}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-ink leading-[0.92]">
                  {featured.title}
                </h2>
                <p className="mt-4 text-lg text-ink-600">{featured.description}</p>
                <div className="mt-4 mono text-[11px] uppercase tracking-wide text-ink-500">
                  {byline(featured.publishedAt)}
                </div>
              </div>
            </article>

            {rest.length > 0 && (
              <section>
                <SectionHeader title="All Episodes" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {rest.map((ep) => (
                    <EpisodeCard key={ep.id} episode={ep} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <EmptyState
            title="No episodes published yet"
            hint="The feed is warming up. Subscribe on your platform of choice to catch the first drop."
          />
        )}
      </Container>

      <div className="bg-ink text-paper py-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <span className="kicker text-btc">{SITE.mission}</span>
          <span className="mono text-[11px] uppercase tracking-wide text-ink-400">{SITE.disclaimer}</span>
        </Container>
      </div>
    </>
  );
}
