import React from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  "🐾 Free Shipping Over $49",
  "🔒 Secure Payment",
  "↩️ Easy 30-Day Returns",
  "⭐ 4.9/5 Rating",
  "🌱 Eco Packaging",
  "💬 24/7 Support",
  "📦 Same-Day Dispatch",
  "🐶 Vet Recommended",
  "🏷️ Price Match Guarantee",
];

interface MarqueeBannerProps {
  className?: string;
  variant?: "amber" | "dark";
}

export function MarqueeBanner({ className, variant = "amber" }: MarqueeBannerProps) {
  // Duplicate items for seamless loop
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      className={cn(
        "w-full overflow-hidden py-4 select-none",
        variant === "amber"
          ? "bg-amber-500 text-white"
          : "bg-slate-900 text-amber-400",
        className
      )}
      aria-label="Site features ticker"
      aria-live="off"
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span className="text-sm font-semibold whitespace-nowrap px-3">
              {item}
            </span>
            <span
              className={cn(
                "text-xs opacity-50",
                variant === "amber" ? "text-amber-200" : "text-slate-600"
              )}
              aria-hidden="true"
            >
              •
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default MarqueeBanner;
