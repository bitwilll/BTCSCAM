import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Container, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Log Out — BTCSCAM.COM",
  description: "Sign out of your BTCSCAM.COM account.",
};

export default function LogoutPage() {
  return (
    <Container className="py-16 max-w-md">
      <div className="border-2 border-ink bg-paper p-8 text-center">
        <h1 className="font-display text-4xl text-ink leading-none">Log out of BTCSCAM.COM?</h1>
        <p className="mono text-[12px] uppercase tracking-wide text-ink-500 mt-3">
          You can sign back in any time — your saved intel stays put.
        </p>
        <form action={logoutAction} className="mt-8">
          <Button type="submit" variant="dark" size="lg" full>
            Log out
          </Button>
        </form>
        <Link href="/desk" className="kicker text-btc-dark hover:text-ink mt-5 inline-block">
          ← Cancel, back to My Desk
        </Link>
      </div>
    </Container>
  );
}
