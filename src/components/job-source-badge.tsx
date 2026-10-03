"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { getJobSource, JobSourceInfo } from "@/lib/job-source";
import { cn } from "@/lib/utils";

interface JobSourceBadgeProps {
  url?: string | null;
  sourceInfo?: JobSourceInfo | null;
  className?: string;
  iconSize?: number;
  showDomainOnHover?: boolean;
}

export function JobSourceBadge({
  url,
  sourceInfo: explicitSource,
  className,
  iconSize = 14,
}: JobSourceBadgeProps) {
  const source = explicitSource !== undefined ? explicitSource : getJobSource(url);
  const [hasError, setHasError] = React.useState(false);

  if (!source) {
    return null;
  }

  return (
    <span
      data-testid="job-source-badge"
      title={source.domain}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-ink-muted select-none",
        className
      )}
    >
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.faviconUrl}
          alt={source.brand}
          width={iconSize}
          height={iconSize}
          className="rounded-xs shrink-0 object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <Globe
          className="text-ink-subtle shrink-0"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        />
      )}
      <span className="font-normal truncate max-w-[120px]">{source.brand}</span>
    </span>
  );
}
