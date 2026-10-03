"use client";

import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Sidebar, AdminView } from "@/components/sidebar";
import { TopContextBar } from "@/components/top-context-bar";
import { JobStage, useJobStore } from "@/lib/job-store";
import { Database, ShieldCheck, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ApplicationsTable } from "@/components/applications-table";
import { JobDetailSheet } from "@/components/job-detail-sheet";
import { QuickAddModal } from "@/components/quick-add-modal";
import { PipelineAnalytics } from "@/components/pipeline-analytics";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { CommandPalette } from "@/components/command-palette";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const SIDEBAR_STORAGE_KEY = "jobclippy_sidebar_collapsed_v1";

export interface AdminShellProps {
  children?: React.ReactNode;
  activeView?: AdminView;
  onSelectView?: (view: AdminView) => void;
  selectedStage?: JobStage | null;
  onSelectStage?: (stage: JobStage | null) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenQuickAdd?: () => void;
  onOpenResetConfirm?: () => void;
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

function AdminShellContent({
  children,
  activeView: propActiveView,
  onSelectView: propOnSelectView,
  selectedStage: propSelectedStage,
  onSelectStage: propOnSelectStage,
  searchQuery: propSearchQuery,
  onSearchChange: propOnSearchChange,
  onOpenQuickAdd: propOnOpenQuickAdd,
  onOpenResetConfirm: propOnOpenResetConfirm,
}: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const detectedView: AdminView = React.useMemo(() => {
    if (pathname?.startsWith("/applications")) return "table";
    if (pathname?.startsWith("/analytics")) return "analytics";
    if (pathname?.startsWith("/settings")) return "settings";
    return "board";
  }, [pathname]);

  const activeView = propActiveView || detectedView;
  const selectedStage =
    propSelectedStage !== undefined
      ? propSelectedStage
      : (searchParams?.get("stage") as JobStage) || null;
  const searchQuery =
    propSearchQuery !== undefined ? propSearchQuery : searchParams?.get("q") || "";

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
  const [internalIsAddOpen, setInternalIsAddOpen] = React.useState(false);
  const [internalIsResetConfirmOpen, setInternalIsResetConfirmOpen] = React.useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  const isAddOpen = internalIsAddOpen;
  const isResetConfirmOpen = internalIsResetConfirmOpen;

  const { jobs, resetToSeeds } = useJobStore();
  const { toast } = useToast();

  const toggleCollapse = React.useCallback(() => {
    saveCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Global Keyboard shortcuts: '[', 'Cmd+B', 'Cmd+K', '?', 'C', '/'
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K works globally even from within inputs
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isInput) return;

      if (e.key === "[" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b")) {
        e.preventDefault();
        saveCollapsed(!memoryCollapsed);
      } else if (
        e.key === "?" ||
        (e.shiftKey && (e.key === "/" || e.code === "Slash"))
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setInternalIsAddOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("job-search-input") as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `jobclippy_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
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

  const handleConfirmReset = async () => {
    setInternalIsResetConfirmOpen(false);
    resetToSeeds();
    toast({
      title: "Pipeline Reset",
      description: "Restored 5 initial sample tech opportunities",
      type: "success",
      duration: 3500,
    });
  };

  const handleSelectView = (v: AdminView) => {
    if (propOnSelectView) {
      propOnSelectView(v);
    } else {
      const target =
        v === "board"
          ? "/board"
          : v === "table"
          ? "/applications"
          : `/${v}`;
      router.push(target);
    }
  };

  const handleSelectStage = (s: JobStage | null) => {
    if (propOnSelectStage) {
      propOnSelectStage(s);
    } else {
      const currentPath = pathname?.startsWith("/applications") ? "/applications" : "/board";
      const nextParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (s) nextParams.set("stage", s);
      else nextParams.delete("stage");
      const target = nextParams.toString() ? `${currentPath}?${nextParams.toString()}` : currentPath;
      router.push(target);
    }
  };

  const handleSearchChange = (q: string) => {
    if (propOnSearchChange) {
      propOnSearchChange(q);
    } else {
      const nextParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (q) nextParams.set("q", q);
      else nextParams.delete("q");
      const target = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
      router.replace(target, { scroll: false });
    }
  };

  const handleOpenQuickAdd = () => {
    if (propOnOpenQuickAdd) {
      propOnOpenQuickAdd();
    } else {
      setInternalIsAddOpen(true);
    }
  };

  const handleOpenResetConfirm = () => {
    if (propOnOpenResetConfirm) {
      propOnOpenResetConfirm();
    } else {
      setInternalIsResetConfirmOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas text-ink transition-colors duration-150">
      {/* Desktop Left Sidebar (hidden on screens < 1024px) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          selectedStage={selectedStage}
          onSelectStage={handleSelectStage}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onOpenResetConfirm={handleOpenResetConfirm}
          onOpenQuickAdd={handleOpenQuickAdd}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
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
                handleSelectView(v);
                setIsMobileDrawerOpen(false);
              }}
              selectedStage={selectedStage}
              onSelectStage={(s) => {
                handleSelectStage(s);
                setIsMobileDrawerOpen(false);
              }}
              isCollapsed={false}
              onOpenResetConfirm={() => {
                handleOpenResetConfirm();
                setIsMobileDrawerOpen(false);
              }}
              onOpenQuickAdd={() => {
                handleOpenQuickAdd();
                setIsMobileDrawerOpen(false);
              }}
              onOpenShortcuts={() => {
                setIsShortcutsOpen(true);
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
          onClearStageFilter={() => handleSelectStage(null)}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onOpenQuickAdd={handleOpenQuickAdd}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
        />

        {/* Content Region */}
        <main className="flex-1 flex flex-col min-w-0">
          {children ? (
            children
          ) : (
            <>
              {activeView === "table" && (
                <>
                  <ApplicationsTable
                    searchQuery={searchQuery}
                    selectedStageFilter={selectedStage}
                    onClearStageFilter={() => handleSelectStage(null)}
                    onOpenQuickAdd={handleOpenQuickAdd}
                  />
                  <JobDetailSheet />
                </>
              )}

              {/* Analytics View */}
              {activeView === "analytics" && <PipelineAnalytics />}

              {/* Settings View */}
              {activeView === "settings" && (
                <div data-testid="settings-view-container" className="p-6 w-full space-y-6">
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
                      <Button variant="secondary" size="sm" onClick={handleOpenResetConfirm} className="text-xs border-hairline cursor-pointer">
                        Reset Demo State
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Quick Add Dialog for TopBar & Sidebar triggers */}
      <QuickAddModal open={isAddOpen} onOpenChange={setInternalIsAddOpen} />

      {/* Global Keyboard Shortcuts Modal ('?' hotkey) */}
      <KeyboardShortcutsModal open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen} />

      {/* Global Command Palette ('Cmd+K' / 'Ctrl+K') */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onOpenQuickAdd={() => setInternalIsAddOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenResetConfirm={handleOpenResetConfirm}
      />

      {/* Global Reset Demo Confirmation Dialog */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setInternalIsResetConfirmOpen}>
        <DialogClose onClick={() => setInternalIsResetConfirmOpen(false)} />
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
            onClick={() => setInternalIsResetConfirmOpen(false)}
            className="text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirmReset}
            className="text-xs font-medium cursor-pointer"
          >
            Confirm Reset
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <React.Suspense fallback={null}>
      <AdminShellContent {...props} />
    </React.Suspense>
  );
}
