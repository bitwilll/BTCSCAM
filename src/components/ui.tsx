import Link from "next/link";
import type { ReactNode } from "react";

// ─── Kicker: 700 14px Geist all-caps .05em (v4) ───
export function Kicker({
  children,
  color = "ink",
  className = "",
}: {
  children: ReactNode;
  color?: "ink" | "orange" | "accent" | "red" | "muted" | "green" | "brand";
  className?: string;
}) {
  const c = {
    ink: "text-ink",
    // "orange" historically meant the accent; v4 splits brand (logo-only) from accent links
    orange: "text-accent",
    accent: "text-accent",
    brand: "text-brand",
    red: "text-danger",
    muted: "text-meta",
    green: "text-safe",
  }[color];
  return <span className={`kicker ${c} ${className}`}>{children}</span>;
}

// ─── Chip / tag: 3px 9px · 700 14px (v4 recipe) ───
export function Tag({
  children,
  tone = "black",
  className = "",
}: {
  children: ReactNode;
  tone?:
    | "black"
    | "red"
    | "red-soft"
    | "green"
    | "warn"
    | "neutral"
    | "outline"
    | "paper"
    | "orange";
  className?: string;
}) {
  const tones: Record<string, string> = {
    black: "bg-ink text-paper",
    red: "bg-danger text-white",
    "red-soft": "bg-danger-soft text-danger-soft-fg",
    green: "bg-safe text-white",
    warn: "bg-warn text-warn-fg",
    neutral: "bg-surface-alt text-meta",
    paper: "bg-paper text-ink border border-rule",
    outline: "bg-transparent text-ink border border-ink",
    // legacy alias — v4 forbids orange chips; map to ink
    orange: "bg-ink text-paper",
  };
  return (
    <span
      className={`inline-flex items-center px-[9px] py-[3px] font-sans font-bold text-[14px] leading-tight tracking-[.05em] uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// v4 severity chips: CRITICAL solid red/white · HIGH soft red · MEDIUM sand · LOW dim
const SEVERITY_TONE: Record<string, "red" | "red-soft" | "neutral" | "black"> = {
  critical: "red",
  high: "red-soft",
  medium: "neutral",
  elevated: "neutral",
  low: "neutral",
};

export function SeverityTag({ severity }: { severity: string }) {
  if (!severity || severity === "none") return null;
  return <Tag tone={SEVERITY_TONE[severity.toLowerCase()] ?? "neutral"}>{severity}</Tag>;
}

// ─── Buttons (v4 recipes) ───
// primary  = ink solid, hover #3A3833
// ghost    = transparent, 1px ink border, hover fill ink
// quiet    = borderless, hover surface-alt
// danger   = red outline text
type BtnCommon = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "quiet" | "danger" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
};

function btnClasses({ variant = "primary", size = "md", full }: BtnCommon) {
  const variants: Record<string, string> = {
    primary: "bg-ink text-paper border border-ink hover:bg-action-hover",
    ghost: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
    quiet: "bg-transparent text-body-2 border border-transparent hover:bg-surface-alt hover:text-ink",
    danger: "bg-transparent text-danger border border-danger hover:bg-danger hover:text-white",
    // legacy aliases
    dark: "bg-ink text-paper border border-ink hover:bg-action-hover",
    outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  };
  const sizes: Record<string, string> = {
    sm: "px-3.5 py-2 text-[14px]",
    md: "px-4 py-2.5 text-[14px]",
    lg: "px-5.5 py-3.5 text-[14px]",
  };
  return `inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[.05em] cursor-pointer ${
    variants[variant]
  } ${sizes[size]} ${full ? "w-full" : ""}`;
}

export function ButtonLink({ href, ...props }: BtnCommon & { href: string }) {
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

// ─── Section header: LABEL ——————— (v4 pattern) ───
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
    <div className={`flex items-center gap-[18px] mb-5 ${className}`}>
      <h2 className="kicker text-ink shrink-0">{title}</h2>
      <div className="flex-1 border-t border-ink" />
      {action && (
        <Link href={action.href} className="kicker text-meta hover:text-ink shrink-0">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

// ─── Media block: flat surface-alt, or a real image when src is set (v4) ───
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
      <div
        className={`overflow-hidden bg-surface-alt bg-cover bg-center ${className}`}
        style={{ aspectRatio: ratio, backgroundImage: `url(${src})` }}
        role="img"
        aria-label={alt ?? label.replace(/[[\]]/g, "").trim()}
      />
    );
  }
  return (
    <div
      className={`${dark ? "hatch-dark" : "bg-surface-alt"} flex items-center justify-center overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label.replace(/[[\]]/g, "").trim()}
    >
      <span className={`eyebrow px-3 text-center ${dark ? "text-faint" : ""}`}>{label}</span>
    </div>
  );
}

// ─── Stat block (dark, mono numerals — v4 "FROM THE DATABASE") ───
export function StatBlock({
  label,
  value,
  sub,
  tone = "ink",
  dark = false,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "ink" | "red" | "orange" | "accent";
  dark?: boolean;
}) {
  if (dark) {
    return (
      <div className="bg-dark p-5">
        <div className="kicker text-ticker">{label}</div>
        <div className="mt-2 mono font-black text-[32px] text-down">{value}</div>
        {sub && <div className="mt-0.5 text-[14px] text-ticker">{sub}</div>}
      </div>
    );
  }
  const vc = { ink: "text-ink", red: "text-danger", orange: "text-accent", accent: "text-accent" }[
    tone
  ];
  return (
    <div className="border border-rule bg-surface-dim p-4">
      <div className="eyebrow mb-1">{label}</div>
      <div className={`mono font-black text-[32px] ${vc}`}>{value}</div>
      {sub && <div className="text-[14px] text-meta mt-1">{sub}</div>}
    </div>
  );
}

// ─── Avatar: paper square, 1px ink border, 700 Geist initials (v4) ───
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center bg-paper text-ink border border-ink font-sans font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
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
    <div className="border border-rule bg-surface-dim p-10 text-center">
      <p className="font-display text-[24px] text-ink">{title}</p>
      {hint && <p className="text-[16px] text-meta mt-2 max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// ─── Content shell (v4 uses 1140 for editorial, 1360 for wide screens) ───
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
    <div
      className={`mx-auto w-full ${wide ? "max-w-[1360px]" : "max-w-[1140px]"} px-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Page header (interior pages): Fraunces clamp title ───
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
    <header className="border-b border-ink pb-6 mb-8 fade-up">
      {kicker && (
        <div className="mb-2">
          <Kicker color="muted">{kicker}</Kicker>
        </div>
      )}
      <h1
        className="font-display text-ink"
        style={{ fontSize: "clamp(32px,4.5vw,52px)", lineHeight: 1.12, textWrap: "balance" }}
      >
        {title}
      </h1>
      {lede && (
        <p className="mt-4 max-w-2xl text-[18px] leading-[1.6] text-body-2" style={{ textWrap: "pretty" }}>
          {lede}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
