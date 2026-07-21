"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "@/actions/auth";
import { Container, Button } from "@/components/ui";
import { Field } from "../login/page";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, null);

  return (
    <Container className="py-16 max-w-md">
      <div className="border-2 border-ink bg-paper p-8">
        <h1 className="font-display text-4xl text-ink">Join the Watch</h1>
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-2">
          Report scams · verify entries · protect the community
        </p>
        <form action={action} className="mt-6 space-y-4">
          <Field label="Display name" name="displayName" autoComplete="name" />
          <Field label="Username" name="username" hint="Letters, numbers, underscores" />
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field label="Password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters" />
          {state?.error && <p className="mono text-[12px] text-alert">{state.error}</p>}
          <Button type="submit" variant="primary" size="lg" full disabled={pending}>
            {pending ? "Creating account…" : "Create Account"}
          </Button>
        </form>
        <p className="mono text-[12px] text-ink-500 mt-5">
          Already a watchman?{" "}
          <Link href="/login" className="text-btc-dark underline">
            Log in
          </Link>
        </p>
      </div>
    </Container>
  );
}
