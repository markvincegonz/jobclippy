"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin-shell";
import { KanbanBoard } from "@/components/kanban-board";

export default function BoardPage() {
  return (
    <AdminShell activeView="board">
      <KanbanBoard hideHeader={true} />
    </AdminShell>
  );
}
