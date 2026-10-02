"use client";

import * as React from "react";
import {
  Columns3,
  TableProperties,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  Sparkles,
  Inbox,
  Send,
  Calendar,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { ClippyMascot } from "@/components/clippy-mascot";
import { ThemeToggle } from "@/components/theme-toggle";
import { useJobStore, JobStage } from "@/lib/job-store";
import { cn } from "@/lib/utils";

export type AdminView = "board" | "table" | "analytics" | "settings";

interface SidebarProps {
  activeView: AdminView;
  onSelectView: (view: AdminView) => void;
  selectedStage?: JobStage | null;
  onSelectStage?: (stage: JobStage | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenResetConfirm?: () => void;
  onOpenQuickAdd?: () => void;
  className?: string;
}

const STAGE_CONFIG: {
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

export function Sidebar({
  activeView,
  onSelectView,
  selectedStage,
  onSelectStage,
  isCollapsed = false,
  onToggleCollapse,
  onOpenResetConfirm,
  onOpenQuickAdd,
  className,
}: SidebarProps) {
  const { jobs } = useJobStore();

  const counts = React.useMemo(() => {
    return {
      total: jobs.length,
      wishlist: jobs.filter((j) => j.stage === "wishlist").length,
      applied: jobs.filter((j) => j.stage === "applied").length,
      interviewing: jobs.filter((j) => j.stage === "interviewing").length,
      offer: jobs.filter((j) => j.stage === "offer").length,
      archived: jobs.filter((j) => j.stage === "archived").length,
    };
  }, [jobs]);

  return (
    <aside
      data-testid="admin-sidebar"
      aria-label="Application Navigation"
      className={cn(
        "h-screen sticky top-0 flex flex-col justify-between border-r border-hairline bg-surface-1/90 backdrop-blur-md transition-all duration-200 ease-out z-40 select-none",
        isCollapsed ? "w-14 min-w-[56px]" : "w-60 min-w-[240px]",
        className
      )}
    >
      {/* Top Workspace Header */}
      <div>
        <div
          className={cn(
            "h-14 border-b border-hairline flex items-center px-3.5 gap-2.5",
            isCollapsed ? "justify-center px-0" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-2 border border-hairline shrink-0 group">
              <ClippyMascot className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-semibold tracking-tight text-ink truncate">
                    JobClippy
                  </h1>
                  <span className="px-1 py-0.2 rounded-xs bg-surface-2 border border-hairline text-[10px] font-mono text-ink-subtle">
                    v0.1
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted truncate">Job Hunt Command Center</span>
              </div>
            )}
          </div>

          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar (Press [)"
              title="Collapse sidebar ([)"
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent hover:border-hairline transition-colors cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary Views Section */}
        <div className="p-2 space-y-1">
          {!isCollapsed && (
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              Views
            </div>
          )}

          <button
            type="button"
            data-testid="nav-board-btn"
            onClick={() => {
              onSelectView("board");
              onSelectStage?.(null);
            }}
            title={isCollapsed ? "Kanban Board" : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left",
              activeView === "board" && !selectedStage
                ? "bg-surface-2 text-ink shadow-2xs border border-hairline"
                : "text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent",
              isCollapsed && "justify-center px-0 py-2"
            )}
          >
            <Columns3 className="h-4 w-4 shrink-0 text-primary" />
            {!isCollapsed && <span className="truncate flex-1">Pipeline Board</span>}
            {!isCollapsed && (
              <span className="text-[11px] font-mono text-ink-muted px-1.5 py-0.5 rounded-xs bg-surface-2 border border-hairline">
                {counts.total - counts.archived}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="nav-table-btn"
            onClick={() => onSelectView("table")}
            title={isCollapsed ? "Applications Table" : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left",
              activeView === "table"
                ? "bg-surface-2 text-ink shadow-2xs border border-hairline"
                : "text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent",
              isCollapsed && "justify-center px-0 py-2"
            )}
          >
            <TableProperties className="h-4 w-4 shrink-0 text-ink-muted" />
            {!isCollapsed && <span className="truncate flex-1">All Applications</span>}
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-ink-subtle px-1 rounded-xs bg-surface-2">
                Table
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="nav-analytics-btn"
            onClick={() => onSelectView("analytics")}
            title={isCollapsed ? "Stage Analytics" : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left",
              activeView === "analytics"
                ? "bg-surface-2 text-ink shadow-2xs border border-hairline"
                : "text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent",
              isCollapsed && "justify-center px-0 py-2"
            )}
          >
            <BarChart3 className="h-4 w-4 shrink-0 text-ink-muted" />
            {!isCollapsed && <span className="truncate flex-1">Analytics</span>}
          </button>
        </div>

        {/* Pipeline Stage Shortcuts */}
        <div role="tablist" aria-label="Pipeline Stages" className="p-2 pt-1 space-y-0.5 border-t border-hairline mt-1">
          {!isCollapsed && (
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle flex items-center justify-between">
              <span>Pipeline Stages</span>
            </div>
          )}

          {STAGE_CONFIG.map((stage) => {
            const isStageActive = selectedStage === stage.id && activeView === "board";
            const count = counts[stage.id];

            return (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={isStageActive}
                data-testid={`stage-shortcut-${stage.id}`}
                onClick={() => {
                  onSelectView("board");
                  onSelectStage?.(isStageActive ? null : stage.id);
                }}
                title={isCollapsed ? `${stage.label} (${count})` : undefined}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left",
                  isStageActive
                    ? "bg-surface-2 text-ink font-medium border border-hairline"
                    : "text-ink-muted hover:text-ink hover:bg-surface-2/50 border border-transparent",
                  isCollapsed && "justify-center px-0 py-1.5"
                )}
              >
                <span
                  className={cn("w-1.5 h-1.5 rounded-full shrink-0", stage.dotColor)}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="truncate flex-1">{stage.label}</span>}
                {!isCollapsed && (
                  <span className="text-[11px] font-mono text-ink-muted tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls & Utilities */}
      <div className="p-2 border-t border-hairline space-y-1">
        {onOpenQuickAdd && !isCollapsed && (
          <button
            type="button"
            data-testid="sidebar-quick-add-btn"
            onClick={onOpenQuickAdd}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 mb-1 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Clip Opportunity</span>
          </button>
        )}

        <button
          type="button"
          data-testid="nav-settings-btn"
          onClick={() => onSelectView("settings")}
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left",
            activeView === "settings"
              ? "bg-surface-2 text-ink shadow-2xs border border-hairline"
              : "text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent",
            isCollapsed && "justify-center px-0 py-2"
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-ink-muted" />
          {!isCollapsed && <span className="truncate flex-1">Settings</span>}
        </button>

        {onOpenResetConfirm && !isCollapsed && (
          <button
            type="button"
            data-testid="sidebar-reset-demo-btn"
            aria-label="Reset Demo"
            onClick={onOpenResetConfirm}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-surface-2/60 transition-colors cursor-pointer border border-transparent text-left"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
            <span className="truncate flex-1">Reset Demo</span>
          </button>
        )}

        <div
          className={cn(
            "pt-1 flex items-center border-t border-hairline/80",
            isCollapsed ? "flex-col gap-2 justify-center" : "justify-between px-2"
          )}
        >
          <ThemeToggle />

          {isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar (Press [)"
              title="Expand sidebar ([)"
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 border border-hairline transition-colors cursor-pointer"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          {!isCollapsed && (
            <span className="text-[10px] font-mono text-ink-subtle">
              Toggle <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-hairline">[</kbd>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
