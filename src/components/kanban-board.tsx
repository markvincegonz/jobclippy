"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Sparkles,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
  RotateCcw,
} from "lucide-react";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ClippyMascot } from "@/components/clippy-mascot";
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

export function KanbanBoard() {
  const { jobs, resetToSeeds, moveStage } = useJobStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSkill, setSelectedSkill] = React.useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);
  const [draggingJobId, setDraggingJobId] = React.useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = React.useState<JobStage | null>(null);
  const [isOfferCelebrationActive, setIsOfferCelebrationActive] = React.useState(false);
  const { toast } = useToast();

  const handleCelebrationComplete = React.useCallback(() => {
    setIsOfferCelebrationActive(false);
  }, []);

  const handleCardDragStart = React.useCallback((jobId: string) => {
    setDraggingJobId(jobId);
    // Dismiss any existing celebration when picking up a card so it doesn't linger or re-trigger
    setIsOfferCelebrationActive(false);
  }, []);

  const handleCardDragEnd = React.useCallback(() => {
    setDraggingJobId(null);
    setDragOverColId(null);
  }, []);

  const handleColumnDrop = React.useCallback(
    (targetStage: JobStage) => {
      if (!draggingJobId) return;
      const targetJob = jobs.find((j) => j.id === draggingJobId);
      if (targetJob && targetJob.stage !== targetStage) {
        moveStage(targetJob.id, targetStage);

        if (targetStage === "offer") {
          setIsOfferCelebrationActive(true);
          toast({
            title: "🎉 Huge Milestone: Offer Received!",
            description: `Congratulations on ${targetJob.title} at ${targetJob.company}!`,
            type: "success",
            duration: 5000,
          });
        } else {
          toast({
            title: "Stage updated",
            description: `Moved "${targetJob.title}" to ${COLUMNS.find((c) => c.id === targetStage)?.title}`,
            type: "default",
            duration: 3000,
          });
        }
      }
      setDraggingJobId(null);
      setDragOverColId(null);
    },
    [draggingJobId, jobs, moveStage, toast]
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

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink transition-colors duration-150">
      {/* Top Header — 56px Linear Top Nav */}
      <header className="sticky top-0 z-30 h-14 border-b border-hairline bg-canvas/90 backdrop-blur-md px-6 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 border border-hairline text-primary surface-lift group cursor-pointer hover:border-primary/50 transition-colors"
            title="JobClippy: Your Career Command Center"
          >
            <ClippyMascot className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-medium tracking-tight text-ink">JobClippy</h1>
            <span className="text-xs text-ink-subtle hidden sm:inline font-normal">
              Job Hunt Command Center
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Empowering your career moves
            </span>
          </div>
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

      {/* Main Container */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
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

        {/* Filter and Search Toolbar */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-1 border border-hairline rounded-lg p-3 surface-lift shadow-none">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-subtle" />
            <Input
              id="job-search-input"
              data-testid="job-search-input"
              placeholder="Search title, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-surface-1 border-hairline text-ink"
            />
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

        {/* 5-Column Kanban Board */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colJobs = filteredJobs.filter((j) => j.stage === col.id);
            const isDropTarget = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                data-testid={`column-${col.id}`}
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
                  "flex flex-col rounded-lg border border-hairline bg-surface-1/50 p-3 min-h-[520px] surface-lift shadow-none transition-all duration-150",
                  isDropTarget && "border-primary/60 bg-surface-2/90 ring-2 ring-primary/20 scale-[1.01]"
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
                      isDragging={draggingJobId === job.id}
                      onDragStart={handleCardDragStart}
                      onDragEnd={handleCardDragEnd}
                    />
                  ))}

                  {/* Drop zone indicator when hovering */}
                  {isDropTarget && draggingJobId && (
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
