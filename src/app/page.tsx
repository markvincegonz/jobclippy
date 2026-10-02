"use client";

import * as React from "react";
import { JobStoreProvider, JobStage } from "@/lib/job-store";
import { ToastProvider } from "@/components/ui/toast";
import { KanbanBoard } from "@/components/kanban-board";
import { AdminShell } from "@/components/admin-shell";
import { AdminView } from "@/components/sidebar";

export default function Home() {
  const [activeView, setActiveView] = React.useState<AdminView>("board");
  const [selectedStage, setSelectedStage] = React.useState<JobStage | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  return (
    <ToastProvider>
      <JobStoreProvider>
        <AdminShell
          activeView={activeView}
          onSelectView={setActiveView}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenQuickAdd={() => setIsAddOpen(true)}
          onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        >
          <KanbanBoard
            externalSearchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStageFilter={selectedStage}
            onClearStageFilter={() => setSelectedStage(null)}
            hideHeader={true}
            isAddOpen={isAddOpen}
            onOpenChangeAdd={setIsAddOpen}
            isResetConfirmOpen={isResetConfirmOpen}
            onOpenChangeResetConfirm={setIsResetConfirmOpen}
          />
        </AdminShell>
      </JobStoreProvider>
    </ToastProvider>
  );
}

