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

const STORAGE_KEY = "jobclippy_jobs_v1";

let memoryJobs: Job[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function getStoredJobs(): Job[] {
  if (typeof window === "undefined") {
    return EMPTY_JOBS;
  }
  if (memoryJobs === null) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryJobs = Array.isArray(parsed) ? parsed : [];
      } else {
        memoryJobs = [];
      }
    } catch {
      memoryJobs = [];
    }
  }
  return memoryJobs ?? EMPTY_JOBS;
}

function saveStoredJobs(jobs: Job[]) {
  memoryJobs = jobs;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {}
  }
  notify();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  const handleCustomSync = (e: Event) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryJobs = parsed;
          notify();
          return;
        }
      }
    } catch {}

    const customEvent = e as CustomEvent<{ added?: number; job?: Job; jobs?: Job[] }>;
    const detail = customEvent?.detail;

    if (detail?.job) {
      const current = getStoredJobs();
      if (!current.some((j) => j.id === detail.job!.id)) {
        saveStoredJobs([detail.job, ...current]);
      }
    } else if (Array.isArray(detail?.jobs) && detail.jobs.length > 0) {
      const current = getStoredJobs();
      const currentIds = new Set(current.map((j) => j.id));
      const toAdd = detail.jobs.filter((j) => !currentIds.has(j.id));
      if (toAdd.length > 0) {
        saveStoredJobs([...toAdd, ...current]);
      }
    } else {
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((res) => {
          if (res.ok && Array.isArray(res.data)) {
            saveStoredJobs(res.data);
          }
        })
        .catch(() => {});
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveStoredJobs(parsed);
        }
      } catch {
        // ignore
      }
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    window.addEventListener("jobclippy:synced", handleCustomSync);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("jobclippy:synced", handleCustomSync);
    }
  };
}

const getServerSnapshot = () => EMPTY_JOBS;

export function JobStoreProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const storedJobs = React.useSyncExternalStore(
    subscribe,
    getStoredJobs,
    getServerSnapshot
  );

  // During SSR and initial client hydration, guarantee matching HTML with server
  const jobs = isHydrated ? storedJobs : EMPTY_JOBS;
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch opportunities directly from PostgreSQL via /api/jobs on mount
  React.useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) {
          const dbIds = new Set(res.data.map((j: Job) => j.id));
          const current = getStoredJobs();
          const localOnly = current.filter((j) => !dbIds.has(j.id));
          saveStoredJobs([...localOnly, ...res.data]);
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
      const currentJobs = getStoredJobs();
      const tempId = `job-${Date.now()}`;
      const newJob: Job = {
        id: tempId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || "Remote",
        salary: jobData.salary || "Salary not listed",
        stage: jobData.stage || "wishlist",
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

      saveStoredJobs([newJob, ...currentJobs]);

      // Direct persistence to PostgreSQL database
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.id) {
            const updated = getStoredJobs().map((j) =>
              j.id === tempId ? { ...j, id: data.data.id, notes: data.data.notes || j.notes } : j
            );
            saveStoredJobs(updated);
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
      const currentJobs = getStoredJobs();
      saveStoredJobs(currentJobs.map((j) => (j.id === id ? { ...j, ...updates } : j)));

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
      const currentJobs = getStoredJobs();
      let updatedPayload: Partial<Job> = { stage: newStage };
      saveStoredJobs(
        currentJobs.map((j) => {
          if (j.id !== id) return j;
          const updates: Partial<Job> = { stage: newStage };
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
      const currentJobs = getStoredJobs();
      const movingJob = currentJobs.find((j) => j.id === id);
      if (!movingJob) return;

      const isStageChanged = movingJob.stage !== targetStage;
      const updatedMovingJob: Job = {
        ...movingJob,
        stage: targetStage,
        ...(targetStage === "applied" && !movingJob.appliedAt
          ? { appliedAt: new Date().toISOString() }
          : {}),
      };

      const remaining = currentJobs.filter((j) => j.id !== id);
      const targetStageJobs = remaining.filter((j) => j.stage === targetStage);

      let finalIndexInRemaining: number;

      if (
        targetIndexInStage === undefined ||
        targetIndexInStage < 0 ||
        targetIndexInStage >= targetStageJobs.length
      ) {
        if (targetStageJobs.length === 0) {
          finalIndexInRemaining = remaining.length;
        } else {
          const lastJobInStage = targetStageJobs[targetStageJobs.length - 1];
          const lastIndex = remaining.indexOf(lastJobInStage);
          finalIndexInRemaining = lastIndex + 1;
        }
      } else {
        const targetJob = targetStageJobs[targetIndexInStage];
        finalIndexInRemaining = remaining.indexOf(targetJob);
      }

      const nextJobs = [...remaining];
      nextJobs.splice(finalIndexInRemaining, 0, updatedMovingJob);

      saveStoredJobs(nextJobs);

      if (isStageChanged) {
        fetch(`/api/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: targetStage,
            ...(targetStage === "applied" && !movingJob.appliedAt
              ? { appliedAt: updatedMovingJob.appliedAt }
              : {}),
          }),
        }).catch((err) => console.warn("Failed to persist stage move to database:", err));
      }
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
      const currentJobs = getStoredJobs();
      saveStoredJobs(
        currentJobs.map((j) => (j.id === jobId ? { ...j, notes: [newNote, ...j.notes] } : j))
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
      const currentJobs = getStoredJobs();
      const targetIndex = currentJobs.findIndex((j) => j.id === id);
      if (targetIndex === -1) return null;
      const targetJob = currentJobs[targetIndex];

      lastDeletedRecordRef.current = { job: targetJob, index: targetIndex };
      saveStoredJobs(currentJobs.filter((j) => j.id !== id));
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

    const currentJobs = getStoredJobs();
    if (currentJobs.some((j) => j.id === job.id)) return null;
    const next = [...currentJobs];
    const insertAt = Math.min(Math.max(0, index), next.length);
    next.splice(insertAt, 0, job);
    saveStoredJobs(next);

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
          saveStoredJobs(res.data);
        } else {
          saveStoredJobs([]);
        }
      })
      .catch(() => {
        saveStoredJobs([]);
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
