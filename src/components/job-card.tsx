"use client";

import * as React from "react";
import {
  Building2,
  MapPin,
  MoreVertical,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Job, JobStage, useJobStore } from "@/lib/job-store";

interface JobCardProps {
  job: Job;
}

const STAGE_LABELS: Record<JobStage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  archived: "Archived",
};

export function JobCard({ job }: JobCardProps) {
  const { moveStage, deleteJob, setSelectedJobId } = useJobStore();

  const stages: JobStage[] = ["wishlist", "applied", "interviewing", "offer", "archived"];

  return (
    <div
      data-testid={`job-card-${job.id}`}
      onClick={() => setSelectedJobId(job.id)}
      className="group relative cursor-pointer rounded-lg border border-hairline bg-surface-1 hover:bg-surface-2 hover:border-hairline-strong surface-lift transition-all duration-150 flex flex-col justify-between shadow-none select-none"
    >
      {/* Header section */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm font-medium text-ink group-hover:text-primary transition-colors line-clamp-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
              <span className="truncate max-w-[140px]">{job.company}</span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-ink hover:bg-surface-3"
                  aria-label="Job actions"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              }
            >
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Move Stage
              </div>
              {stages.map((stage) => (
                <DropdownMenuItem
                  key={stage}
                  onClick={() => moveStage(job.id, stage)}
                  className={job.stage === stage ? "font-medium text-primary bg-surface-2" : ""}
                >
                  <ArrowRight className="mr-2 h-3 w-3 opacity-60" />
                  {STAGE_LABELS[stage]}
                </DropdownMenuItem>
              ))}
              <div className="my-1 border-t border-hairline" />
              <DropdownMenuItem onClick={() => deleteJob(job.id)} destructive>
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-4 pt-1 pb-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {job.location && (
            <div className="flex items-center gap-1 text-ink-muted text-xs">
              <MapPin className="h-3 w-3 shrink-0 text-ink-subtle" />
              <span className="truncate max-w-[130px]">{job.location}</span>
            </div>
          )}

          {job.salary && job.salary !== "Salary not listed" && (
            <Badge variant="salary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              {job.salary}
            </Badge>
          )}
        </div>

        {/* Skill tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="skill">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-ink-subtle self-center">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer section */}
      <div className="p-4 pt-2.5 border-t border-hairline flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          {job.notes && job.notes.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <MessageSquare className="h-3 w-3 text-ink-subtle" />
              {job.notes.length}
            </span>
          )}
        </div>

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer"
          >
            <span>Original</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
