import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "amber" | "emerald" | "red" | "blue" | "purple" | "slate" | "outline";
type BadgeSize    = "xs" | "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  amber:   "bg-amber-100 text-amber-700 border border-amber-200",
  emerald: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  red:     "bg-red-100 text-red-700 border border-red-200",
  blue:    "bg-blue-100 text-blue-700 border border-blue-200",
  purple:  "bg-purple-100 text-purple-700 border border-purple-200",
  slate:   "bg-slate-100 text-slate-600 border border-slate-200",
  outline: "bg-transparent text-slate-600 border border-slate-300",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "px-1.5 py-0.5 text-2xs",
  sm: "px-2   py-0.5 text-xs",
  md: "px-2.5 py-1   text-xs",
};

const BADGE_LABEL: Record<string, { variant: BadgeVariant; label: string }> = {
  new:        { variant: "emerald", label: "New" },
  sale:       { variant: "red",     label: "Sale" },
  bestseller: { variant: "amber",   label: "Best Seller" },
  limited:    { variant: "purple",  label: "Limited" },
};

/** Semantic product badge (new / sale / bestseller / limited) */
export function ProductBadge({ type }: { type: string }) {
  const config = BADGE_LABEL[type];
  if (!config) return null;
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export function Badge({
  variant = "slate",
  size = "sm",
  className,
  children,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "font-body font-semibold uppercase tracking-widest",
        "rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
