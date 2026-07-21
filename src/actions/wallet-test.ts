"use server";

import { prisma } from "@/lib/db";
import { toStrArray } from "@/lib/format";

export type WalletTestResult =
  | { state: "invalid" }
  | { state: "clean" }
  | {
      state: "flagged";
      hit: { slug: string; name: string; type: string; status: string; severity: string };
    };

/**
 * Check an address or domain against every tracked scam entry:
 * exact match on linked wallet addresses, plus name/domain substring match.
 */
export async function testWallet(query: string): Promise<WalletTestResult> {
  const q = query.trim();
  // Too short to be a real address or domain
  if (q.length < 8) return { state: "invalid" };

  const norm = q.toLowerCase();
  const entries = await prisma.scamEntry.findMany({
    select: { slug: true, name: true, type: true, status: true, severity: true, addresses: true },
  });

  for (const e of entries) {
    const addrs = toStrArray(e.addresses).map((a) => a.toLowerCase());
    const nameHit = norm.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(norm);
    const addrHit = addrs.some((a) => a === norm || (a.length > 12 && norm.includes(a)));
    if (addrHit || (q.includes(".") && nameHit)) {
      return {
        state: "flagged",
        hit: { slug: e.slug, name: e.name, type: e.type, status: e.status, severity: e.severity },
      };
    }
  }
  return { state: "clean" };
}
