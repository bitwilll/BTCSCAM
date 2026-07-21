import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requirePrivilege } from "@/lib/guards";
import { PRIVILEGES as PV } from "@/lib/constants";
import { PageHeader, Tag, EmptyState } from "@/components/ui";
import { byline, dateline } from "@/lib/format";
import { CreateStingOp } from "./_components/CreateStingOp";
import { CreateGathering } from "./_components/CreateGathering";
import { CreateScamArt } from "./_components/CreateScamArt";
import { CreateMediaItem } from "./_components/CreateMediaItem";
import { CommunityDelete } from "./_components/CommunityDelete";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Content · Staff · BTCSCAM.COM",
  description: "Manage sting operations, gatherings, scam art and media items.",
};

const rowCls = "flex items-start justify-between gap-3 py-3 border-t border-line first:border-0";

export default async function CommunityAdminPage() {
  await requirePrivilege(PV.COMMUNITY_MANAGE);

  const [stings, gatherings, art, media] = await Promise.all([
    prisma.stingOperation.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.gathering.findMany({ orderBy: { startsAt: "asc" }, take: 50 }),
    prisma.scamArt.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.mediaItem.findMany({ orderBy: { publishedAt: "desc" }, take: 50 }),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Community"
        title="Community Content"
        lede="Publish and prune the community surface — sting operations, gatherings, scam art and the media library."
      />

      {/* Sting operations */}
      <Section title="Sting Operations">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="border border-line-strong bg-paper p-5">
            {stings.length === 0 ? (
              <EmptyState title="No operations" hint="Create the first sting operation." />
            ) : (
              <ul>
                {stings.map((s) => (
                  <li key={s.id} className={rowCls}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{s.title}</span>
                        <Tag tone={s.status === "active" ? "green" : s.status === "planning" ? "orange" : "outline"}>
                          {s.status}
                        </Tag>
                      </div>
                      <p className="mono text-[11px] text-ink-500 mt-1 line-clamp-2">{s.summary}</p>
                      <div className="mono text-[10px] text-ink-400 mt-1">{byline(s.createdAt)}</div>
                    </div>
                    <CommunityDelete kind="sting" id={s.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateStingOp />
        </div>
      </Section>

      {/* Gatherings */}
      <Section title="Gatherings">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="border border-line-strong bg-paper p-5">
            {gatherings.length === 0 ? (
              <EmptyState title="No gatherings" hint="Schedule the first meetup." />
            ) : (
              <ul>
                {gatherings.map((g) => (
                  <li key={g.id} className={rowCls}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{g.title}</span>
                        {g.isVirtual && <Tag tone="paper">virtual</Tag>}
                      </div>
                      <p className="mono text-[11px] text-ink-500 mt-1 line-clamp-2">{g.description}</p>
                      <div className="mono text-[10px] text-ink-400 mt-1">
                        {g.location} · {dateline(g.startsAt)}
                      </div>
                    </div>
                    <CommunityDelete kind="gathering" id={g.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateGathering />
        </div>
      </Section>

      {/* Scam art */}
      <Section title="Scam Art">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="border border-line-strong bg-paper p-5">
            {art.length === 0 ? (
              <EmptyState title="No artwork" hint="Add the first piece to the gallery." />
            ) : (
              <ul>
                {art.map((a) => (
                  <li key={a.id} className={rowCls}>
                    <div className="min-w-0">
                      <span className="font-bold text-ink">{a.title}</span>
                      <div className="mono text-[11px] text-ink-500 mt-1">by {a.artist}</div>
                      <div className="mono text-[10px] text-ink-400 mt-1">{a.imageLabel}</div>
                    </div>
                    <CommunityDelete kind="art" id={a.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateScamArt />
        </div>
      </Section>

      {/* Media */}
      <Section title="Media Library">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="border border-line-strong bg-paper p-5">
            {media.length === 0 ? (
              <EmptyState title="No media items" hint="Publish the first episode or video." />
            ) : (
              <ul>
                {media.map((m) => (
                  <li key={m.id} className={rowCls}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{m.title}</span>
                        <Tag tone={m.kind === "video" ? "orange" : "paper"}>{m.kind}</Tag>
                      </div>
                      <p className="mono text-[11px] text-ink-500 mt-1 line-clamp-2">{m.description}</p>
                      <div className="mono text-[10px] text-ink-400 mt-1">
                        {m.duration ? `${m.duration} · ` : ""}
                        {byline(m.publishedAt)}
                      </div>
                    </div>
                    <CommunityDelete kind="media" id={m.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateMediaItem />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}
