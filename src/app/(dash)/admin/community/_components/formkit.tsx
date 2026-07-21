"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { Result } from "@/actions/admin-ops";

export const inputCls =
  "w-full border border-ink bg-surface-dim px-3 py-2 text-sm focus:outline-none focus:border-ink disabled:opacity-50";
const labelCls = "block";
const capCls = "kicker text-body-2 block mb-1";

export function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  hint,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={labelCls}>
      <span className={capCls}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
      />
      {hint && <span className="mono text-[10px] text-faint mt-1 block">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  rows = 3,
  required = false,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className={labelCls}>
      <span className={capCls}>{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
      />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  options: readonly string[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className={labelCls}>
      <span className={capCls}>{label}</span>
      <select name={name} defaultValue={defaultValue} disabled={disabled} className={inputCls}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/[-_]/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({
  label,
  name,
  disabled,
}: {
  label: string;
  name: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} disabled={disabled} className="accent-ink" />
      <span className="kicker text-body-2">{label}</span>
    </label>
  );
}

/** A titled card wrapping a create form. Resets fields on success. */
export function CreateCard({
  title,
  action,
  submitLabel,
  children,
}: {
  title: string;
  action: (formData: FormData) => Promise<Result>;
  submitLabel: string;
  children: ReactNode;
}) {
  const [state, dispatch, pending] = useActionState<Result | null, FormData>(
    async (_prev, formData) => action(formData),
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="border border-ink bg-paper p-5">
      <h3 className="kicker text-sm !tracking-[0.16em] section-rule pb-2 mb-4">{title}</h3>
      <form ref={formRef} action={dispatch} className="space-y-3">
        <fieldset disabled={pending} className="space-y-3">
          {children}
        </fieldset>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="kicker inline-flex items-center justify-center gap-2 bg-ink text-paper hover:bg-action-hover px-4 py-2.5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
          {state && (
            <span
              className={`mono text-[11px] ${state.ok ? "text-safe" : "text-danger"}`}
            >
              {state.ok ? "Created." : state.error ?? "Error"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
