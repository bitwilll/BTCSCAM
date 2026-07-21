// v4 Trust Score helpers — TS 0–100 derived from stored reputation.
export function trustScore(reputation?: number | null): number {
  return Math.max(0, Math.min(100, reputation ?? 0));
}

// v4 tier ladder (see design-source/v4.dc.html)
export function trustTier(ts: number): string {
  return ts >= 90 ? "GUARDIAN" : ts >= 70 ? "SENTINEL" : ts >= 40 ? "VERIFIER" : "WATCHMAN";
}

export const TRUST_TITLE =
  "Trust Score 0–100 — earned through verified reports and confirmed replies";
