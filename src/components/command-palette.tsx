"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Kanban,
  Table as TableIcon,
  BarChart3,
  Settings,
  Plus,
  Download,
  Sun,
  Moon,
  RotateCcw,
  HelpCircle,
  Briefcase,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useJobStore, Job } from "@/lib/job-store";
import { JobSourceBadge } from "@/components/job-source-badge";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Opportunities";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenQuickAdd?: () => void;
  onOpenShortcuts?: () => void;
  onOpenResetConfirm?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenQuickAdd,
  onOpenShortcuts,
  onOpenResetConfirm,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { jobs, setSelectedJobId } = useJobStore();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const handleExportData = React.useCallback(() => {
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
  }, [jobs]);

  const items = React.useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase().trim();

    const navigationItems: CommandItem[] = [
      {
        id: "nav-board",
        category: "Navigation",
        title: "Pipeline Board",
        subtitle: "Visual 5-stage Kanban board",
        icon: Kanban,
        badge: "View",
        action: () => {
          router.push("/board");
          onOpenChange(false);
        },
      },
      {
        id: "nav-applications",
        category: "Navigation",
        title: "All Applications",
        subtitle: "High-density sortable table with batch actions",
        icon: TableIcon,
        badge: "View",
        action: () => {
          router.push("/applications");
          onOpenChange(false);
        },
      },
      {
        id: "nav-analytics",
        category: "Navigation",
        title: "Pipeline Analytics",
        subtitle: "Conversion funnel and velocity metrics",
        icon: BarChart3,
        badge: "View",
        action: () => {
          router.push("/analytics");
          onOpenChange(false);
        },
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "Command Center Settings",
        subtitle: "Data backup and workspace preferences",
        icon: Settings,
        badge: "View",
        action: () => {
          router.push("/settings");
          onOpenChange(false);
        },
      },
    ];

    const actionItems: CommandItem[] = [
      {
        id: "act-new-job",
        category: "Actions",
        title: "Save New Job Opportunity",
        subtitle: "Heuristic parser and manual entry",
        icon: Plus,
        badge: "C",
        action: () => {
          onOpenChange(false);
          onOpenQuickAdd?.();
        },
      },
      {
        id: "act-theme",
        category: "Actions",
        title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        subtitle: "Toggle between Dark Canvas and Light Inverse",
        icon: theme === "dark" ? Sun : Moon,
        badge: "Theme",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          onOpenChange(false);
        },
      },
      {
        id: "act-export",
        category: "Actions",
        title: "Export JSON Data Backup",
        subtitle: "Download all opportunities as JSON",
        icon: Download,
        badge: "Export",
        action: () => {
          handleExportData();
          onOpenChange(false);
        },
      },
      {
        id: "act-shortcuts",
        category: "Actions",
        title: "Keyboard Shortcuts Cheatsheet",
        subtitle: "View complete keycap accelerators reference",
        icon: HelpCircle,
        badge: "?",
        action: () => {
          onOpenChange(false);
          onOpenShortcuts?.();
        },
      },
      {
        id: "act-reset",
        category: "Actions",
        title: "Reset Demo Pipeline Data",
        subtitle: "Restore curated opportunity dataset",
        icon: RotateCcw,
        badge: "Reset",
        action: () => {
          onOpenChange(false);
          onOpenResetConfirm?.();
        },
      },
    ];

    const opportunityItems: CommandItem[] = jobs.map((job) => ({
      id: `job-${job.id}`,
      category: "Opportunities",
      title: job.title,
      subtitle: `${job.company} • ${job.stage.toUpperCase()}${job.salary ? ` • ${job.salary}` : ""}`,
      icon: Briefcase,
      badge: job.stage,
      action: () => {
        setSelectedJobId(job.id);
        onOpenChange(false);
      },
    }));

    const all = [...navigationItems, ...actionItems, ...opportunityItems];

    if (!q) {
      return all;
    }

    return all.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchCategory;
    });
  }, [
    query,
    router,
    onOpenChange,
    onOpenQuickAdd,
    onOpenShortcuts,
    onOpenResetConfirm,
    theme,
    setTheme,
    handleExportData,
    jobs,
    setSelectedJobId,
  ]);

  // Keep selection within bounds
  React.useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  // Keyboard navigation inside palette (active while open)
  const handlePaletteKey = React.useCallback(
    (e: KeyboardEvent | React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [items, selectedIndex, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;
    const listener = (e: KeyboardEvent) => handlePaletteKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, handlePaletteKey]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      data-testid="command-palette-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#010102]/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => onOpenChange(false)}
      />

      {/* Floating Spotlight Card */}
      <div className="relative w-full max-w-xl rounded-xl border border-hairline bg-surface-1 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline bg-surface-2/40">
          <Search className="h-4 w-4 text-ink-subtle shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            data-testid="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page, or search tracked jobs..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-ink-subtle hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-hairline bg-surface-2 text-[10px] font-mono text-ink-subtle">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          data-testid="command-palette-results"
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-hairline/40 custom-scrollbar"
        >
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-muted">
              No matching commands or opportunities found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            (() => {
              // Group items by category
              const categories: ("Navigation" | "Actions" | "Opportunities")[] = [
                "Navigation",
                "Actions",
                "Opportunities",
              ];

              return categories.map((cat) => {
                const groupItems = items.filter((item) => item.category === cat);
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat} className="py-1 first:pt-0 last:pb-0">
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                      {cat}
                    </div>
                    <div className="space-y-0.5">
                      {groupItems.map((item) => {
                        const index = items.indexOf(item);
                        const isSelected = selectedIndex === index;
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.id}
                            data-testid={`command-item-${item.id}`}
                            data-selected={isSelected ? "true" : "false"}
                            onClick={item.action}
                            onPointerMove={() => setSelectedIndex(index)}
                            className={cn(
                              "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors duration-100",
                              isSelected
                                ? "bg-surface-2 text-ink ring-1 ring-primary/40 shadow-xs"
                                : "text-ink-muted hover:bg-surface-2/60 hover:text-ink"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "p-1.5 rounded-md border border-hairline shrink-0",
                                  isSelected
                                    ? "bg-surface-3 text-primary"
                                    : "bg-surface-2 text-ink-subtle"
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-ink truncate">
                                  {item.title}
                                </div>
                                {item.subtitle && (
                                  <div className="text-[11px] text-ink-subtle truncate">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>

                            {item.badge && (
                              <span className="shrink-0 ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono border border-hairline bg-surface-2 text-ink-subtle">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-hairline bg-surface-2/30 text-[11px] text-ink-subtle font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-hairline bg-surface-2">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-hairline bg-surface-2">↵</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded border border-hairline bg-surface-2">esc</kbd> to dismiss
          </span>
        </div>
      </div>
    </div>
  );
}
