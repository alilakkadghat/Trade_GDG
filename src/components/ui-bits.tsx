import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-lowest rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

type Tone = "neutral" | "success" | "warning" | "critical" | "info";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-surface-high text-foreground",
  success: "bg-secondary-container text-on-secondary-container",
  warning: "bg-warning-container text-on-warning-container",
  critical: "bg-destructive-container text-on-destructive-container",
  info: "bg-surface-high text-muted-foreground",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: Tone }) {
  const colors: Record<Tone, string> = {
    neutral: "bg-muted-foreground",
    success: "bg-secondary",
    warning: "bg-warning",
    critical: "bg-destructive",
    info: "bg-muted-foreground",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[tone]}`} />;
}

export function statusToTone(status: string): Tone {
  const s = status.toLowerCase();
  if (s.includes("transit") || s.includes("cleared") || s === "ok") return "success";
  if (s.includes("pending") || s.includes("warning")) return "warning";
  if (s.includes("delayed") || s.includes("mismatch") || s.includes("missing") || s.includes("critical"))
    return "critical";
  return "info";
}
