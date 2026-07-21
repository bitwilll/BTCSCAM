"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthState } from "@/actions/auth";
import { Container, Button, ButtonLink } from "@/components/ui";

function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);
  const next = useSearchParams().get("next") ?? "";

  return (
    <Container className="py-16 max-w-md fade-up">
      <div className="border border-ink bg-paper p-8">
        <div className="kicker text-meta">Member access</div>
        <h1 className="mt-2 font-display text-[32px] leading-[1.15] text-ink">Log in</h1>
        <p className="mt-2 text-[14px] text-meta uppercase tracking-[.05em]">
          Community-verified scam intelligence
        </p>
        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Email or username" name="identifier" type="text" autoComplete="username" />
          <Field label="Password" name="password" type="password" autoComplete="current-password" />
          {state?.error && (
            <p role="alert" className="text-[14px] font-bold text-danger">
              {state.error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" full disabled={pending}>
            {pending ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <div className="mt-6 border-t border-rule pt-5">
          <p className="text-[14px] text-meta uppercase tracking-[.05em]">No account yet?</p>
          <ButtonLink href="/register" variant="ghost" size="md" full className="mt-2.5">
            Join the watch
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="kicker block mb-2">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full border border-ink bg-paper px-3.5 py-3 text-[16px] font-sans focus:outline-none focus:bg-white"
      />
      {hint && <span className="mt-1.5 block text-[14px] text-meta">{hint}</span>}
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
