"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error:   <AlertCircle size={18} className="text-red-500" />,
  info:    <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const toastBg: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error:   "border-red-200 bg-red-50",
  info:    "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
};

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border shadow-lifted",
        "animate-fade-up animate-fill-both",
        "min-w-[300px] max-w-[400px]",
        toastBg[toast.type]
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="알림 닫기"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div
        aria-label="알림"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} dismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
