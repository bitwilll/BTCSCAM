"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroSlide = {
  slug: string;
  title: string;
  dek: string | null;
  kicker: string;
  severity: string;
  image: string | null;
  byline: string;
  credit: string | null;
};

const SEV_COLOR: Record<string, string> = {
  critical: "#D2322E",
  high: "#E0574F",
  elevated: "#C9A227",
};

const ROTATE_MS = 6000;

// Full-bleed homepage hero that auto-advances through the latest headlines every 6s.
// Crossfades between slides; pauses on hover/focus and under reduced-motion.
export function NewsCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback((k: number) => setActive(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || reduced.current || n <= 1) return;
    const t = setInterval(() => setActive((p) => (p + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  if (n === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Latest headlines"
      className="relative block w-screen overflow-hidden"
      style={{
        marginLeft: "calc(50% - 50vw)",
        minHeight: "calc(100vh - 220px)",
        backgroundColor: "#101010",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <Link
          key={s.slug}
          href={`/article/${s.slug}`}
          aria-hidden={idx !== active}
          tabIndex={idx === active ? 0 : -1}
          className="absolute inset-0 flex items-end justify-center transition-opacity duration-700 ease-out hover:no-underline"
          style={{
            opacity: idx === active ? 1 : 0,
            pointerEvents: idx === active ? "auto" : "none",
            backgroundColor: "#101010",
            backgroundImage: `linear-gradient(to top, rgba(10,10,8,.9) 0%, rgba(10,10,8,.5) 45%, rgba(10,10,8,.18) 100%)${
              s.image ? `, url(${s.image})` : ""
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full max-w-[1140px] px-6">
            <div className="py-10" style={{ paddingInline: "clamp(24px,4vw,48px)" }}>
              <div className="flex items-center gap-3">
                <span className="kicker text-brand">{s.kicker}</span>
                {s.severity && s.severity !== "none" && (
                  <span
                    className="text-[11px] font-bold uppercase tracking-[.08em] text-white px-2 py-[3px]"
                    style={{ background: SEV_COLOR[s.severity] ?? "#E0574F" }}
                  >
                    {s.severity}
                  </span>
                )}
              </div>
              <span
                className="block mt-3.5 font-display text-paper max-w-[22ch]"
                style={{ fontSize: "clamp(32px,4.5vw,54px)", lineHeight: 1.1, textWrap: "balance" }}
              >
                {s.title}
              </span>
              {s.dek && (
                <p
                  className="mt-4 text-[18px] leading-[1.6] max-w-[52ch]"
                  style={{ color: "rgba(252,251,249,.85)", textWrap: "pretty" }}
                >
                  {s.dek}
                </p>
              )}
              <div
                className="mt-4 text-[14px] tracking-[.05em] uppercase"
                style={{ color: "rgba(252,251,249,.65)" }}
              >
                {s.byline}
                {s.credit ? ` · ${s.credit}` : ""}
              </div>
            </div>
          </div>
        </Link>
      ))}

      {n > 1 && (
        <>
          {/* progress dots */}
          <div
            className="absolute z-10 flex gap-2"
            style={{ left: "clamp(24px,4vw,48px)", bottom: 22 }}
          >
            {slides.map((s, idx) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Show headline ${idx + 1} of ${n}`}
                aria-current={idx === active}
                onClick={() => go(idx)}
                className="h-[6px] rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: idx === active ? 30 : 10,
                  background: idx === active ? "#E8552D" : "rgba(252,251,249,.5)",
                }}
              />
            ))}
          </div>
          {/* prev / next */}
          <button
            type="button"
            aria-label="Previous headline"
            onClick={() => go(active - 1)}
            className="absolute z-10 top-1/2 -translate-y-1/2 left-2 sm:left-4 w-11 h-11 grid place-items-center text-[30px] leading-none text-paper/70 hover:text-paper cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next headline"
            onClick={() => go(active + 1)}
            className="absolute z-10 top-1/2 -translate-y-1/2 right-2 sm:right-4 w-11 h-11 grid place-items-center text-[30px] leading-none text-paper/70 hover:text-paper cursor-pointer"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
