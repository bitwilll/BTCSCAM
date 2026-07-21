import { Tag } from "@/components/ui";

const TONE: Record<string, "orange" | "green" | "outline" | "black"> = {
  active: "orange",
  planning: "outline",
  closed: "green",
};

const LABEL: Record<string, string> = {
  active: "Active operation",
  planning: "In planning",
  closed: "Closed · wrapped",
};

/** Broadsheet status chip for a sting operation. */
export function StatusTag({ status }: { status: string }) {
  return <Tag tone={TONE[status] ?? "black"}>{LABEL[status] ?? status}</Tag>;
}
