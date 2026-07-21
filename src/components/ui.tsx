import Link from "next/link";
import type { ReactNode } from "react";

// ─── Kicker (mono uppercase label) ───
export function Kicker({
  children,
  color = "ink",
  className = "",
}: {
  children: ReactNode;
  color?: "ink" | "orange" | "red" | "muted" | "green";
  className?: string;
}) {
  const c = {
    ink: "text-ink",
    orange: "text-btc-dark",
    red: "text-alert-strong",
    muted: "text-ink-500",
    green: "text-up",
  }[color];
  return <span className={`kicker ${c} ${className}`}>{children}</span>;
}

// ─── Tag / badge (solid fill rectangle) ───
export function Tag({
  children,
  tone = "black",
  className = "",
}: {
  children: ReactNode;
  tone?: "black" | "orange" | "red" | "green" | "outline" | "paper";
  className?: string;
}) {
  const tones: Record<string, string> = {
    black: "bg-ink text-paper",
    orange: "bg-btc text-black",
    red: "bg-alert-strong text-white",
    green: "bg-up text-black",
    paper: "bg-paper text-ink border border-line-strong",
    outline: "bg-transparent text-ink border border-ink",
  };
  return (
    <span
      className={`kicker inline-flex items-center px-2 py-[3px] leading-none ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const SEVERITY_TONE: Record<string, "orange" | "red" | "black"> = {
  elevated: "orange",
  high: "orange",
  critical: "red",
  none: "black",
};

export function SeverityTag({ severity }: { severity: string }) {
  if (severity === "none") return null;
  return <Tag tone={SEVERITY_TONE[severity] ?? "orange"}>{severity}</Tag>;
}

// ─── Button (link or button, sharp broadsheet style) ───
type BtnCommon = {
  children: ReactNode;
  variant?: "primary" | "dark" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
};

function btnClasses({ variant = "dark", size = "md", full }: BtnCommon) {
  const variants: Record<string, string> = {
    primary: "bg-btc text-black hover:bg-btc-dark hover:text-white",
    dark: "bg-ink text-paper hover:bg-ink-800",
    outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
    ghost: "bg-transparent text-ink hover:bg-panel",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3.5 text-sm",
  };
  return `kicker inline-flex items-center justify-center gap-2 transition-colors ${
    variants[variant]
  } ${sizes[size]} ${full ? "w-full" : ""}`;
}

export function ButtonLink({
  href,
  ...props
}: BtnCommon & { href: string }) {
  return (
    <Link href={href} className={`${btnClasses(props)} ${props.className ?? ""}`}>
      {props.children}
    </Link>
  );
}

export function Button({
  type = "button",
  disabled,
  name,
  value,
  ...props
}: BtnCommon & {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type={type}
      name={name}
      value={value}
      disabled={disabled}
      className={`${btnClasses(props)} disabled:opacity-50 disabled:cursor-not-allowed ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </button>
  );
}

// ─── Section header (label + heavy rule + optional action) ───
export function SectionHeader({
  title,
  action,
  className = "",
}: {
  title: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-4 section-rule pb-2 mb-5 ${className}`}>
      <h2 className="kicker text-sm !tracking-[0.16em]">{title}</h2>
      {action && (
        <Link href={action.href} className="kicker text-btc-dark hover:text-ink shrink-0">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

// ─── Media placeholder (hatched box) — renders a real image when `src` is set ───
export function MediaPlaceholder({
  label,
  src,
  alt,
  ratio = "16/9",
  dark = false,
  className = "",
}: {
  label: string;
  src?: string | null;
  alt?: string;
  ratio?: string;
  dark?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`overflow-hidden bg-panel ${className}`} style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? label.replace(/[[\]]/g, "").trim()}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`${dark ? "hatch-dark" : "hatch"} flex items-center justify-center overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span
        className={`kicker px-3 text-center ${dark ? "text-ink-400" : "text-ink-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Stat block ───
export function StatBlock({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "ink" | "red" | "orange";
}) {
  const vc = { ink: "text-ink", red: "text-alert-strong", orange: "text-btc-dark" }[tone];
  return (
    <div className="border border-line bg-paper-2 p-4">
      <div className="eyebrow mb-1">{label}</div>
      <div className={`font-display text-4xl ${vc}`}>{value}</div>
      {sub && <div className="mono text-[11px] text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Avatar (initial chip) ───
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center bg-ink text-paper font-display shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  );
}

// ─── Empty state ───
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line-strong bg-paper-2 p-10 text-center">
      <p className="font-display text-2xl text-ink-700">{title}</p>
      {hint && <p className="mono text-sm text-ink-500 mt-2 max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// ─── Content shell ───
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-[1400px]" : "max-w-[1240px]"} px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Page header (interior pages) ───
export function PageHeader({
  kicker,
  title,
  lede,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b-2 border-ink pb-6 mb-8">
      {kicker && <div className="mb-2"><Kicker color="orange">{kicker}</Kicker></div>}
      <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[0.9]">{title}</h1>
      {lede && <p className="mt-4 max-w-2xl text-lg text-ink-600">{lede}</p>}
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
