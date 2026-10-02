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
import { QuickAddModal } from "@/components/quick-add-modal";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useJobStore, JobStage } from "@/lib/job-store";

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

export function KanbanBoard() {
  const { jobs, resetToSeeds } = useJobStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSkill, setSelectedSkill] = React.useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 border border-hairline text-primary surface-lift">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-medium tracking-tight text-ink">JobClippy</h1>
            <span className="text-xs text-ink-subtle hidden sm:inline font-normal">
              Job Hunt Command Center
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
            onClick={resetToSeeds}
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

            return (
              <div
                key={col.id}
                data-testid={`column-${col.id}`}
                className="flex flex-col rounded-lg border border-hairline bg-surface-1/50 p-3 min-h-[520px] surface-lift shadow-none"
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
                    <JobCard key={job.id} job={job} />
                  ))}

                  {colJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-36 rounded-md border border-dashed border-hairline p-4 text-center">
                      <Layers className="h-5 w-5 text-ink-tertiary mb-1" />
                      <p className="text-xs text-ink-tertiary font-normal">No jobs in {col.title}</p>
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
    </div>
  );
}
