import type { Metadata } from "next";
import { Container, Kicker, ButtonLink } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "403 — Access Restricted · BTCSCAM.COM",
  description: "You don't have the privileges required to view this area of BTCSCAM.COM.",
};

export default function ForbiddenPage() {
  return (
    <Container className="py-20 lg:py-28">
      <div className="max-w-2xl">
        <Kicker color="red">Error 403</Kicker>
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-ink leading-[0.85] mt-3">
          Access Restricted
        </h1>
        <div className="border-t-2 border-ink mt-6 pt-6">
          <p className="text-lg text-ink-700 leading-relaxed">
            You&rsquo;re signed in, but your account doesn&rsquo;t carry the privileges required to
            open this area. Staff consoles, moderation tools and admin panels are gated to specific
            roles on the Watch.
          </p>
          <p className="mono text-[12px] text-ink-500 uppercase tracking-wide mt-4 leading-relaxed">
            If you believe this is a mistake, contact a manager or administrator to review your role
            and privileges.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary" size="md">
            Back to the front page
          </ButtonLink>
          <ButtonLink href="/desk" variant="outline" size="md">
            Go to My Desk
          </ButtonLink>
        </div>
        <p className="mono text-[11px] text-ink-400 uppercase tracking-wide mt-10">
          {SITE.mission}
        </p>
      </div>
    </Container>
  );
}
