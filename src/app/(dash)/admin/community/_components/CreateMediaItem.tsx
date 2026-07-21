"use client";

import { createMediaItem } from "@/actions/admin-ops";
import { CreateCard, Field, TextArea, Select } from "./formkit";

const MEDIA_KINDS = ["podcast", "video"] as const;

export function CreateMediaItem() {
  return (
    <CreateCard title="New Media Item" action={createMediaItem} submitLabel="Publish Item">
      <Field label="Title" name="title" required placeholder="ScamCast Ep. 42 — …" />
      <Select label="Kind" name="kind" options={MEDIA_KINDS} defaultValue="podcast" />
      <Field label="Duration (optional)" name="duration" placeholder="42:10" />
      <TextArea label="Description" name="description" required placeholder="Episode summary…" />
    </CreateCard>
  );
}
