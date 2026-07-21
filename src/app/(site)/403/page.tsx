import type { Metadata } from "next";
import { Container, Kicker, ButtonLink } from "@/components/ui";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "403 — Access Restricted · BTCSCAM.COM",
  description: "You don't have the privileges required to view this area of BTCSCAM.COM.",
};

export default function ForbiddenPage() {
  return (
    <Container className="py-20 lg:py-28 fade-up">
      <div className="max-w-2xl">
        <Kicker color="red">Error 403</Kicker>
        <h1
          className="font-display text-ink mt-3"
          style={{ fontSize: "clamp(44px,7vw,84px)", lineHeight: 1.05, textWrap: "balance" }}
        >
          Access restricted
        </h1>
        <div className="border-t border-ink mt-6 pt-6">
          <p className="text-[18px] leading-[1.6] text-body-2" style={{ textWrap: "pretty" }}>
            You&rsquo;re signed in, but your account doesn&rsquo;t carry the privileges required to
            open this area. Staff consoles, moderation tools and admin panels are gated to specific
            roles on the Watch.
          </p>
          <p className="mt-4 text-[14px] text-meta uppercase tracking-[.02em] leading-[1.6]">
            If you believe this is a mistake, contact a manager or administrator to review your role
            and privileges.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary" size="md">
            Back to the front page
          </ButtonLink>
          <ButtonLink href="/desk" variant="ghost" size="md">
            Go to my desk
          </ButtonLink>
        </div>
        <p className="mt-10 text-[14px] text-faint uppercase tracking-[.05em]">{SITE.mission}</p>
      </div>
    </Container>
  );
}
