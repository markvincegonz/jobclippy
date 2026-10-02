"use client";

import { JobStoreProvider } from "@/lib/job-store";
import { ToastProvider } from "@/components/ui/toast";
import { KanbanBoard } from "@/components/kanban-board";

export default function Home() {
  return (
    <ToastProvider>
      <JobStoreProvider>
        <KanbanBoard />
      </JobStoreProvider>
    </ToastProvider>
  );
}
