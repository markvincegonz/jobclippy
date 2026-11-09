"use client";

import * as React from "react";

export type JobStage = "wishlist" | "applied" | "interviewing" | "offer" | "archived";

export interface JobNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  stage: JobStage;
  skills: string[];
  description: string;
  url: string;
  position?: number;
  notes: JobNote[];
  createdAt: string;
  appliedAt?: string;
  interviewDate?: string;
}

const EMPTY_JOBS: Job[] = [];

interface JobStoreContextType {
  jobs: Job[];
  isHydrated: boolean;
  isLoading: boolean;
  addJob: (jobData: Omit<Job, "id" | "createdAt" | "notes"> & { notes?: string }) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  moveStage: (id: string, newStage: JobStage) => void;
  reorderJob: (id: string, targetStage: JobStage, targetIndexInStage?: number) => void;
  addNote: (jobId: string, text: string) => void;
  deleteJob: (id: string) => Job | null;
  restoreLastDeletedJob: () => Job | null;
  resetToSeeds: () => void;
  selectedJob: Job | null;
  setSelectedJobId: (id: string | null) => void;
}

const JobStoreContext = React.createContext<JobStoreContextType | null>(null);

let memoryJobs: Job[] = EMPTY_JOBS;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function getMemorySnapshot(): Job[] {
  return memoryJobs;
}

function setMemoryJobs(jobs: Job[]) {
  memoryJobs = jobs;
  notify();
}

if (typeof window !== "undefined") {
  window.addEventListener("jobclippy:synced", (e: Event) => {
    const customEvent = e as CustomEvent<{ added?: number; job?: Job; jobs?: Job[]; source?: string }>;
    const detail = customEvent?.detail;

    if (detail?.job) {
      if (!memoryJobs.some((j) => j.id === detail.job!.id)) {
        setMemoryJobs([detail.job, ...memoryJobs]);
      }
    } else if (Array.isArray(detail?.jobs) && detail.jobs.length > 0) {
      const currentIds = new Set(memoryJobs.map((j) => j.id));
      const toAdd = detail.jobs.filter((j) => !currentIds.has(j.id));
      if (toAdd.length > 0) {
        setMemoryJobs([...toAdd, ...memoryJobs]);
      }
    } else {
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((res) => {
          if (res.ok && Array.isArray(res.data)) {
            const dbIds = new Set(res.data.map((j: Job) => j.id));
            const inMemoryOnly = memoryJobs.filter((j) => !dbIds.has(j.id));
            setMemoryJobs([...inMemoryOnly, ...res.data]);
          }
        })
        .catch(() => {});
    }
  });
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

const getServerSnapshot = () => EMPTY_JOBS;

export function JobStoreProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentJobs = React.useSyncExternalStore(
    subscribe,
    getMemorySnapshot,
    getServerSnapshot
  );

  // During SSR and initial client hydration, guarantee matching HTML with server
  const jobs = isHydrated ? currentJobs : EMPTY_JOBS;
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch opportunities directly from PostgreSQL via /api/jobs on mount
  React.useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) {
          const dbIds = new Set(res.data.map((j: Job) => j.id));
          const current = getMemorySnapshot();
          const inMemoryOnly = current.filter((j) => !dbIds.has(j.id));
          setMemoryJobs([...inMemoryOnly, ...res.data]);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch jobs from PostgreSQL /api/jobs:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addJob = React.useCallback(
    (jobData: Omit<Job, "id" | "createdAt" | "notes"> & { notes?: string }) => {
      const existing = getMemorySnapshot();
      const targetStage = jobData.stage || "wishlist";
      const stageJobs = existing.filter((j) => j.stage === targetStage);
      const minPos = stageJobs.length > 0
        ? Math.min(...stageJobs.map((j) => j.position ?? 0)) - 1000
        : 0;

      const tempId = `job-${Date.now()}`;
      const newJob: Job = {
        id: tempId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || "Remote",
        salary: jobData.salary || "Salary not listed",
        stage: targetStage,
        position: minPos,
        skills: jobData.skills || [],
        description: jobData.description || "",
        url: jobData.url || "https://linkedin.com",
        createdAt: new Date().toISOString(),
        notes: jobData.notes
          ? [
              {
                id: `note-${Date.now()}`,
                text: jobData.notes,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      };

      setMemoryJobs([newJob, ...existing]);

      // Direct persistence to PostgreSQL database
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jobData, position: minPos }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.id) {
            const updated = getMemorySnapshot().map((j) =>
              j.id === tempId ? { ...j, id: data.data.id, notes: data.data.notes || j.notes } : j
            );
            setMemoryJobs(updated);
            setSelectedJobId((current) => (current === tempId ? data.data.id : current));
          }
        })
        .catch((err) => console.warn("Failed to persist job to database:", err));

      return newJob;
    },
    []
  );

  const updateJob = React.useCallback(
    (id: string, updates: Partial<Job>) => {
      const existing = getMemorySnapshot();
      setMemoryJobs(existing.map((j) => (j.id === id ? { ...j, ...updates } : j)));

      fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((err) => console.warn("Failed to persist update to database:", err));
    },
    []
  );

  const moveStage = React.useCallback(
    (id: string, newStage: JobStage) => {
      const existing = getMemorySnapshot();
      const targetJobs = existing.filter((j) => j.stage === newStage && j.id !== id);
      const minPos = targetJobs.length > 0
        ? Math.min(...targetJobs.map((j) => j.position ?? 0)) - 1000
        : 0;

      let updatedPayload: Partial<Job> = { stage: newStage, position: minPos };
      setMemoryJobs(
        existing.map((j) => {
          if (j.id !== id) return j;
          const updates: Partial<Job> = { stage: newStage, position: minPos };
          if (newStage === "applied" && !j.appliedAt) {
            updates.appliedAt = new Date().toISOString();
          }
          updatedPayload = updates;
          return { ...j, ...updates };
        })
      );

      fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      }).catch((err) => console.warn("Failed to persist stage move to database:", err));
    },
    []
  );

  const reorderJob = React.useCallback(
    (id: string, targetStage: JobStage, targetIndexInStage?: number) => {
      const existing = getMemorySnapshot();
      const movingJob = existing.find((j) => j.id === id);
      if (!movingJob) return;

      const remaining = existing.filter((j) => j.id !== id);
      const targetStageJobs = remaining.filter((j) => j.stage === targetStage);

      let finalIndexInRemaining: number;
      let newPosition: number;

      if (
        targetIndexInStage === undefined ||
        targetIndexInStage < 0 ||
        targetIndexInStage >= targetStageJobs.length
      ) {
        if (targetStageJobs.length === 0) {
          finalIndexInRemaining = remaining.length;
          newPosition = 0;
        } else {
          const lastJobInStage = targetStageJobs[targetStageJobs.length - 1];
          finalIndexInRemaining = remaining.indexOf(lastJobInStage) + 1;
          newPosition = (lastJobInStage.position ?? 0) + 1000;
        }
      } else if (targetIndexInStage === 0) {
        const firstJobInStage = targetStageJobs[0];
        finalIndexInRemaining = remaining.indexOf(firstJobInStage);
        newPosition = (firstJobInStage.position ?? 0) - 1000;
      } else {
        const prevJob = targetStageJobs[targetIndexInStage - 1];
        const nextJob = targetStageJobs[targetIndexInStage];
        finalIndexInRemaining = remaining.indexOf(nextJob);
        const prevPos = prevJob.position ?? 0;
        const nextPos = nextJob.position ?? 0;
        newPosition = (prevPos + nextPos) / 2;
      }

      const updatedMovingJob: Job = {
        ...movingJob,
        stage: targetStage,
        position: newPosition,
        ...(targetStage === "applied" && !movingJob.appliedAt
          ? { appliedAt: new Date().toISOString() }
          : {}),
      };

      const nextJobs = [...remaining];
      nextJobs.splice(finalIndexInRemaining, 0, updatedMovingJob);
      setMemoryJobs(nextJobs);

      fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: targetStage,
          position: newPosition,
          ...(targetStage === "applied" && !movingJob.appliedAt
            ? { appliedAt: updatedMovingJob.appliedAt }
            : {}),
        }),
      }).catch((err) => console.warn("Failed to persist stage/position move to database:", err));
    },
    []
  );

  const addNote = React.useCallback(
    (jobId: string, text: string) => {
      if (!text.trim()) return;
      const newNote: JobNote = {
        id: `note-${Date.now()}`,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const existing = getMemorySnapshot();
      setMemoryJobs(
        existing.map((j) => (j.id === jobId ? { ...j, notes: [newNote, ...j.notes] } : j))
      );

      fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newNote: text.trim() }),
      }).catch((err) => console.warn("Failed to persist note to database:", err));
    },
    []
  );

  const lastDeletedRecordRef = React.useRef<{
    job: Job;
    index: number;
  } | null>(null);

  const deleteJob = React.useCallback(
    (id: string): Job | null => {
      const existing = getMemorySnapshot();
      const targetIndex = existing.findIndex((j) => j.id === id);
      if (targetIndex === -1) return null;
      const targetJob = existing[targetIndex];

      lastDeletedRecordRef.current = { job: targetJob, index: targetIndex };
      setMemoryJobs(existing.filter((j) => j.id !== id));
      setSelectedJobId((current) => (current === id ? null : current));

      fetch(`/api/jobs/${id}`, { method: "DELETE" }).catch((err) =>
        console.warn("Failed to persist delete to database:", err)
      );

      return targetJob;
    },
    []
  );

  const restoreLastDeletedJob = React.useCallback((): Job | null => {
    const record = lastDeletedRecordRef.current;
    if (!record) return null;
    const { job, index } = record;

    const existing = getMemorySnapshot();
    if (existing.some((j) => j.id === job.id)) return null;
    const next = [...existing];
    const insertAt = Math.min(Math.max(0, index), next.length);
    next.splice(insertAt, 0, job);
    setMemoryJobs(next);

    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    }).catch((err) => console.warn("Failed to re-persist restored job:", err));

    lastDeletedRecordRef.current = null;
    return job;
  }, []);

  const resetToSeeds = React.useCallback(() => {
    fetch("/api/jobs/reset", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) {
          setMemoryJobs(res.data);
        } else {
          setMemoryJobs([]);
        }
      })
      .catch(() => {
        setMemoryJobs([]);
      });
  }, []);

  const selectedJob = React.useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  return (
    <JobStoreContext.Provider
      value={{
        jobs,
        isHydrated,
        isLoading,
        addJob,
        updateJob,
        moveStage,
        reorderJob,
        addNote,
        deleteJob,
        restoreLastDeletedJob,
        resetToSeeds,
        selectedJob,
        setSelectedJobId,
      }}
    >
      {children}
    </JobStoreContext.Provider>
  );
}

export function useJobStore() {
  const ctx = React.useContext(JobStoreContext);
  if (!ctx) {
    throw new Error("useJobStore must be used within a JobStoreProvider");
  }
  return ctx;
}
