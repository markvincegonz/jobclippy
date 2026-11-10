import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function BrandIcon({ className, size = 24, alt = "JobClippy Logo", ...props }: BrandIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand-icon.png"
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 select-none object-contain", className)}
      {...props}
    />
  );
}

