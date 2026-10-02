"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#010102]/85 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <div className="w-screen max-w-xl border-l border-hairline bg-surface-1 p-6 text-ink shadow-none flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-left pb-4 border-b border-hairline", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-medium tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-ink-muted", className)}
      {...props}
    />
  );
}

export function SheetClose({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute right-4 top-4 rounded-md p-1.5 text-ink-muted opacity-70 transition-opacity hover:opacity-100 hover:text-ink hover:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-primary-focus cursor-pointer",
        className
      )}
      aria-label="Close panel"
    >
      <X className="h-5 w-5" />
    </button>
  );
}
