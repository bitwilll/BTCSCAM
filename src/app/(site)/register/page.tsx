"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/actions/auth";
import { Container, Button, ButtonLink } from "@/components/ui";
import { Field } from "../login/page";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, null);

  return (
    <Container className="py-16 max-w-md fade-up">
      <div className="border border-ink bg-paper p-8">
        <div className="kicker text-meta">Enlistment desk</div>
        <h1 className="mt-2 font-display text-[32px] leading-[1.15] text-ink">Join the watch</h1>
        <p className="mt-2 text-[14px] text-meta uppercase tracking-[.05em]">
          Report scams · verify entries · protect the community
        </p>
        <form action={action} className="mt-6 space-y-4">
          <Field label="Display name" name="displayName" autoComplete="name" />
          <Field label="Username" name="username" hint="Letters, numbers, underscores" />
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
          />
          {state?.error && (
            <p role="alert" className="text-[14px] font-bold text-danger">
              {state.error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" full disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <div className="mt-6 border-t border-rule pt-5">
          <p className="text-[14px] text-meta uppercase tracking-[.05em]">Already a watchman?</p>
          <ButtonLink href="/login" variant="ghost" size="md" full className="mt-2.5">
            Log in
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
