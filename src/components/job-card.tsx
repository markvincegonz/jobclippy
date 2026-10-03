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
  PenLine,
  Check,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Job, JobStage, useJobStore } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";
import { JobSourceBadge } from "@/components/job-source-badge";
import { formatInterviewCountdown } from "@/lib/timeline";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onDragStart?: (jobId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  onDragOverCard?: (e: React.DragEvent, targetJobId: string) => void;
  onDragLeaveCard?: (e: React.DragEvent, targetJobId: string) => void;
  onDropCard?: (e: React.DragEvent, targetJobId: string) => void;
  dropIndicator?: "before" | "after" | null;
  onStageChange?: (newStage: JobStage) => void;
}

const STAGE_LABELS: Record<JobStage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  archived: "Archived",
};

export function JobCard({
  job,
  onDragStart,
  onDragEnd,
  isDragging,
  onDragOverCard,
  onDragLeaveCard,
  onDropCard,
  dropIndicator,
  onStageChange,
}: JobCardProps) {
  const { moveStage, addNote, deleteJob, restoreLastDeletedJob, setSelectedJobId } = useJobStore();
  const { toast } = useToast();

  const [isQuickNoteOpen, setIsQuickNoteOpen] = React.useState(false);
  const [quickNoteText, setQuickNoteText] = React.useState("");

  const stages: JobStage[] = ["wishlist", "applied", "interviewing", "offer", "archived"];

  const currentIndex = stages.indexOf(job.stage);
  const canAdvance = currentIndex < stages.length - 1;
  const nextStage = canAdvance ? stages[currentIndex + 1] : null;
  const nextStageLabel = nextStage ? STAGE_LABELS[nextStage] : "";

  const handleQuickAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStage) {
      handleStageSelect(nextStage);
    }
  };

  const handleSaveQuickNote = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!quickNoteText.trim()) {
      setIsQuickNoteOpen(false);
      return;
    }
    addNote(job.id, quickNoteText.trim());
    toast({
      title: "Note Added",
      description: `Saved note for ${job.company}`,
      type: "success",
      duration: 3000,
    });
    setQuickNoteText("");
    setIsQuickNoteOpen(false);
  };

  const handleDelete = () => {
    deleteJob(job.id);
    toast({
      title: "Opportunity removed",
      description: `Removed from ${STAGE_LABELS[job.stage]}`,
      type: "undo",
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          restoreLastDeletedJob();
          toast({
            title: "Opportunity restored",
            type: "success",
            duration: 3000,
          });
        },
      },
    });
  };

  const handleStageSelect = (stage: JobStage) => {
    if (stage === job.stage) return;
    if (onStageChange) {
      onStageChange(stage);
    } else {
      moveStage(job.id, stage);
      if (stage === "offer") {
        window.dispatchEvent(new CustomEvent("jobclippy:offer-celebration"));
        toast({
          title: "🎉 Huge Milestone: Offer Received!",
          description: `Congratulations on ${job.title} at ${job.company}!`,
          type: "success",
          duration: 5000,
        });
      } else {
        toast({
          title: "Stage updated",
          description: `Moved "${job.title}" to ${STAGE_LABELS[stage]}`,
          type: "default",
          duration: 3000,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (targetTag === "input" || targetTag === "textarea") return;

    const currentIndex = stages.indexOf(job.stage);
    if ((e.altKey && e.key === "ArrowRight") || e.key === "]") {
      e.preventDefault();
      if (currentIndex < stages.length - 1) {
        handleStageSelect(stages[currentIndex + 1]);
      }
    } else if ((e.altKey && e.key === "ArrowLeft") || e.key === "[") {
      e.preventDefault();
      if (currentIndex > 0) {
        handleStageSelect(stages[currentIndex - 1]);
      }
    } else if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
      e.preventDefault();
      setSelectedJobId(job.id);
    }
  };

  return (
    <div
      data-testid={`job-card-${job.id}`}
      onClick={() => setSelectedJobId(job.id)}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", job.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(job.id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      onDragOver={(e) => {
        if (isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        onDragOverCard?.(e, job.id);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        onDragLeaveCard?.(e, job.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDropCard?.(e, job.id);
      }}
      tabIndex={0}
      role="article"
      aria-label={`${job.title} at ${job.company}`}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing rounded-lg border border-hairline bg-surface-1 hover:bg-surface-2 hover:border-hairline-strong surface-lift transition-all duration-150 flex flex-col justify-between shadow-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus",
        isDragging && "opacity-35 scale-[0.98] border-dashed border-primary"
      )}
    >
      {/* Drop insertion indicators */}
      {dropIndicator === "before" && (
        <div
          data-testid="drop-indicator-before"
          className="absolute -top-2 inset-x-0 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(94,106,210,0.8)] z-20 pointer-events-none"
        />
      )}
      {dropIndicator === "after" && (
        <div
          data-testid="drop-indicator-after"
          className="absolute -bottom-2 inset-x-0 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(94,106,210,0.8)] z-20 pointer-events-none"
        />
      )}
      {/* Header section */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm font-medium text-ink group-hover:text-primary transition-colors line-clamp-1 break-words">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
              <span className="truncate max-w-[140px]">{job.company}</span>
            </div>
          </div>

          {/* Quick-Action Strip */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 p-0.5 rounded-md bg-surface-2/90 border border-hairline/80 shadow-xs opacity-75 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-150 shrink-0"
          >
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`quick-link-btn-${job.id}`}
                title="Open job posting"
                className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              type="button"
              data-testid={`quick-note-btn-${job.id}`}
              onClick={() => setIsQuickNoteOpen((prev) => !prev)}
              title="Add quick note"
              className={cn(
                "p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors cursor-pointer",
                isQuickNoteOpen && "text-primary bg-surface-3"
              )}
            >
              <PenLine className="h-3 w-3" />
            </button>

            {canAdvance && (
              <button
                type="button"
                data-testid={`quick-advance-btn-${job.id}`}
                aria-label="Advance stage"
                title={`Advance to ${nextStageLabel}`}
                onClick={handleQuickAdvance}
                className="p-1 rounded text-ink-subtle hover:text-primary hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            )}

            <DropdownMenu
              trigger={
                <button
                  type="button"
                  data-testid={`quick-more-btn-${job.id}`}
                  aria-label="Job actions"
                  className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              }
            >
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Move Stage
              </div>
              {stages.map((stage) => (
                <DropdownMenuItem
                  key={stage}
                  onClick={() => handleStageSelect(stage)}
                  className={job.stage === stage ? "font-medium text-primary bg-surface-2" : ""}
                >
                  <ArrowRight className="mr-2 h-3 w-3 opacity-60" />
                  {STAGE_LABELS[stage]}
                </DropdownMenuItem>
              ))}
              <div className="my-1 border-t border-hairline" />
              <DropdownMenuItem onClick={handleDelete} destructive>
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>

        {/* Inline Quick Note Editor */}
        {isQuickNoteOpen && (
          <div
            data-testid={`quick-note-container-${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 pt-2 border-t border-hairline animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                data-testid={`quick-note-input-${job.id}`}
                placeholder="Jot a quick note..."
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveQuickNote(e);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setIsQuickNoteOpen(false);
                  }
                }}
                className="flex-1 h-7 px-2 text-xs rounded bg-surface-2 border border-hairline text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                data-testid={`quick-note-save-${job.id}`}
                onClick={handleSaveQuickNote}
                title="Save note"
                className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
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

          {/* Live Interview Countdown Badge */}
          {job.interviewDate && (() => {
            const countdown = formatInterviewCountdown(job.interviewDate);
            return (
              <div
                data-testid={`interview-countdown-badge-${job.id}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                  countdown.badgeStyle
                )}
              >
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{countdown.text}</span>
              </div>
            );
          })()}
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
      <div className="p-4 pt-2.5 border-t border-hairline flex items-center justify-between gap-2 min-w-0 text-xs text-ink-muted">
        <div className="flex items-center gap-2 min-w-0">
          {job.url && <JobSourceBadge url={job.url} />}
          {job.notes && job.notes.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-muted shrink-0">
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
            className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium cursor-pointer py-1 px-1.5 rounded-xs hover:bg-surface-2 min-h-[28px] shrink-0"
          >
            <span>Original</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
