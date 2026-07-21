"use client";

import { createScamArt } from "@/actions/admin-ops";
import { CreateCard, Field, TextArea } from "./formkit";

export function CreateScamArt() {
  return (
    <CreateCard title="New Scam Art" action={createScamArt} submitLabel="Add Artwork">
      <Field label="Title" name="title" required placeholder="The Doubler" />
      <Field label="Artist" name="artist" required placeholder="Anon" />
      <Field label="Image label" name="imageLabel" required placeholder="[ art: neon 'send 1 get 2' ]" />
      <TextArea label="Description (optional)" name="description" placeholder="Short note on the piece…" />
    </CreateCard>
  );
}
