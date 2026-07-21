"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type AuthState } from "@/actions/auth";
import { Container, Button } from "@/components/ui";

function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);
  const next = useSearchParams().get("next") ?? "";

  return (
    <Container className="py-16 max-w-md">
      <div className="border-2 border-ink bg-paper p-8">
        <h1 className="font-display text-4xl text-ink">Log In</h1>
        <p className="mono text-[11px] uppercase tracking-wide text-ink-500 mt-2">
          Community-verified scam intelligence
        </p>
        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Email or username" name="identifier" type="text" autoComplete="username" />
          <Field label="Password" name="password" type="password" autoComplete="current-password" />
          {state?.error && <p className="mono text-[12px] text-alert">{state.error}</p>}
          <Button type="submit" variant="primary" size="lg" full disabled={pending}>
            {pending ? "Signing in…" : "Log In"}
          </Button>
        </form>
        <p className="mono text-[12px] text-ink-500 mt-5">
          No account?{" "}
          <Link href="/register" className="text-btc-dark underline">
            Register
          </Link>
        </p>
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
      <span className="kicker text-ink-600 block mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full border border-line-strong bg-paper-2 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
      {hint && <span className="mono text-[10px] text-ink-400 mt-1 block">{hint}</span>}
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
