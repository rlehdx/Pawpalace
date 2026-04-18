"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      icon,
      iconPosition = "left",
      onIconClick,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasIcon = !!icon;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-amber-500" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {hasIcon && iconPosition === "left" && (
            <span
              onClick={onIconClick}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
                onIconClick
                  ? "cursor-pointer hover:text-amber-500 transition-colors"
                  : "pointer-events-none"
              )}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full font-body text-sm text-slate-900 placeholder:text-slate-400",
              "bg-white border rounded-xl",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              !error
                ? "border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-amber-200"
                : "border-red-300 hover:border-red-400 focus:border-red-400 focus:ring-red-200",
              hasIcon && iconPosition === "left"  ? "pl-10 pr-4 py-3" : "",
              hasIcon && iconPosition === "right" ? "pr-10 pl-4 py-3" : "",
              !hasIcon                            ? "px-4 py-3"       : "",
              className
            )}
            {...props}
          />

          {hasIcon && iconPosition === "right" && (
            <span
              onClick={onIconClick}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400",
                onIconClick
                  ? "cursor-pointer hover:text-amber-500 transition-colors"
                  : "pointer-events-none"
              )}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
        </div>

        {(hint || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-red-500" : "text-slate-500"
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
