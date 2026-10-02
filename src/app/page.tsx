"use client";

import { JobStoreProvider } from "@/lib/job-store";
import { KanbanBoard } from "@/components/kanban-board";

export default function Home() {
  return (
    <JobStoreProvider>
      <KanbanBoard />
    </JobStoreProvider>
  );
}
