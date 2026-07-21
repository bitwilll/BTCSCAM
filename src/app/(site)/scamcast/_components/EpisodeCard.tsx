import { MediaPlaceholder, Tag } from "@/components/ui";
import { byline } from "@/lib/format";

export type EpisodeLike = {
  id: string;
  title: string;
  kind: string;
  duration: string | null;
  description: string;
  publishedAt: Date | string;
};

export function EpisodeCard({ episode }: { episode: EpisodeLike }) {
  return (
    <article className="group flex flex-col">
      <div className="relative">
        <MediaPlaceholder label={`[ ${episode.kind}: cover art ]`} ratio="16/9" />
        {/* Play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center bg-btc text-black text-xl transition-colors group-hover:bg-ink group-hover:text-paper">
            ▶
          </span>
        </div>
        <div className="absolute left-2 top-2">
          <Tag tone="black">{episode.kind}</Tag>
        </div>
        {episode.duration && (
          <div className="absolute right-2 top-2 mono text-[11px] uppercase tracking-wide bg-ink text-paper px-2 py-[3px]">
            {episode.duration}
          </div>
        )}
      </div>

      <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-3">
        {byline(episode.publishedAt)}
      </div>
      <h3 className="font-extrabold text-ink leading-tight text-lg mt-1 group-hover:text-btc-dark">
        {episode.title}
      </h3>
      <p className="mt-2 text-sm text-ink-600 leading-snug">{episode.description}</p>
    </article>
  );
}
