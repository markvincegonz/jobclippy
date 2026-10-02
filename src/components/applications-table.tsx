"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  ExternalLink,
  ChevronDown,
  Inbox,
  Send,
  Calendar,
  CheckCircle2,
  Archive,
  X,
  FileText,
} from "lucide-react";
import { useJobStore, JobStage } from "@/lib/job-store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STAGES: {
  id: JobStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}[] = [
  { id: "wishlist", label: "Wishlist", icon: Inbox, dotColor: "bg-amber-400" },
  { id: "applied", label: "Applied", icon: Send, dotColor: "bg-sky-400" },
  { id: "interviewing", label: "Interviewing", icon: Calendar, dotColor: "bg-purple-400" },
  { id: "offer", label: "Offer Received", icon: CheckCircle2, dotColor: "bg-emerald-400" },
  { id: "archived", label: "Archived", icon: Archive, dotColor: "bg-zinc-500" },
];

const STAGE_ORDER: Record<JobStage, number> = {
  wishlist: 0,
  applied: 1,
  interviewing: 2,
  offer: 3,
  archived: 4,
};

type SortKey = "title" | "company" | "stage" | "salary";
type SortDirection = "asc" | "desc";

interface ApplicationsTableProps {
  searchQuery?: string;
  selectedStageFilter?: JobStage | null;
  onClearStageFilter?: () => void;
  onOpenQuickAdd?: () => void;
}

export function ApplicationsTable({
  searchQuery = "",
  selectedStageFilter = null,
  onClearStageFilter,
  onOpenQuickAdd,
}: ApplicationsTableProps) {
  const { jobs, moveStage, setSelectedJobId } = useJobStore();
  const { toast } = useToast();

  const [sortKey, setSortKey] = React.useState<SortKey>("title");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter jobs based on search query and stage filter
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      // Stage filter
      if (selectedStageFilter && job.stage !== selectedStageFilter) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = job.skills.some((s) => s.toLowerCase().includes(q));
      const matchLocation = job.location.toLowerCase().includes(q);
      return matchTitle || matchCompany || matchSkills || matchLocation;
    });
  }, [jobs, selectedStageFilter, searchQuery]);

  // Sort jobs
  const sortedJobs = React.useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortKey === "company") {
        comparison = a.company.localeCompare(b.company);
      } else if (sortKey === "stage") {
        comparison = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
      } else if (sortKey === "salary") {
        const numA = parseInt(a.salary.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.salary.replace(/\D/g, ""), 10) || 0;
        comparison = numA - numB;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredJobs, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedJobs.length && sortedJobs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedJobs.map((j) => j.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStageChange = (jobId: string, newStage: JobStage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    moveStage(jobId, newStage);
    const stageLabel = STAGES.find((s) => s.id === newStage)?.label || newStage;
    toast({
      title: "Stage Updated",
      description: `Moved to ${stageLabel}`,
      type: "success",
      duration: 3000,
    });
  };

  const handleBatchMoveStage = (newStage: JobStage) => {
    selectedIds.forEach((id) => moveStage(id, newStage));
    const count = selectedIds.size;
    const stageLabel = STAGES.find((s) => s.id === newStage)?.label || newStage;
    setSelectedIds(new Set());
    toast({
      title: "Batch Update Complete",
      description: `Moved ${count} opportunities to ${stageLabel}`,
      type: "success",
      duration: 3500,
    });
  };

  const isAllSelected = sortedJobs.length > 0 && selectedIds.size === sortedJobs.length;

  return (
    <div data-testid="table-view-container" className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-ink">All Applications</h1>
            <Badge variant="outline" className="text-xs font-mono">
              {sortedJobs.length} {sortedJobs.length === 1 ? "Record" : "Records"}
            </Badge>
          </div>
          <p className="text-xs text-ink-muted">High-density spreadsheet view of all tracked roles</p>
        </div>

        {selectedStageFilter && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-2 border border-hairline text-xs font-medium text-primary w-fit">
            <span className="capitalize">{selectedStageFilter} stage filtered</span>
            {onClearStageFilter && (
              <button
                type="button"
                onClick={onClearStageFilter}
                aria-label="Clear stage filter"
                className="hover:text-ink text-ink-muted cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop / Tablet Table View (hidden on screens < 768px) */}
      <div
        data-testid="desktop-applications-table"
        className="hidden md:block rounded-lg border border-hairline bg-surface-1 overflow-x-auto shadow-none"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface-2/70 border-b border-hairline text-ink-subtle uppercase tracking-wider font-semibold text-[10px] select-none">
            <tr>
              <th className="py-2.5 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all rows"
                  data-testid="select-all-rows-checkbox"
                  className="rounded-xs border-hairline accent-primary cursor-pointer h-3.5 w-3.5"
                />
              </th>
              <th
                onClick={() => handleSort("title")}
                className="py-2.5 px-4 cursor-pointer hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Role & Title</span>
                  {sortKey === "title" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-ink-subtle opacity-50" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("company")}
                className="py-2.5 px-4 cursor-pointer hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company</span>
                  {sortKey === "company" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-ink-subtle opacity-50" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("stage")}
                className="py-2.5 px-4 cursor-pointer hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  {sortKey === "stage" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-ink-subtle opacity-50" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("salary")}
                className="py-2.5 px-4 cursor-pointer hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Compensation</span>
                  {sortKey === "salary" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-ink-subtle opacity-50" />
                  )}
                </div>
              </th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4">Skills</th>
              <th className="py-2.5 px-4 text-right">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {sortedJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-ink-muted">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm">No applications found matching your criteria.</p>
                    {onOpenQuickAdd && (
                      <Button size="sm" onClick={onOpenQuickAdd} className="text-xs">
                        Add Opportunity
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedJobs.map((job) => {
                const isSelected = selectedIds.has(job.id);
                const currentStageConfig = STAGES.find((s) => s.id === job.stage);

                return (
                  <tr
                    key={job.id}
                    data-testid={`table-row-${job.id}`}
                    onClick={() => setSelectedJobId(job.id)}
                    className={cn(
                      "hover:bg-surface-2/50 transition-colors cursor-pointer group",
                      isSelected && "bg-surface-2/70"
                    )}
                  >
                    <td
                      className="py-3 px-3.5 text-center"
                      onClick={(e) => toggleSelectRow(job.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select ${job.title}`}
                        data-testid={`row-checkbox-${job.id}`}
                        className="rounded-xs border-hairline accent-primary cursor-pointer h-3.5 w-3.5"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[220px]">{job.title}</span>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Open original job posting"
                            className="text-ink-subtle hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
                        <span className="truncate max-w-[150px]">{job.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {/* In-row Stage Selector Dropdown */}
                      <DropdownMenu
                        align="left"
                        trigger={
                          <button
                            type="button"
                            data-testid={`stage-dropdown-trigger-${job.id}`}
                            aria-label={`Change stage from ${job.stage}`}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-surface-2 border border-hairline hover:border-primary/50 text-[11px] font-mono text-ink transition-colors cursor-pointer"
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                currentStageConfig?.dotColor
                              )}
                            />
                            <span className="capitalize">{job.stage}</span>
                            <ChevronDown className="h-3 w-3 text-ink-subtle ml-0.5" />
                          </button>
                        }
                      >
                        <div className="p-1 space-y-0.5" data-testid={`stage-dropdown-menu-${job.id}`}>
                          {STAGES.map((s) => (
                            <DropdownMenuItem
                              key={s.id}
                              onClick={() => handleStageChange(job.id, s.id)}
                              className={cn(
                                "flex items-center gap-2 text-xs",
                                job.stage === s.id && "bg-surface-2 font-medium text-primary"
                              )}
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dotColor)} />
                              <span>{s.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenu>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-muted text-[11px]">{job.salary}</td>
                    <td className="py-3 px-4 text-ink-muted">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-ink-subtle shrink-0" />
                        <span className="truncate max-w-[130px]">{job.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {job.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 2 && (
                          <span className="text-[10px] text-ink-subtle font-mono">
                            +{job.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-subtle text-[11px]">
                      <div className="flex items-center justify-end gap-1">
                        <FileText className="h-3 w-3 text-ink-subtle" />
                        <span>{job.notes?.length || 0}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List Adaptation (shown on screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {sortedJobs.length === 0 ? (
          <div className="p-8 text-center text-ink-muted border border-hairline rounded-lg bg-surface-1">
            No applications match your filter criteria.
          </div>
        ) : (
          sortedJobs.map((job) => {
            const isSelected = selectedIds.has(job.id);
            const currentStageConfig = STAGES.find((s) => s.id === job.stage);

            return (
              <div
                key={job.id}
                data-testid={`mobile-card-${job.id}`}
                onClick={() => setSelectedJobId(job.id)}
                className={cn(
                  "p-4 rounded-lg border border-hairline bg-surface-1 space-y-3 transition-colors cursor-pointer",
                  isSelected && "border-primary/50 bg-surface-2/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => toggleSelectRow(job.id, e)}
                      aria-label={`Select ${job.title}`}
                      className="mt-1 rounded-xs border-hairline accent-primary cursor-pointer h-4 w-4 shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h2 className="text-sm font-medium text-ink truncate">{job.title}</h2>
                      <p className="text-xs text-ink-muted flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 text-ink-subtle shrink-0" />
                        {job.company}
                      </p>
                    </div>
                  </div>

                  {/* Mobile In-line Stage Dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu
                      align="right"
                      trigger={
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-md bg-surface-2 border border-hairline text-xs font-mono text-ink cursor-pointer"
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              currentStageConfig?.dotColor
                            )}
                          />
                          <span className="capitalize">{job.stage}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-ink-subtle" />
                        </button>
                      }
                    >
                      <div className="p-1 space-y-0.5">
                        {STAGES.map((s) => (
                          <DropdownMenuItem
                            key={s.id}
                            onClick={() => handleStageChange(job.id, s.id)}
                            className="flex items-center gap-2 text-xs min-h-[44px]"
                          >
                            <span className={cn("w-2 h-2 rounded-full shrink-0", s.dotColor)} />
                            <span>{s.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-ink-muted pt-1 border-t border-hairline/60">
                  <span className="font-mono text-semantic-success">{job.salary}</span>
                  <span>{job.location}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Batch Actions Dock */}
      {selectedIds.size > 0 && (
        <div
          data-testid="batch-action-dock"
          className="fixed bottom-6 inset-x-0 mx-auto w-fit z-50 bg-surface-2/95 backdrop-blur-md border border-hairline shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150"
        >
          <div className="text-xs font-medium text-ink flex items-center gap-1.5 pr-2 border-r border-hairline">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>
              {selectedIds.size} {selectedIds.size === 1 ? "role" : "roles"} selected
            </span>
          </div>

          {/* Batch Stage Dropdown */}
          <DropdownMenu
            align="left"
            side="top"
            trigger={
              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 border-hairline cursor-pointer">
                <span>Move to Stage</span>
                <ChevronDown className="h-3 w-3 text-ink-subtle" />
              </Button>
            }
          >
            <div className="p-1 space-y-0.5" data-testid="batch-stage-menu">
              {STAGES.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => handleBatchMoveStage(s.id)}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dotColor)} />
                  <span>{s.label}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenu>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBatchMoveStage("archived")}
            className="h-7 text-xs text-ink-muted hover:text-ink cursor-pointer"
          >
            Archive
          </Button>

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Deselect all"
            className="p-1 text-ink-subtle hover:text-ink cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
