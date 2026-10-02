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

const SEED_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Product Designer",
    company: "LinearFlow",
    location: "Remote — US",
    salary: "$125K–$155K",
    stage: "wishlist",
    skills: ["Figma", "UI/UX", "Product Design", "Agile"],
    description: "Lead product design initiatives across our core workflow suite. Work closely with product management and frontend engineering teams to craft delightful desktop and web experiences.",
    url: "https://linkedin.com/jobs/view/3948271",
    notes: [
      {
        id: "note-1",
        text: "Portfolio submitted to design director on Tuesday.",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ],
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "job-2",
    title: "Senior Frontend Engineer",
    company: "CloudVanguard",
    location: "Remote",
    salary: "$140K–$175K",
    stage: "applied",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Playwright"],
    description: "Architect high-performance dashboard interfaces with Next.js App Router and Tailwind. Own web application telemetry and developer tooling.",
    url: "https://cloudvanguard.io/careers/senior-frontend",
    notes: [
      {
        id: "note-2",
        text: "Applied via internal employee referral link.",
        createdAt: "2026-09-28T14:30:00.000Z",
      },
    ],
    createdAt: "2026-09-27T11:00:00.000Z",
    appliedAt: "2026-09-28T14:30:00.000Z",
  },
  {
    id: "job-3",
    title: "Fullstack Platform Engineer",
    company: "DataPulse AI",
    location: "San Francisco, CA (Hybrid)",
    salary: "$150K–$185K",
    stage: "interviewing",
    skills: ["TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
    description: "Build robust data streaming pipelines and microservices backing our real-time analytics engine. Experience with AWS ECS and RDS is required.",
    url: "https://datapulse.ai/jobs/platform-eng",
    notes: [
      {
        id: "note-3",
        text: "Technical screen passed. System design interview scheduled for Friday at 2 PM.",
        createdAt: "2026-09-29T16:00:00.000Z",
      },
    ],
    createdAt: "2026-09-20T08:00:00.000Z",
    appliedAt: "2026-09-21T10:00:00.000Z",
    interviewDate: "2026-10-05T14:00:00.000Z",
  },
  {
    id: "job-4",
    title: "Lead Cloud Infrastructure Engineer",
    company: "Apex HyperScale",
    location: "Remote",
    salary: "$170K–$200K",
    stage: "offer",
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Microservices"],
    description: "Oversee multi-region Kubernetes deployments and infrastructure automation across hybrid clouds. Lead reliability initiatives and SRE practices.",
    url: "https://apex.tech/careers/infra-lead",
    notes: [
      {
        id: "note-4",
        text: "Official offer received ($185k base + equity). Evaluating counter-offer timeline.",
        createdAt: "2026-10-02T09:00:00.000Z",
      },
    ],
    createdAt: "2026-09-10T12:00:00.000Z",
    appliedAt: "2026-09-12T15:00:00.000Z",
  },
  {
    id: "job-5",
    title: "Mobile App Developer",
    company: "NextWave Studio",
    location: "Austin, TX (On-site)",
    salary: "$110K–$130K",
    stage: "archived",
    skills: ["React", "TypeScript", "REST APIs", "Git"],
    description: "Develop cross-platform consumer apps. Requires strong UI execution and REST API consumption.",
    url: "https://nextwave.dev/jobs/mobile",
    notes: [
      {
        id: "note-5",
        text: "Position put on hold due to hiring freeze.",
        createdAt: "2026-09-15T10:00:00.000Z",
      },
    ],
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

interface JobStoreContextType {
  jobs: Job[];
  addJob: (jobData: Omit<Job, "id" | "createdAt" | "notes"> & { notes?: string }) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  moveStage: (id: string, newStage: JobStage) => void;
  addNote: (jobId: string, text: string) => void;
  deleteJob: (id: string) => void;
  resetToSeeds: () => void;
  selectedJob: Job | null;
  setSelectedJobId: (id: string | null) => void;
}

const JobStoreContext = React.createContext<JobStoreContextType | null>(null);

const STORAGE_KEY = "jobclippy_jobs_v1";

export function JobStoreProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setJobs(JSON.parse(stored));
      } else {
        setJobs(SEED_JOBS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
      }
    } catch {
      setJobs(SEED_JOBS);
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      } catch (err) {
        console.error("Failed to save jobs to localStorage", err);
      }
    }
  }, [jobs, isLoaded]);

  const addJob = React.useCallback(
    (jobData: Omit<Job, "id" | "createdAt" | "notes"> & { notes?: string }) => {
      const newJob: Job = {
        id: `job-${Date.now()}`,
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

      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    },
    []
  );

  const updateJob = React.useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const moveStage = React.useCallback((id: string, newStage: JobStage) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        const updates: Partial<Job> = { stage: newStage };
        if (newStage === "applied" && !j.appliedAt) {
          updates.appliedAt = new Date().toISOString();
        }
        return { ...j, ...updates };
      })
    );
  }, []);

  const addNote = React.useCallback((jobId: string, text: string) => {
    if (!text.trim()) return;
    const newNote: JobNote = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, notes: [newNote, ...j.notes] } : j))
    );
  }, []);

  const deleteJob = React.useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJobId((current) => (current === id ? null : current));
  }, []);

  const resetToSeeds = React.useCallback(() => {
    setJobs(SEED_JOBS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
  }, []);

  const selectedJob = React.useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  return (
    <JobStoreContext.Provider
      value={{
        jobs,
        addJob,
        updateJob,
        moveStage,
        addNote,
        deleteJob,
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
