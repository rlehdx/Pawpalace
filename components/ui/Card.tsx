import React, { useId } from "react";
import { cn } from "@/lib/utils";

/* ============================================
   BASE CARD
   ============================================ */
interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  as?: "div" | "article" | "section" | "li";
}

export function Card({
  className,
  children,
  hover = false,
  onClick,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl",
        "border border-slate-100",
        "shadow-card",
        hover && [
          "transition-all duration-300 ease-smooth",
          "hover:-translate-y-1.5 hover:shadow-lifted hover:border-amber-100",
          "cursor-pointer",
        ],
        className
      )}
    >
      {children}
    </Tag>
  );
}

/* ============================================
   CARD SUBCOMPONENTS
   ============================================ */
export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("px-6 pb-6 pt-4 mt-auto", className)}>
      {children}
    </div>
  );
}

/* ============================================
   STAR RATING
   ============================================ */
interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: StarRatingProps) {
  const uid = useId();

  const starSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          const gradientId = `${uid}-half-${i}`;
          return (
            <svg
              key={i}
              className={cn(
                starSize,
                filled ? "text-amber-400" : half ? "text-amber-300" : "text-slate-200"
              )}
              fill={half ? `url(#${gradientId})` : "currentColor"}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              {half && (
                <defs>
                  <linearGradient id={gradientId}>
                    <stop offset="50%" stopColor="#FCD34D" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
              )}
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className={cn(textSize, "text-slate-500 font-medium")}>
          {rating.toFixed(1)}
          <span className="text-slate-400 ml-0.5">
            ({reviewCount.toLocaleString()})
          </span>
        </span>
      )}
    </div>
  );
}

export default Card;
