"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ClippyMascotProps extends React.SVGProps<SVGSVGElement> {
  mood?: "happy" | "celebrating" | "focused";
}

export function ClippyMascot({
  className,
  mood = "happy",
  ...props
}: ClippyMascotProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 select-none", className)}
      {...props}
    >
      {/* Paperclip Outer Coil */}
      <path
        d="M13 23V9.5C13 6.46 15.46 4 18.5 4C21.54 4 24 6.46 24 9.5V26.5C24 30.64 20.64 34 16.5 34C12.36 34 9 30.64 9 26.5V13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {/* Paperclip Inner Loop */}
      <path
        d="M17 13.5V24C17 25.1 17.9 26 19 26C20.1 26 21 25.1 21 24V11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/80"
      />

      {/* Expressive Friendly Eyes */}
      {mood === "celebrating" ? (
        <>
          {/* Excited squinting arches ^ ^ */}
          <path
            d="M12.5 12.5C13.2 11.5 14.8 11.5 15.5 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-ink"
          />
          <path
            d="M19.5 12.5C20.2 11.5 21.8 11.5 22.5 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-ink"
          />
        </>
      ) : (
        <>
          {/* Left Eye */}
          <circle cx="14" cy="12" r="2.2" fill="#ffffff" stroke="currentColor" strokeWidth="0.8" className="text-hairline-strong" />
          <circle cx="14.6" cy="11.8" r="1.1" fill="currentColor" className="text-ink" />

          {/* Right Eye */}
          <circle cx="21" cy="12" r="2.2" fill="#ffffff" stroke="currentColor" strokeWidth="0.8" className="text-hairline-strong" />
          <circle cx="21.6" cy="11.8" r="1.1" fill="currentColor" className="text-ink" />
        </>
      )}

      {/* Smile */}
      <path
        d="M15.5 16.5C16.5 17.5 18.5 17.5 19.5 16.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="text-ink"
      />
    </svg>
  );
}
