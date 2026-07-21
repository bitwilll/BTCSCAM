"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/actions/account";
import { Button } from "@/components/ui";

const INPUT =
  "w-full border border-ink bg-paper px-3.5 py-3 text-[16px] font-sans focus:outline-none focus:bg-white";

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
        <span className="kicker block mb-2">Display name</span>
        <input
          name="displayName"
          type="text"
          defaultValue={displayName}
          required
          minLength={2}
          maxLength={48}
          autoComplete="name"
          className={INPUT}
        />
        <span className="mt-1.5 block text-[14px] text-meta">
          Shown on your bylines, threads and reports. 2–48 characters.
        </span>
      </label>

      <label className="block">
        <span className="kicker block mb-2">Byline title</span>
        <input
          name="title"
          type="text"
          defaultValue={title}
          maxLength={80}
          readOnly={!isStaff}
          aria-readonly={!isStaff}
          placeholder={isStaff ? "e.g. Chief Investigations Editor" : "Assigned by staff"}
          className={
            isStaff
              ? INPUT
              : "w-full border border-rule bg-surface-alt px-3.5 py-3 text-[16px] font-sans text-meta cursor-not-allowed focus:outline-none"
          }
        />
        <span className="mt-1.5 block text-[14px] text-meta">
          {isStaff
            ? "Your masthead title. Appears next to your byline."
            : "Titles are assigned by the newsroom — members cannot edit this."}
        </span>
      </label>

      <label className="block">
        <span className="kicker block mb-2">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio}
          rows={5}
          maxLength={500}
          placeholder="A short line about who you are and what you watch for."
          className={`${INPUT} leading-[1.6] resize-y`}
        />
        <span className="mt-1.5 block text-[14px] text-meta">Up to 500 characters.</span>
      </label>

      {state?.error && (
        <p role="alert" className="text-[14px] font-bold text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p role="status" className="text-[14px] font-bold text-safe">
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
