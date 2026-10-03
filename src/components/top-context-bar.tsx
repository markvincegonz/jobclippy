"use client";

import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  Search,
  X,
  ChevronRight,
  PanelLeft,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobStage } from "@/lib/job-store";
import { AdminView } from "@/components/sidebar";
import { cn } from "@/lib/utils";

interface TopContextBarProps {
  activeView?: AdminView;
  selectedStage?: JobStage | null;
  onClearStageFilter?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenQuickAdd?: () => void;
  onOpenShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleMobileDrawer?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  className?: string;
}

const VIEW_TITLES: Record<AdminView, { section: string; title: string }> = {
  board: { section: "Workspace", title: "Active Pipeline" },
  table: { section: "Applications", title: "Tabular Directory" },
  analytics: { section: "Insights", title: "Funnel Analytics" },
  settings: { section: "Preferences", title: "Command Center Settings" },
};

const STAGE_NAMES: Record<JobStage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer Received",
  archived: "Archived",
};

export function TopContextBar({
  activeView,
  selectedStage,
  onClearStageFilter,
  searchQuery,
  onSearchChange,
  onOpenQuickAdd,
  onOpenShortcuts,
  onOpenCommandPalette,
  onToggleMobileDrawer,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  className,
}: TopContextBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const detectedView: AdminView = React.useMemo(() => {
    if (pathname?.startsWith("/applications")) return "table";
    if (pathname?.startsWith("/analytics")) return "analytics";
    if (pathname?.startsWith("/settings")) return "settings";
    return "board";
  }, [pathname]);

  const currentViewKey = activeView || detectedView;
  const currentView = VIEW_TITLES[currentViewKey] || VIEW_TITLES.board;

  const currentStage =
    selectedStage !== undefined ? selectedStage : (searchParams?.get("stage") as JobStage) || null;

  const currentQuery = searchQuery !== undefined ? searchQuery : searchParams?.get("q") || "";

  const handleClearStage = () => {
    if (onClearStageFilter) {
      onClearStageFilter();
    } else {
      const nextParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
      nextParams.delete("stage");
      const target = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
      router.push(target);
    }
  };

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      const nextParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
      if (val) {
        nextParams.set("q", val);
      } else {
        nextParams.delete("q");
      }
      const target = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
      router.replace(target, { scroll: false });
    }
  };

  return (
    <header
      data-testid="top-context-bar"
      className={cn(
        "h-12 border-b border-hairline bg-canvas/90 backdrop-blur-md px-4 flex items-center justify-between gap-3 sticky top-0 z-30 select-none shadow-none",
        className
      )}
    >
      {/* Left Area: Mobile Trigger, Desktop Collapse Rail, Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Toggle (hidden on lg+) */}
        {onToggleMobileDrawer && (
          <Button
            variant="ghost"
            size="icon-xs"
            data-testid="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileDrawer}
            className="lg:hidden h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-2"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Expand Sidebar Icon on Desktop if Collapsed */}
        {isSidebarCollapsed && onToggleSidebarCollapse && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex h-7 w-7 text-ink-muted hover:text-ink hover:bg-surface-2"
            aria-label="Expand sidebar (Press [)"
            title="Expand sidebar ([)"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Linear-styled Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs truncate">
          <span className="text-ink-subtle font-medium">{currentView.section}</span>
          <ChevronRight className="h-3 w-3 text-ink-subtle shrink-0" />
          <span className="text-ink font-medium truncate">{currentView.title}</span>

          {currentStage && (
            <>
              <ChevronRight className="h-3 w-3 text-ink-subtle shrink-0" />
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-surface-2 border border-hairline text-primary font-medium">
                <span>{STAGE_NAMES[currentStage]}</span>
                <button
                  type="button"
                  onClick={handleClearStage}
                  aria-label="Clear stage filter"
                  className="hover:text-ink text-ink-muted cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Right Area: Search, Quick Add, Theme Toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Inline Search Bar */}
        <div className="relative w-36 sm:w-56 md:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink-subtle" />
          <Input
            id="job-search-input"
            data-testid="job-search-input"
            value={currentQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search roles, skills, companies..."
            className="pl-8 pr-2.5 h-7 text-xs bg-surface-1 border-hairline focus:border-primary/50"
          />
        </div>

        {/* Command Palette Trigger Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            id="topbar-command-palette-btn"
            data-testid="topbar-command-palette-btn"
            onClick={onOpenCommandPalette}
            title="Command Palette (Cmd+K / Ctrl+K)"
            aria-label="Open Command Palette"
            className="hidden sm:inline-flex items-center gap-1.5 px-2 h-7 rounded-md border border-hairline bg-surface-1 hover:bg-surface-2 text-ink-muted hover:text-ink text-xs transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-ink-subtle">Command</span>
            <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-hairline bg-surface-2 text-ink-muted">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Keyboard Shortcuts Trigger Button */}
        {onOpenShortcuts && (
          <Button
            variant="ghost"
            size="icon-xs"
            id="topbar-shortcuts-btn"
            data-testid="topbar-shortcuts-btn"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
            className="h-7 w-7 text-ink-muted hover:text-ink hover:bg-surface-2 cursor-pointer"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Quick Add Opportunity Button */}
        {onOpenQuickAdd && (
          <Button
            size="sm"
            id="quick-add-btn"
            data-testid="quick-add-btn"
            onClick={onOpenQuickAdd}
            className="h-7 px-2.5 text-xs gap-1.5 bg-primary text-white hover:bg-primary-hover shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Job</span>
          </Button>
        )}
      </div>
    </header>
  );
}
