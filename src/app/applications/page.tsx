"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin-shell";
import { ApplicationsTable } from "@/components/applications-table";
import { JobDetailSheet } from "@/components/job-detail-sheet";

export default function ApplicationsPage() {
  return (
    <AdminShell activeView="table">
      <ApplicationsTable />
      <JobDetailSheet />
    </AdminShell>
  );
}
