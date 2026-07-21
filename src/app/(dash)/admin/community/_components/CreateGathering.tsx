"use client";

import { createGathering } from "@/actions/admin-ops";
import { CreateCard, Field, TextArea, Checkbox } from "./formkit";

export function CreateGathering() {
  return (
    <CreateCard title="New Gathering" action={createGathering} submitLabel="Create Gathering">
      <Field label="Title" name="title" required placeholder="Watch Meetup — Lisbon" />
      <Field label="Location" name="location" required placeholder="Lisbon, PT (or Online)" />
      <Field label="Starts at" name="startsAt" type="datetime-local" required />
      <TextArea label="Description" name="description" required placeholder="What attendees can expect…" />
      <Checkbox label="Virtual event" name="isVirtual" />
    </CreateCard>
  );
}
