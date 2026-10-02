"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  className?: string;
}

const emptySubscribe = () => () => {};

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  side = "bottom",
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [coords, setCoords] = React.useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  }>({});

  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const getCoords = React.useCallback(() => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    const pos: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    } = {};

    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldPlaceTop =
      side === "top" || (side === "bottom" && spaceBelow < 220 && rect.top > 220);

    if (shouldPlaceTop) {
      pos.bottom = Math.max(8, window.innerHeight - rect.top + 4);
    } else {
      pos.top = Math.max(8, rect.bottom + 4);
    }

    if (align === "right") {
      pos.right = Math.max(8, window.innerWidth - rect.right);
    } else {
      if (rect.left + 180 > window.innerWidth) {
        pos.right = 8;
      } else {
        pos.left = Math.max(8, rect.left);
      }
    }

    return pos;
  }, [align, side]);

  React.useEffect(() => {
    if (!open) return;

    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setCoords(getCoords());
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, getCoords]);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) {
      setCoords(getCoords());
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={triggerRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {open &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              zIndex: 9999,
            }}
            className={cn(
              "min-w-[160px] rounded-md border border-hairline bg-surface-3 p-1 text-ink shadow-lg animate-in fade-in-80 zoom-in-95",
              className
            )}
          >
            {children}
          </div>,
          document.body
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
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
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
