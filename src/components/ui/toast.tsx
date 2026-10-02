"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "warning" | "destructive" | "undo";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  action?: ToastAction;
  duration?: number; // in ms
}

interface ToastContextType {
  toast: (props: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ duration = 5000, ...props }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, duration, ...props };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast viewport */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border border-hairline bg-surface-2 p-3.5 text-ink shadow-lg surface-lift transition-all animate-in slide-in-from-bottom-3 duration-200",
              t.type === "destructive" && "border-destructive/40 bg-surface-1",
              t.type === "undo" && "border-primary/40 bg-surface-2"
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-semantic-success" />}
              {t.type === "destructive" && <AlertCircle className="h-4 w-4 text-destructive" />}
              {t.type === "undo" && <Undo2 className="h-4 w-4 text-primary" />}
              {(!t.type || t.type === "default" || t.type === "warning") && (
                <Info className="h-4 w-4 text-ink-muted" />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink break-words">{t.title}</p>
              {t.description && (
                <p className="text-xs text-ink-muted mt-0.5 break-words">{t.description}</p>
              )}
            </div>

            {/* Action button (e.g. Undo) */}
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs px-2.5 py-1 font-medium transition-colors cursor-pointer"
              >
                {t.action.label}
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-xs p-0.5 text-ink-subtle hover:text-ink transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
