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
    <Container className="py-16 max-w-md fade-up">
      <div className="border border-ink bg-paper p-8 text-center">
        <h1 className="font-display text-[32px] leading-[1.15] text-ink">
          Log out of BTCSCAM.COM?
        </h1>
        <p className="mt-3 text-[16px] leading-[1.6] text-meta">
          You can sign back in any time — your saved intel stays put.
        </p>
        <form action={logoutAction} className="mt-7">
          <Button type="submit" variant="primary" size="lg" full>
            Log out
          </Button>
        </form>
        <Link
          href="/desk"
          className="kicker text-accent hover:underline underline-offset-4 mt-5 inline-block"
        >
          ← Cancel, back to my desk
        </Link>
      </div>
    </Container>
  );
}
