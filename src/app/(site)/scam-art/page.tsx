import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, PageHeader, SectionHeader, MediaPlaceholder, ButtonLink, EmptyState } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scam Art — BTCSCAM.COM",
  description:
    "A community gallery of satire, warning posters and protest art about crypto scams. Turning the playbook into a punchline.",
};

export default async function ScamArtPage() {
  const pieces = await prisma.scamArt.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Container className="py-10">
      <PageHeader
        kicker="Community · Gallery"
        title="Scam Art"
        lede="Scammers are slick by design — that is half of what makes them work. Scam Art is the community's answer: satire, warning posters and protest pieces that strip the shine off the playbook and make the red flags impossible to un-see."
      >
        <ButtonLink
          href="mailto:art@btcscam.com?subject=Scam%20Art%20submission"
          variant="primary"
          size="md"
        >
          Submit a piece
        </ButtonLink>
      </PageHeader>

      <SectionHeader title="The Collection" />

      {pieces.length === 0 ? (
        <EmptyState
          title="The gallery is being hung"
          hint="No pieces published yet. Send us your posters, memes and paintings — the sharpest work goes on the wall."
          action={
            <ButtonLink href="mailto:art@btcscam.com?subject=Scam%20Art%20submission">
              Submit your art
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {pieces.map((art) => (
            <figure key={art.id} className="flex flex-col">
              <MediaPlaceholder src={art.imageUrl} label={art.imageLabel} ratio="4/5" />
              <figcaption className="mt-3">
                <h3 className="font-display text-2xl text-ink leading-none">{art.title}</h3>
                <div className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-1.5">
                  By {art.artist}
                </div>
                {art.description && (
                  <p className="mt-2 text-sm text-ink-600 leading-snug">{art.description}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Submit CTA */}
      <div className="mt-14 border-2 border-ink bg-paper-2 p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="kicker text-btc-dark">Open call</span>
            <h2 className="font-display text-4xl text-ink leading-none mt-3">
              Make them the joke, not the aspiration.
            </h2>
            <p className="text-ink-600 mt-3 max-w-2xl">
              Painter, meme-lord, or poster designer — if it warns people off a scam and makes them
              smile, we want it. Selected pieces are featured here, printed for gatherings, and sold
              in the store to fund investigations.
            </p>
          </div>
          <ButtonLink
            href="mailto:art@btcscam.com?subject=Scam%20Art%20submission"
            variant="dark"
            size="lg"
          >
            Submit your work
          </ButtonLink>
        </div>
      </div>

      <p className="mono text-[11px] uppercase tracking-wide text-ink-400 mt-6 text-center">
        {SITE.disclaimer}
      </p>
    </Container>
  );
}
