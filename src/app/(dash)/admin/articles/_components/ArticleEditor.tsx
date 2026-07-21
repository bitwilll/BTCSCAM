"use client";

import { useActionState, useState } from "react";
import { ARTICLE_CATEGORIES, SEVERITIES } from "@/lib/constants";
import type { CmsState } from "@/actions/cms";

export type ArticleInitial = {
  title?: string;
  dek?: string | null;
  body?: string;
  category?: string;
  kicker?: string | null;
  severity?: string;
  coverImageUrl?: string | null;
  coverLabel?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  readMinutes?: number;
  tags?: string[];
  isFeatured?: boolean;
  isDeveloping?: boolean;
  status?: string;
};

const inputCls =
  "w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:border-ink";
const labelCls = "kicker text-body-2 block mb-1.5";

export function ArticleEditor({
  action,
  initial = {},
  canPublish,
  submitLabel = "Save",
}: {
  action: (prev: CmsState, formData: FormData) => Promise<CmsState>;
  initial?: ArticleInitial;
  canPublish: boolean;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<CmsState, FormData>(action, null);
  const [cover, setCover] = useState(initial.coverImageUrl ?? "");

  return (
    <form action={formAction} className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Main column */}
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Headline / Title</label>
          <input name="title" defaultValue={initial.title} required className={`${inputCls} font-display text-2xl !py-3`} placeholder="The headline readers see" />
        </div>
        <div>
          <label className={labelCls}>Subtitle / Standfirst (dek)</label>
          <textarea name="dek" defaultValue={initial.dek ?? ""} rows={2} className={inputCls} placeholder="One or two sentences summarizing the story" />
        </div>
        <div>
          <label className={labelCls}>Body <span className="text-faint normal-case tracking-normal">— markdown: ## heading, **bold**, - list, &gt; quote</span></label>
          <textarea name="body" defaultValue={initial.body} required rows={20} className={`${inputCls} font-mono !text-[13px] leading-relaxed`} placeholder={"Write the article. Use\n\n## Section headings\n\nand paragraphs separated by blank lines."} />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-4">
        <div className="border border-rule bg-surface-dim p-4 space-y-4">
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" defaultValue={initial.status ?? "draft"} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              {canPublish && <option value="published">Published (live)</option>}
              <option value="archived">Archived</option>
            </select>
            {!canPublish && <p className="mono text-[10px] text-faint mt-1">Only editors can publish. Yours goes to review.</p>}
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="category" defaultValue={initial.category ?? "news"} className={inputCls}>
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kicker</label>
              <input name="kicker" defaultValue={initial.kicker ?? ""} className={inputCls} placeholder="INVESTIGATION" />
            </div>
            <div>
              <label className={labelCls}>Severity</label>
              <select name="severity" defaultValue={initial.severity ?? "none"} className={inputCls}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Read minutes</label>
            <input name="readMinutes" type="number" min={1} max={120} defaultValue={initial.readMinutes ?? 5} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tags <span className="text-faint normal-case tracking-normal">(comma separated)</span></label>
            <input name="tags" defaultValue={(initial.tags ?? []).join(", ")} className={inputCls} placeholder="ponzi, ethereum" />
          </div>
          <label className="flex items-center gap-2 kicker text-body-2">
            <input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured} /> Featured (lead story)
          </label>
          <label className="flex items-center gap-2 kicker text-body-2">
            <input type="checkbox" name="isDeveloping" defaultChecked={initial.isDeveloping} /> Developing strip
          </label>
        </div>

        <div className="border border-rule bg-surface-dim p-4 space-y-3">
          <div>
            <label className={labelCls}>Cover image URL</label>
            <input name="coverImageUrl" value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls} placeholder="https://…/photo.jpg" />
          </div>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="cover preview" className="w-full aspect-[16/9] object-cover border border-rule" />
          ) : (
            <div className="hatch w-full aspect-[16/9] flex items-center justify-center"><span className="kicker text-meta">no image — placeholder shown</span></div>
          )}
          <div>
            <label className={labelCls}>Placeholder label <span className="text-faint normal-case tracking-normal">(if no image)</span></label>
            <input name="coverLabel" defaultValue={initial.coverLabel ?? ""} className={inputCls} placeholder="[ photo: seized dashboard ]" />
          </div>
        </div>

        <div className="border border-rule bg-surface-dim p-4 space-y-3">
          <div className="kicker text-meta">Attribution (optional)</div>
          <input name="sourceName" defaultValue={initial.sourceName ?? ""} className={inputCls} placeholder="Source name" />
          <input name="sourceUrl" defaultValue={initial.sourceUrl ?? ""} className={inputCls} placeholder="https://source/original" />
        </div>

        {state?.error && <p className="mono text-[12px] text-danger">{state.error}</p>}
        <button type="submit" disabled={pending} className="kicker w-full bg-ink text-paper py-3.5 hover:bg-action-hover disabled:opacity-50">
          {pending ? "Saving…" : submitLabel}
        </button>
      </aside>
    </form>
  );
}
