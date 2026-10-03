"use client";

import * as React from "react";
import {
  Keyboard,
  Compass,
  Briefcase,
  TableProperties,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Global Navigation & Control",
    icon: Compass,
    shortcuts: [
      { keys: ["⌘K", "Ctrl+K"], description: "Open Command Palette (search jobs, pages, and actions)" },
      { keys: ["?"], description: "Open this keyboard shortcuts cheat sheet" },
      { keys: ["/"], description: "Focus global search across all jobs and skills" },
      { keys: ["[", "]"], description: "Toggle left navigation sidebar collapsed state" },
      { keys: ["Esc"], description: "Close any open sheet, modal, or dropdown" },
    ],
  },
  {
    title: "Pipeline Board Accelerators",
    icon: Briefcase,
    shortcuts: [
      { keys: ["C"], description: "Quick Add opportunity modal with smart heuristic extractor" },
      { keys: ["]"], description: "Advance focused job card to next pipeline stage" },
      { keys: ["["], description: "Move focused job card back to previous stage" },
      { keys: ["Drag"], description: "Drag & drop job card across stage columns" },
    ],
  },
  {
    title: "Applications Table & Bulk Triage",
    icon: TableProperties,
    shortcuts: [
      { keys: ["J", "K"], description: "Navigate down / up through table rows" },
      { keys: ["X", "Space"], description: "Toggle selection of focused row for batch actions" },
      { keys: ["Enter"], description: "Open 1.5× wide slide-over job detail sheet for focused row" },
      { keys: ["Click Row"], description: "Open 1.5× wide slide-over job detail sheet" },
      { keys: ["Header"], description: "Sort table ascending, descending, or neutral" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div data-testid="keyboard-shortcuts-modal" className="space-y-5">
        <DialogClose onClick={() => onOpenChange(false)} />

        <DialogHeader className="pb-3 border-b border-hairline">
          <DialogTitle className="flex items-center gap-2 text-base font-medium text-ink">
            <Keyboard className="h-4 w-4 text-primary" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted">
            Command center accelerators and spatial power navigation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle uppercase tracking-wider">
                  <Icon className="h-3.5 w-3.5 text-ink-muted" />
                  <span>{group.title}</span>
                </div>

                <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface-2/40 overflow-hidden">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <span className="text-ink-muted font-normal">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-0.5 min-w-[22px] text-center rounded bg-surface-3 border border-hairline font-mono text-[11px] text-ink font-medium shadow-2xs"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-2 border-t border-hairline flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>
              Press <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-hairline font-mono text-[10px]">Esc</kbd> to close anytime
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
