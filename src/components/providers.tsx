"use client";

import * as React from "react";
import { JobStoreProvider } from "@/lib/job-store";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <JobStoreProvider>
        {children}
      </JobStoreProvider>
    </ToastProvider>
  );
}
