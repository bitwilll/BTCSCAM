import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ButtonLink, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Art — BTCSCAM.COM",
  description:
    "A community gallery of satire, warning posters and protest art about crypto scams. Turning the playbook into a punchline.",
};

export default async function ScamArtPage() {
  const pieces = await prisma.scamArt.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-[1360px] mx-auto px-6 pt-9 pb-16 fade-up">
      {/* ── Gallery header (v4) ── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="min-w-0">
          <div className="kicker text-meta">Community gallery · Art + NFT showcase</div>
          <h1
            className="font-display mt-1.5"
            style={{ fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 1 }}
          >
            Scam Art
          </h1>
          <p className="mt-3 text-[18px] leading-[1.65] text-body-2 max-w-[64ch]">
            What losing everything to a promise looks like, made by the people it happened to.
            Physical work and NFTs, side by side.
          </p>
        </div>
        <ButtonLink
          href="mailto:art@btcscam.com?subject=Scam%20Art%20submission"
          variant="primary"
          size="lg"
        >
          Submit your work
        </ButtonLink>
      </div>

      {/* ── The wall (v4 grid) ── */}
      {pieces.length === 0 ? (
        <div className="mt-[26px]">
          <EmptyState
            title="The gallery is being hung"
            hint="No pieces published yet. Send us your posters, memes and paintings — the sharpest work goes on the wall."
            action={
              <ButtonLink href="mailto:art@btcscam.com?subject=Scam%20Art%20submission">
                Submit your art
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <div
          className="grid mt-[26px]"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 22 }}
        >
          {pieces.map((art) => (
            <figure
              key={art.id}
              className="border border-ink bg-white transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)]"
            >
              <div
                className="border-b border-ink bg-surface-alt bg-cover bg-center"
                style={{
                  aspectRatio: "4/5",
                  ...(art.imageUrl ? { backgroundImage: `url(${art.imageUrl})` } : {}),
                }}
                role="img"
                aria-label={`${art.title} by ${art.artist}`}
              />
              <figcaption className="px-4 py-3.5">
                <h3 className="font-display text-[21px]">{art.title}</h3>
                {art.description && (
                  <p
                    className="mt-1.5 text-[16px] leading-[1.55] text-body-2"
                    style={{ textWrap: "pretty" }}
                  >
                    {art.description}
                  </p>
                )}
                <div className="mt-2.5 pt-2.5 border-t border-rule flex justify-between gap-2.5 flex-wrap">
                  <span className="eyebrow text-body-2 font-semibold">{art.artist}</span>
                  <span className="eyebrow">{art.imageLabel}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* ── Open call band (v4) ── */}
      <div className="mt-[30px] border border-ink bg-dark px-6 py-5 flex flex-wrap items-center justify-between gap-y-3 gap-x-7">
        <span className="font-sans font-bold text-[16px] tracking-[.05em] text-brand">
          OPEN CALL — ISSUE 04 COVER
        </span>
        <span className="text-[16px] text-ticker">
          ARTISTS KEEP 70% OF SALES · 30% FUNDS THE WATCH
        </span>
      </div>
    </div>
  );
}
