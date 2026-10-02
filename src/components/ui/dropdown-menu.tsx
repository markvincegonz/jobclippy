"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] rounded-md border border-hairline bg-surface-3 p-1 text-ink shadow-none animate-in fade-in-80 zoom-in-95",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-xs px-2.5 py-1.5 text-xs font-normal text-ink outline-none transition-colors hover:bg-surface-2 hover:text-ink",
        destructive && "text-destructive hover:bg-destructive/15 hover:text-destructive",
        className
      )}
    >
      {children}
    </div>
  );
}
