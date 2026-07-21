import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui";
import { byline } from "@/lib/format";
import { EpisodeRows, type CastEpisode } from "./_components/EpisodeRows";

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

  const rows: CastEpisode[] = episodes.map((e, i) => ({
    id: e.id,
    ep: `EP ${String(episodes.length - i).padStart(3, "0")}`,
    title: e.title,
    kind: e.kind,
    duration: e.duration,
    description: e.description,
    imageUrl: e.imageUrl,
    date: byline(e.publishedAt),
  }));

  return (
    <div className="fade-up">
      {/* ── Dark masthead, 4px brand rule (v4) ── */}
      <div className="bg-dark border-b-4 border-brand">
        <div className="max-w-[1100px] mx-auto px-6 py-12 flex flex-wrap items-center gap-7">
          {/* Wordmark tile */}
          <div
            className="flex-none w-[150px] h-[150px] bg-brand border border-paper flex flex-col items-center justify-center gap-0.5"
            aria-hidden="true"
          >
            <span className="font-display text-[32px] leading-none text-ink">SCAM</span>
            <span className="font-display text-[32px] leading-none text-ink line-through decoration-danger decoration-4">
              CAST
            </span>
          </div>
          <div className="min-w-0" style={{ flex: "1 1 320px" }}>
            <div className="font-sans font-bold text-[16px] tracking-[.05em] text-brand">
              THE CRYPTO PODCAST · NEW EPISODES FRIDAYS
            </div>
            <h1
              className="mt-2 font-sans font-bold text-paper tracking-[-0.02em]"
              style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1 }}
            >
              SCAMCAST
            </h1>
            <p className="mt-3 text-[16px] leading-[1.6] text-ticker max-w-[58ch]">
              Investigators, victims and the occasional reformed scammer — one scam mechanic per
              episode, taken apart slowly.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <span
                  key={p}
                  className="border border-dark-line text-ticker px-3 py-1.5 font-sans font-bold text-[16px] uppercase tracking-[.02em]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Episode list ── */}
      <div className="max-w-[1100px] mx-auto px-6 pt-[26px] pb-16">
        {rows.length === 0 ? (
          <EmptyState
            title="No episodes published yet"
            hint="The feed is warming up. Subscribe on your platform of choice to catch the first drop."
          />
        ) : (
          <>
            <EpisodeRows episodes={rows} />
            <div className="mt-6 text-[16px] text-meta">
              EVERY EPISODE SHIPS WITH A FULL TRANSCRIPT AND THE DATABASE ENTRIES IT REFERENCES.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
