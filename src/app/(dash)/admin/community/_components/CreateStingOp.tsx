"use client";

import { createStingOp } from "@/actions/admin-ops";
import { CreateCard, Field, TextArea, Select } from "./formkit";

const STING_STATUSES = ["active", "closed", "planning"] as const;

export function CreateStingOp() {
  return (
    <CreateCard title="New Sting Operation" action={createStingOp} submitLabel="Create Operation">
      <Field label="Title" name="title" required placeholder="Operation Cold Wallet" />
      <Select label="Status" name="status" options={STING_STATUSES} defaultValue="active" />
      <TextArea label="Summary" name="summary" required placeholder="What the operation targets…" />
      <TextArea label="Body (optional)" name="body" rows={4} placeholder="Full write-up, methodology…" />
    </CreateCard>
  );
}
