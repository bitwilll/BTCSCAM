"use client";

import { useState } from "react";

export type CastEpisode = {
  id: string;
  ep: string;
  title: string;
  kind: string;
  duration: string | null;
  description: string;
  imageUrl: string | null;
  date: string;
};

/** v4-sanctioned brand-fill control: PLAY = bg-brand text-ink · playing = bg-ink text-brand. */
function PlayButton({
  playing,
  onClick,
  label,
}: {
  playing: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={playing}
      aria-label={playing ? `Stop ${label}` : `Play ${label}`}
      className={`flex-none w-[92px] h-16 font-sans font-bold text-[16px] tracking-[.05em] border border-ink cursor-pointer ${
        playing ? "bg-ink text-brand" : "bg-brand text-ink"
      }`}
    >
      {playing ? "STOP" : "PLAY"}
    </button>
  );
}

function ProgressBar({ duration }: { duration: string | null }) {
  return (
    <div className="mt-2.5 flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-surface-alt border border-ink" aria-hidden="true">
        <div className="h-full w-[34%] bg-brand" />
      </div>
      <span className="text-[16px] text-meta">16:24 / {duration ?? "—"}</span>
    </div>
  );
}

export function EpisodeRows({ episodes }: { episodes: CastEpisode[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const toggle = (id: string) => setPlayingId((cur) => (cur === id ? null : id));

  const [featured, ...rest] = episodes;
  if (!featured) return null;

  const featPlaying = playingId === featured.id;

  return (
    <>
      {/* ── Latest episode, featured big ── */}
      <article className="mt-3.5 border border-ink bg-white grid md:grid-cols-2 items-stretch">
        <div
          className="bg-surface-alt bg-cover bg-center border-b md:border-b-0 md:border-r border-ink min-h-[220px]"
          style={featured.imageUrl ? { backgroundImage: `url(${featured.imageUrl})` } : undefined}
          role="img"
          aria-label={`Cover art: ${featured.title}`}
        />
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <div className="kicker text-accent">Latest episode</div>
          <div className="mono font-bold text-[14px] text-accent mt-2.5">
            {featured.ep} · {featured.date}
          </div>
          <h2
            className="font-display mt-1.5"
            style={{ fontSize: "clamp(24px,2.6vw,34px)", lineHeight: 1.15, textWrap: "balance" }}
          >
            {featured.title}
          </h2>
          <p className="mt-2.5 text-[16px] leading-[1.55] text-body-2" style={{ textWrap: "pretty" }}>
            {featured.description}
          </p>
          <div className="mt-2 text-[16px] text-meta uppercase tracking-[.02em]">
            {featured.kind}
            {featured.duration ? ` · ${featured.duration}` : ""}
          </div>
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <PlayButton
              playing={featPlaying}
              onClick={() => toggle(featured.id)}
              label={featured.title}
            />
            <span className="text-[16px] text-meta">TRANSCRIPT AVAILABLE</span>
          </div>
          {featPlaying && <ProgressBar duration={featured.duration} />}
        </div>
      </article>

      {/* ── Episode rows ── */}
      {rest.map((e) => {
        const playing = playingId === e.id;
        return (
          <div
            key={e.id}
            className="mt-3.5 border border-ink bg-white px-5 py-[18px] flex flex-wrap items-center gap-y-3.5 gap-x-5"
          >
            <PlayButton playing={playing} onClick={() => toggle(e.id)} label={e.title} />
            <div className="min-w-0" style={{ flex: "1 1 300px" }}>
              <div className="mono font-bold text-[14px] text-accent">
                {e.ep} · {e.date}
              </div>
              <div className="font-display text-[21px] leading-[1.25] mt-1">{e.title}</div>
              <div className="mt-1 text-[16px] text-meta uppercase tracking-[.02em]">
                {e.kind}
                {e.duration ? ` · ${e.duration}` : ""}
              </div>
              {playing && <ProgressBar duration={e.duration} />}
            </div>
            <span className="flex-none text-[16px] text-meta">TRANSCRIPT AVAILABLE</span>
          </div>
        );
      })}
    </>
  );
}
