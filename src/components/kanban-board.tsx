"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Sparkles,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
  RotateCcw,
  X,
} from "lucide-react";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { QuickAddModal } from "@/components/quick-add-modal";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useJobStore, JobStage } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";
import { BrandIcon } from "@/components/brand-icon";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { cn } from "@/lib/utils";

const COLUMNS: { id: JobStage; title: string; description: string }[] = [
  {
    id: "wishlist",
    title: "Wishlist",
    description: "Saved positions to review",
  },
  {
    id: "applied",
    title: "Applied",
    description: "Submitted applications",
  },
  {
    id: "interviewing",
    title: "Interviewing",
    description: "Screens and live loops",
  },
  {
    id: "offer",
    title: "Offer Received",
    description: "Proposals & negotiations",
  },
  {
    id: "archived",
    title: "Archived",
    description: "Closed or on hold",
  },
];

const EMPTY_STATE_MESSAGES: Record<JobStage, { headline: string; subtitle: string }> = {
  wishlist: {
    headline: "Your Target Roles",
    subtitle: "Save dream positions from LinkedIn or job boards to track your pipeline.",
  },
  applied: {
    headline: "Applications in Review",
    subtitle: "Submitted applications currently being reviewed by hiring teams.",
  },
  interviewing: {
    headline: "Live Conversations",
    subtitle: "Phone screens, technical assessments, and live interviews in progress.",
  },
  offer: {
    headline: "Offers & Proposals",
    subtitle: "Your hard work lands here. Evaluate and negotiate compensation packages.",
  },
  archived: {
    headline: "Concluded Searches",
    subtitle: "Positions closed, paused, or saved for historical reference.",
  },
};

export interface KanbanBoardProps {
  externalSearchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedStageFilter?: JobStage | null;
  onClearStageFilter?: () => void;
  hideHeader?: boolean;
  isAddOpen?: boolean;
  onOpenChangeAdd?: (open: boolean) => void;
  isResetConfirmOpen?: boolean;
  onOpenChangeResetConfirm?: (open: boolean) => void;
}

export function KanbanBoard({
  externalSearchQuery,
  onSearchChange,
  selectedStageFilter,
  onClearStageFilter,
  hideHeader = false,
  isAddOpen: externalIsAddOpen,
  onOpenChangeAdd,
  isResetConfirmOpen: externalIsResetConfirmOpen,
  onOpenChangeResetConfirm,
}: KanbanBoardProps = {}) {
  const { jobs, resetToSeeds, moveStage, reorderJob } = useJobStore();
  const searchParams = useSearchParams();

  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : searchParams?.get("q") || "";
  const effectiveStageFilter =
    selectedStageFilter !== undefined
      ? selectedStageFilter
      : (searchParams?.get("stage") as JobStage) || null;

  const [selectedSkill, setSelectedSkill] = React.useState<string | null>(null);
  const [internalIsAddOpen, setInternalIsAddOpen] = React.useState(false);
  const isAddOpen = externalIsAddOpen !== undefined ? externalIsAddOpen : internalIsAddOpen;
  const setIsAddOpen = onOpenChangeAdd || setInternalIsAddOpen;

  const [internalIsResetConfirmOpen, setInternalIsResetConfirmOpen] = React.useState(false);
  const isResetConfirmOpen = externalIsResetConfirmOpen !== undefined ? externalIsResetConfirmOpen : internalIsResetConfirmOpen;
  const setIsResetConfirmOpen = onOpenChangeResetConfirm || setInternalIsResetConfirmOpen;

  const [draggingJobId, setDraggingJobId] = React.useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = React.useState<JobStage | null>(null);
  const [dragOverTarget, setDragOverTarget] = React.useState<{
    jobId: string;
    position: "before" | "after";
    colId: JobStage;
  } | null>(null);
  const [isOfferCelebrationActive, setIsOfferCelebrationActive] = React.useState(false);
  const { toast } = useToast();

  const handleCelebrationComplete = React.useCallback(() => {
    setIsOfferCelebrationActive(false);
  }, []);

  const handleStageChange = React.useCallback(
    (job: Job, targetStage: JobStage) => {
      if (job.stage === targetStage) return;
      moveStage(job.id, targetStage);

      if (targetStage === "offer") {
        setIsOfferCelebrationActive(true);
        toast({
          title: "🎉 Huge Milestone: Offer Received!",
          description: `Congratulations on ${job.title} at ${job.company}!`,
          type: "success",
          duration: 5000,
        });
      } else {
        toast({
          title: "Stage updated",
          description: `Moved "${job.title}" to ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
          type: "default",
          duration: 3000,
        });
      }
    },
    [moveStage, toast]
  );

  React.useEffect(() => {
    const handleOfferEvent = () => setIsOfferCelebrationActive(true);
    window.addEventListener("jobclippy:offer-celebration", handleOfferEvent);
    return () => window.removeEventListener("jobclippy:offer-celebration", handleOfferEvent);
  }, []);

  const handleCardDragStart = React.useCallback((jobId: string) => {
    setDraggingJobId(jobId);
    setDragOverTarget(null);
    // Dismiss any existing celebration when picking up a card so it doesn't linger or re-trigger
    setIsOfferCelebrationActive(false);
  }, []);

  const handleCardDragEnd = React.useCallback(() => {
    setDraggingJobId(null);
    setDragOverColId(null);
    setDragOverTarget(null);
  }, []);

  const handleCardDragOver = React.useCallback(
    (e: React.DragEvent, targetJobId: string, colId: JobStage) => {
      if (!draggingJobId || draggingJobId === targetJobId) {
        setDragOverTarget(null);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const isBefore = offsetY < rect.height / 2;
      setDragOverTarget({
        jobId: targetJobId,
        position: isBefore ? "before" : "after",
        colId,
      });
      setDragOverColId(colId);
    },
    [draggingJobId]
  );

  const handleCardDragLeave = React.useCallback(
    (targetJobId: string) => {
      if (dragOverTarget?.jobId === targetJobId) {
        // Will be updated if moving to another card or clear on column leave
      }
    },
    [dragOverTarget]
  );

  const handleCardDrop = React.useCallback(
    (e: React.DragEvent, targetJobId: string, targetStage: JobStage) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggingJobId || draggingJobId === targetJobId) {
        setDraggingJobId(null);
        setDragOverColId(null);
        setDragOverTarget(null);
        return;
      }

      const draggingJob = jobs.find((j) => j.id === draggingJobId);
      if (!draggingJob) {
        setDraggingJobId(null);
        setDragOverColId(null);
        setDragOverTarget(null);
        return;
      }

      const isCrossStage = draggingJob.stage !== targetStage;
      const targetJobs = jobs.filter((j) => j.stage === targetStage && j.id !== draggingJobId);
      const targetIdx = targetJobs.findIndex((j) => j.id === targetJobId);

      let insertionIndex = 0;
      if (targetIdx !== -1) {
        const position = dragOverTarget?.position || "before";
        insertionIndex = position === "before" ? targetIdx : targetIdx + 1;
      } else {
        insertionIndex = targetJobs.length;
      }

      reorderJob(draggingJobId, targetStage, insertionIndex);

      if (isCrossStage) {
        if (targetStage === "offer") {
          setIsOfferCelebrationActive(true);
          toast({
            title: "🎉 Huge Milestone: Offer Received!",
            description: `Congratulations on ${draggingJob.title} at ${draggingJob.company}!`,
            type: "success",
            duration: 5000,
          });
        } else {
          toast({
            title: "Stage updated",
            description: `Moved "${draggingJob.title}" to ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
            type: "default",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Order updated",
          description: `Reordered "${draggingJob.title}" within ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
          type: "default",
          duration: 2500,
        });
      }

      setDraggingJobId(null);
      setDragOverColId(null);
      setDragOverTarget(null);
    },
    [draggingJobId, jobs, dragOverTarget, reorderJob, toast]
  );

  const handleColumnDrop = React.useCallback(
    (targetStage: JobStage) => {
      if (!draggingJobId) return;
      const draggingJob = jobs.find((j) => j.id === draggingJobId);
      if (!draggingJob) {
        setDraggingJobId(null);
        setDragOverColId(null);
        setDragOverTarget(null);
        return;
      }

      const isCrossStage = draggingJob.stage !== targetStage;
      const targetJobs = jobs.filter((j) => j.stage === targetStage && j.id !== draggingJobId);
      let insertionIndex = targetJobs.length;

      if (dragOverTarget && dragOverTarget.colId === targetStage) {
        const targetIdx = targetJobs.findIndex((j) => j.id === dragOverTarget.jobId);
        if (targetIdx !== -1) {
          insertionIndex = dragOverTarget.position === "before" ? targetIdx : targetIdx + 1;
        }
      }

      reorderJob(draggingJobId, targetStage, insertionIndex);

      if (isCrossStage) {
        if (targetStage === "offer") {
          setIsOfferCelebrationActive(true);
          toast({
            title: "🎉 Huge Milestone: Offer Received!",
            description: `Congratulations on ${draggingJob.title} at ${draggingJob.company}!`,
            type: "success",
            duration: 5000,
          });
        } else {
          toast({
            title: "Stage updated",
            description: `Moved "${draggingJob.title}" to ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
            type: "default",
            duration: 3000,
          });
        }
      } else if (dragOverTarget) {
        toast({
          title: "Order updated",
          description: `Reordered "${draggingJob.title}" within ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
          type: "default",
          duration: 2500,
        });
      }

      setDraggingJobId(null);
      setDragOverColId(null);
      setDragOverTarget(null);
    },
    [draggingJobId, jobs, dragOverTarget, reorderJob, toast]
  );

  const handleConfirmReset = () => {
    resetToSeeds();
    setIsResetConfirmOpen(false);
    toast({
      title: "Demo reset complete",
      description: "Restored sample opportunities and initial pipeline stages",
      type: "default",
      duration: 3500,
    });
  };

  // Extract all unique skills across jobs for quick filter pills
  const allSkills = React.useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => j.skills?.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 8);
  }, [jobs]);

  // Filter jobs by search and selected skill
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSkill = !selectedSkill || job.skills.includes(selectedSkill);

      return matchesSearch && matchesSkill;
    });
  }, [jobs, searchQuery, selectedSkill]);

  // Metric counts
  const totalActive = jobs.filter((j) => j.stage !== "archived").length;
  const appliedCount = jobs.filter((j) => j.stage === "applied").length;
  const interviewCount = jobs.filter((j) => j.stage === "interviewing").length;
  const offerCount = jobs.filter((j) => j.stage === "offer").length;

  const displayedColumns = COLUMNS;

  // Auto-scroll target column into view when stage shortcut is clicked
  React.useEffect(() => {
    if (effectiveStageFilter) {
      const colEl = document.querySelector(`[data-testid="column-${effectiveStageFilter}"]`);
      if (colEl) {
        colEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [effectiveStageFilter]);

  return (
    <div className={cn("flex flex-col min-h-screen bg-canvas text-ink transition-colors duration-150", hideHeader && "min-h-0")}>
      {/* Top Header — 56px Linear Top Nav (only rendered when standalone) */}
      {!hideHeader && (
        <header className="sticky top-0 z-30 h-14 border-b border-hairline bg-canvas/90 backdrop-blur-md px-6 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-2.5">
          <BrandIcon size={26} className="shrink-0 hover:scale-105 transition-transform cursor-pointer" />
          <h1 className="text-sm font-semibold tracking-tight text-ink">JobClippy</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            id="quick-add-btn"
            data-testid="quick-add-btn"
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Save Job</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reset to sample data"
            className="text-xs gap-1 hidden md:flex"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo</span>
          </Button>

          <ThemeToggle />
        </div>
      </header>
      )}

      {/* Main Container */}
      <main className="flex-1 p-6 space-y-6 w-full">
        {/* Metric Cards Banner */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-hairline bg-surface-1 p-4 flex items-center gap-3.5 surface-lift shadow-none">
            <div className="p-2 rounded-md bg-surface-2 border border-hairline text-ink-muted">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-medium tracking-tight text-ink">{totalActive}</div>
              <div className="text-xs text-ink-muted">Active Opportunities</div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-4 flex items-center gap-3.5 surface-lift shadow-none">
            <div className="p-2 rounded-md bg-surface-2 border border-hairline text-ink-muted">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-medium tracking-tight text-ink">{appliedCount}</div>
              <div className="text-xs text-ink-muted">Applications Sent</div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-4 flex items-center gap-3.5 surface-lift shadow-none">
            <div className="p-2 rounded-md bg-surface-2 border border-hairline text-ink-muted">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-medium tracking-tight text-ink">{interviewCount}</div>
              <div className="text-xs text-ink-muted">Live Interviews</div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-1 p-4 flex items-center gap-3.5 surface-lift shadow-none">
            <div className="p-2 rounded-md bg-surface-2 border border-hairline text-semantic-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-medium tracking-tight text-ink">{offerCount}</div>
              <div className="text-xs text-ink-muted">Offers Received</div>
            </div>
          </div>
        </section>

        {/* Filter and Skill Toolbar */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-1 border border-hairline rounded-lg px-4 py-2.5 surface-lift shadow-none">
          <div className="flex items-center gap-2">
            {selectedStageFilter ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-2 border border-hairline text-xs font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="capitalize">{selectedStageFilter} stage spotlighted</span>
                {onClearStageFilter && (
                  <button
                    type="button"
                    onClick={onClearStageFilter}
                    aria-label="Dismiss stage spotlight"
                    className="hover:text-ink text-ink-muted cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-ink-muted flex items-center gap-2">
                <span className="font-medium text-ink">Pipeline Board</span>
                <span className="text-ink-subtle">·</span>
                <span className="font-mono text-[11px]">{filteredJobs.length} opportunities visible</span>
              </div>
            )}
          </div>

          {/* Skill Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-medium text-ink-subtle mr-1 hidden lg:inline">
              Filter Skill:
            </span>
            <Badge
              variant={selectedSkill === null ? "default" : "secondary"}
              onClick={() => setSelectedSkill(null)}
              className="cursor-pointer text-xs h-6 px-2.5 rounded-xs"
            >
              All
            </Badge>
            {allSkills.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkill === skill ? "default" : "skill"}
                onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                className="cursor-pointer text-xs h-6 px-2.5 rounded-xs"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* 5-Column Kanban Board with Horizontal Scroller */}
        <div
          data-testid="kanban-board-scroll-container"
          className="w-full overflow-x-auto pt-3 pb-4 -mt-3 px-1 -mx-1 custom-scrollbar focus:outline-none"
        >
          <section className="grid gap-4 items-start grid-cols-1 md:grid-cols-3 lg:grid-cols-5 min-w-full lg:min-w-[1300px]">
            {displayedColumns.map((col) => {
              const colJobs = filteredJobs.filter((j) => j.stage === col.id);
              const isDropTarget = dragOverColId === col.id;
              const isSpotlighted = effectiveStageFilter === col.id;
              const isDimmed = !!effectiveStageFilter && !isSpotlighted;

              return (
                <div
                  key={col.id}
                  data-testid={`column-${col.id}`}
                  data-spotlight={isSpotlighted ? "true" : undefined}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverColId !== col.id) {
                      setDragOverColId(col.id);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    if (dragOverColId === col.id) {
                      setDragOverColId(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleColumnDrop(col.id);
                  }}
                  className={cn(
                    "flex flex-col rounded-lg border border-hairline bg-surface-1/50 p-3 min-h-[520px] min-w-0 lg:min-w-[240px] surface-lift shadow-none transition-all duration-200",
                    isSpotlighted && "border-primary/70 bg-surface-2/80 ring-1 ring-primary/40 shadow-xs",
                    isDimmed && "opacity-55 hover:opacity-90",
                    isDropTarget && "border-primary/80 bg-surface-2/90 ring-2 ring-primary/20 scale-[1.01]"
                  )}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium text-ink tracking-tight">{col.title}</h2>
                        <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-xs bg-surface-2 border border-hairline text-xs font-normal text-ink-muted">
                          {colJobs.length}
                        </span>
                      </div>
                      <p className="text-xs text-ink-subtle">{col.description}</p>
                    </div>
                  </div>

                  {/* Job Cards Column */}
                  <div className="flex-1 space-y-3">
                    {colJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onStageChange={(newStage) => handleStageChange(job, newStage)}
                        isDragging={draggingJobId === job.id}
                        onDragStart={handleCardDragStart}
                        onDragEnd={handleCardDragEnd}
                        onDragOverCard={(e, targetJobId) => handleCardDragOver(e, targetJobId, col.id)}
                        onDragLeaveCard={(e, targetJobId) => handleCardDragLeave(targetJobId)}
                        onDropCard={(e, targetJobId) => handleCardDrop(e, targetJobId, col.id)}
                        dropIndicator={
                          dragOverTarget?.jobId === job.id ? dragOverTarget.position : null
                        }
                      />
                    ))}

                    {/* Drop zone indicator when hovering empty area at bottom */}
                    {isDropTarget && draggingJobId && !dragOverTarget && (
                      <div className="h-16 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center text-xs text-primary font-medium animate-pulse">
                        Drop to move into {col.title}
                      </div>
                    )}

                    {colJobs.length === 0 && !isDropTarget && (
                      <div className="flex flex-col items-center justify-center min-h-[160px] rounded-lg border border-dashed border-hairline/80 p-5 text-center bg-surface-1/30">
                        <div className="p-2 rounded-full bg-surface-2 border border-hairline mb-2 text-ink-subtle">
                          <Layers className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-medium text-ink">{EMPTY_STATE_MESSAGES[col.id].headline}</p>
                        <p className="text-[11px] text-ink-subtle mt-0.5 max-w-[200px] leading-relaxed">
                          {EMPTY_STATE_MESSAGES[col.id].subtitle}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddOpen(true)}
                          className="mt-3 text-[11px] h-6 px-2 text-primary hover:text-primary-hover gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add opportunity</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      {/* Slide-over Detail Sheet & Quick Add Dialog */}
      <JobDetailSheet />
      <QuickAddModal open={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Confetti Milestone Celebration Canvas */}
      <ConfettiCelebration
        active={isOfferCelebrationActive}
        onComplete={handleCelebrationComplete}
      />

      {/* Reset Demo Confirmation Dialog */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogClose onClick={() => setIsResetConfirmOpen(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-ink">
            <RotateCcw className="h-4 w-4 text-ink-muted" />
            <span>Reset to Sample Pipeline?</span>
          </DialogTitle>
          <DialogDescription>
            This action will restore the 5 initial sample jobs and clear any opportunities or notes added during this session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetConfirmOpen(false)}
            className="text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirmReset}
            className="text-xs font-medium"
          >
            Confirm Reset
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
