"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/actions/account";
import { Button } from "@/components/ui";

export function ProfileForm({
  displayName,
  bio,
  title,
  isStaff,
}: {
  displayName: string;
  bio: string;
  title: string;
  isStaff: boolean;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, null);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Display name</span>
        <input
          name="displayName"
          type="text"
          defaultValue={displayName}
          required
          minLength={2}
          maxLength={48}
          autoComplete="name"
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
        <span className="mono text-[10px] text-ink-400 mt-1 block">
          Shown on your bylines, threads and reports. 2–48 characters.
        </span>
      </label>

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Byline title</span>
        <input
          name="title"
          type="text"
          defaultValue={title}
          maxLength={80}
          readOnly={!isStaff}
          aria-readonly={!isStaff}
          placeholder={isStaff ? "e.g. Chief Investigations Editor" : "Assigned by staff"}
          className={`w-full border border-line-strong px-3 py-2.5 text-sm focus:outline-none focus:border-ink ${
            isStaff ? "bg-paper-2" : "bg-panel text-ink-500 cursor-not-allowed"
          }`}
        />
        <span className="mono text-[10px] text-ink-400 mt-1 block">
          {isStaff
            ? "Your masthead title. Appears next to your byline."
            : "Titles are assigned by the newsroom — members cannot edit this."}
        </span>
      </label>

      <label className="block">
        <span className="kicker text-ink-600 block mb-1.5">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio}
          rows={5}
          maxLength={500}
          placeholder="A short line about who you are and what you watch for."
          className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-ink resize-y"
        />
        <span className="mono text-[10px] text-ink-400 mt-1 block">Up to 500 characters.</span>
      </label>

      {state?.error && (
        <p role="alert" className="mono text-[12px] text-alert-strong">
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p role="status" className="mono text-[12px] text-up">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
