import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui";

// v4 masthead: warm #FEF3E2 band — SUBSCRIBE (ghost) · centered wordmark · WALLET TEST (ghost)
export function Masthead() {
  return (
    <div className="bg-masthead">
      <div className="mx-auto max-w-[1280px] px-6 py-5 flex items-center justify-between gap-x-5 gap-y-3 flex-wrap">
        <ButtonLink href="/subscribe" variant="ghost" size="md" className="order-1">
          Subscribe
        </ButtonLink>
        <Link
          href="/"
          aria-label="BTCSCAM.COM home"
          className="order-2 block text-center flex-1 min-w-0 hover:no-underline"
        >
          <Wordmark size="lg" asLink={false} />
        </Link>
        <ButtonLink href="/wallet-test" variant="ghost" size="md" className="order-3">
          Wallet Test
        </ButtonLink>
      </div>
    </div>
  );
}

// Kept for compatibility with the old layout import — v4 has no separate dateline bar.
export function Dateline() {
  return null;
}
