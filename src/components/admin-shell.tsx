"use client";

import * as React from "react";
import { Sidebar, AdminView } from "@/components/sidebar";
import { TopContextBar } from "@/components/top-context-bar";
import { JobStage, useJobStore } from "@/lib/job-store";
import { Database, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const SIDEBAR_STORAGE_KEY = "jobclippy_sidebar_collapsed_v1";

interface AdminShellProps {
  children?: React.ReactNode;
  activeView: AdminView;
  onSelectView: (view: AdminView) => void;
  selectedStage: JobStage | null;
  onSelectStage: (stage: JobStage | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenQuickAdd: () => void;
  onOpenResetConfirm: () => void;
}

// External store for sidebar collapsed state to avoid SSR hydration mismatch
let memoryCollapsed = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function getCollapsedSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (val !== null) memoryCollapsed = val === "true";
  } catch {
    // fallback
  }
  return memoryCollapsed;
}

function saveCollapsed(collapsed: boolean) {
  memoryCollapsed = collapsed;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }
  notify();
}

function subscribeCollapsed(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function AdminShell({
  children,
  activeView,
  onSelectView,
  selectedStage,
  onSelectStage,
  searchQuery,
  onSearchChange,
  onOpenQuickAdd,
  onOpenResetConfirm,
}: AdminShellProps) {
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const storedCollapsed = React.useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    () => false
  );

  const isCollapsed = isHydrated ? storedCollapsed : false;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  const { jobs } = useJobStore();
  const { toast } = useToast();

  const toggleCollapse = React.useCallback(() => {
    saveCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Global Keyboard shortcut '[' or 'Cmd+B' to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;

      if (e.key === "[" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b")) {
        e.preventDefault();
        saveCollapsed(!memoryCollapsed);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jobclippy_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast({
      title: "Pipeline Exported",
      description: `Downloaded ${jobs.length} opportunities as JSON backup`,
      type: "success",
      duration: 3500,
    });
  };

  return (
    <div className="flex min-h-screen bg-canvas text-ink transition-colors duration-150">
      {/* Desktop Left Sidebar (hidden on screens < 1024px) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeView={activeView}
          onSelectView={onSelectView}
          selectedStage={selectedStage}
          onSelectStage={onSelectStage}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onOpenResetConfirm={onOpenResetConfirm}
          onOpenQuickAdd={onOpenQuickAdd}
        />
      </div>

      {/* Mobile Drawer (Slide-over on screens < 1024px) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#010102]/80 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              activeView={activeView}
              onSelectView={(v) => {
                onSelectView(v);
                setIsMobileDrawerOpen(false);
              }}
              selectedStage={selectedStage}
              onSelectStage={(s) => {
                onSelectStage(s);
                setIsMobileDrawerOpen(false);
              }}
              isCollapsed={false}
              onOpenResetConfirm={() => {
                onOpenResetConfirm();
                setIsMobileDrawerOpen(false);
              }}
              onOpenQuickAdd={() => {
                onOpenQuickAdd();
                setIsMobileDrawerOpen(false);
              }}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Main Administrative Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Streamlined Context Bar */}
        <TopContextBar
          activeView={activeView}
          selectedStage={selectedStage}
          onClearStageFilter={() => onSelectStage(null)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenQuickAdd={onOpenQuickAdd}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
        />

        {/* Content Region */}
        <main className="flex-1 flex flex-col min-w-0">
          {activeView === "board" && children}

          {/* Table View Placeholder */}
          {activeView === "table" && (
            <div data-testid="table-view-container" className="p-6 max-w-7xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h1 className="text-xl font-medium tracking-tight text-ink">All Applications</h1>
                  <p className="text-xs text-ink-muted">High-density spreadsheet view of all tracked roles</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {jobs.length} Records
                </Badge>
              </div>

              <div className="rounded-lg border border-hairline bg-surface-1 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2/60 border-b border-hairline text-ink-subtle uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Title & Role</th>
                      <th className="py-2.5 px-4">Company</th>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">Compensation</th>
                      <th className="py-2.5 px-4">Location</th>
                      <th className="py-2.5 px-4 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-ink">{job.title}</td>
                        <td className="py-3 px-4 text-ink-muted">{job.company}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-1.5 py-0.5 rounded-xs bg-surface-2 border border-hairline text-[11px] font-mono">
                            {job.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-ink-muted">{job.salary}</td>
                        <td className="py-3 px-4 text-ink-muted">{job.location}</td>
                        <td className="py-3 px-4 text-right font-mono text-ink-subtle">{job.notes?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics View Placeholder */}
          {activeView === "analytics" && (
            <div data-testid="analytics-view-container" className="p-6 max-w-7xl mx-auto w-full space-y-6">
              <div className="pb-3 border-b border-hairline">
                <h1 className="text-xl font-medium tracking-tight text-ink">Pipeline Velocity & Funnel</h1>
                <p className="text-xs text-ink-muted">Application conversions, interview progression rates, and volume metrics</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-1">
                  <div className="text-xs text-ink-muted">Wishlist Conversion Rate</div>
                  <div className="text-2xl font-medium tracking-tight text-ink">
                    {jobs.length ? `${Math.round(((jobs.length - jobs.filter((j) => j.stage === "wishlist").length) / jobs.length) * 100)}%` : "0%"}
                  </div>
                  <div className="text-[11px] text-ink-subtle">Saved roles converted to applications</div>
                </div>

                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-1">
                  <div className="text-xs text-ink-muted">Interview Screen Rate</div>
                  <div className="text-2xl font-medium tracking-tight text-ink">
                    {jobs.filter((j) => j.stage !== "wishlist").length
                      ? `${Math.round((jobs.filter((j) => j.stage === "interviewing" || j.stage === "offer").length / Math.max(1, jobs.filter((j) => j.stage !== "wishlist").length)) * 100)}%`
                      : "0%"}
                  </div>
                  <div className="text-[11px] text-ink-subtle">Applications landing screens/loops</div>
                </div>

                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-1">
                  <div className="text-xs text-ink-muted">Offers Received</div>
                  <div className="text-2xl font-medium tracking-tight text-semantic-success">
                    {jobs.filter((j) => j.stage === "offer").length}
                  </div>
                  <div className="text-[11px] text-ink-subtle">Proposals & negotiations</div>
                </div>

                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-1">
                  <div className="text-xs text-ink-muted">Archived Searches</div>
                  <div className="text-2xl font-medium tracking-tight text-ink-muted">
                    {jobs.filter((j) => j.stage === "archived").length}
                  </div>
                  <div className="text-[11px] text-ink-subtle">Concluded or paused positions</div>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeView === "settings" && (
            <div data-testid="settings-view-container" className="p-6 max-w-4xl mx-auto w-full space-y-6">
              <div className="pb-3 border-b border-hairline">
                <h1 className="text-xl font-medium tracking-tight text-ink">Command Center Settings</h1>
                <p className="text-xs text-ink-muted">Data backup, workspace preferences, and demonstration management</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-medium text-ink">Data Portability & Backup</h2>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Export your opportunities, notes, and salary detections as portable JSON.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={handleExportData} className="text-xs gap-1.5 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                      <span>Export JSON Backup</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-ink-muted" />
                    <h2 className="text-sm font-medium text-ink">Demo Reset & Troubleshooting</h2>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Restore the initial sample dataset (5 curated tech opportunities across all stages).
                  </p>
                  <Button variant="secondary" size="sm" onClick={onOpenResetConfirm} className="text-xs border-hairline cursor-pointer">
                    Reset Demo State
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
