import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStage } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

const SEED_DATA = [
  {
    id: "job-1",
    title: "Senior Product Designer",
    company: "LinearFlow",
    location: "Remote — US",
    salary: "$125K–$155K",
    stage: JobStage.wishlist,
    skills: ["Figma", "UI/UX", "Product Design", "Agile"],
    description:
      "Lead product design initiatives across our core workflow suite. Work closely with product management and frontend engineering teams to craft delightful desktop and web experiences.",
    url: "https://linkedin.com/jobs/view/3948271",
    notes: [
      {
        id: "note-1",
        text: "Portfolio submitted to design director on Tuesday.",
        createdAt: new Date("2026-10-01T10:00:00.000Z"),
      },
    ],
    createdAt: new Date("2026-10-01T09:00:00.000Z"),
  },
  {
    id: "job-2",
    title: "Senior Frontend Engineer",
    company: "CloudVanguard",
    location: "Remote",
    salary: "$140K–$175K",
    stage: JobStage.applied,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Playwright"],
    description:
      "Architect high-performance dashboard interfaces with Next.js App Router and Tailwind. Own web application telemetry and developer tooling.",
    url: "https://cloudvanguard.io/careers/senior-frontend",
    notes: [
      {
        id: "note-2",
        text: "Applied via internal employee referral link.",
        createdAt: new Date("2026-09-28T14:30:00.000Z"),
      },
    ],
    createdAt: new Date("2026-09-27T11:00:00.000Z"),
    appliedAt: new Date("2026-09-28T14:30:00.000Z"),
  },
  {
    id: "job-3",
    title: "Fullstack Platform Engineer",
    company: "DataPulse AI",
    location: "San Francisco, CA (Hybrid)",
    salary: "$150K–$185K",
    stage: JobStage.interviewing,
    skills: ["TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
    description:
      "Build robust data streaming pipelines and microservices backing our real-time analytics engine. Experience with AWS ECS and RDS is required.",
    url: "https://datapulse.ai/jobs/platform-eng",
    notes: [
      {
        id: "note-3",
        text: "Technical screen passed. System design interview scheduled for Friday at 2 PM.",
        createdAt: new Date("2026-09-29T16:00:00.000Z"),
      },
    ],
    createdAt: new Date("2026-09-20T08:00:00.000Z"),
    appliedAt: new Date("2026-09-21T10:00:00.000Z"),
    interviewDate: new Date("2026-10-05T14:00:00.000Z"),
  },
  {
    id: "job-4",
    title: "Lead Cloud Infrastructure Engineer",
    company: "Apex HyperScale",
    location: "Remote",
    salary: "$170K–$200K",
    stage: JobStage.offer,
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Microservices"],
    description:
      "Oversee multi-region Kubernetes deployments and infrastructure automation across hybrid clouds. Lead reliability initiatives and SRE practices.",
    url: "https://apex.tech/careers/infra-lead",
    notes: [
      {
        id: "note-4",
        text: "Formal written offer received: $185K base + equity package.",
        createdAt: new Date("2026-10-02T11:00:00.000Z"),
      },
    ],
    createdAt: new Date("2026-09-10T10:00:00.000Z"),
    appliedAt: new Date("2026-09-12T09:00:00.000Z"),
    interviewDate: new Date("2026-09-25T15:00:00.000Z"),
  },
  {
    id: "job-5",
    title: "Staff Machine Learning Engineer",
    company: "Cortex Synthetics",
    location: "New York, NY",
    salary: "$190K–$230K",
    stage: JobStage.archived,
    skills: ["PyTorch", "Transformers", "CUDA", "C++", "Python", "MLOps"],
    description:
      "Research and scale foundational reasoning models. Fine-tuning multi-modal architectures for enterprise clients.",
    url: "https://cortexsynthetics.ai/roles/staff-mle",
    notes: [
      {
        id: "note-5",
        text: "Position put on hold due to hiring freeze.",
        createdAt: new Date("2026-09-15T10:00:00.000Z"),
      },
    ],
    createdAt: new Date("2026-09-01T10:00:00.000Z"),
    appliedAt: new Date("2026-09-03T11:00:00.000Z"),
  },
];

export async function POST() {
  try {
    // Clear existing notes and jobs
    await prisma.jobNote.deleteMany({});
    await prisma.job.deleteMany({});

    for (const job of SEED_DATA) {
      const { notes, ...jobData } = job;
      await prisma.job.create({
        data: {
          id: job.id,
          ...jobData,
          notes: {
            create: notes.map((n) => ({
              id: n.id,
              text: n.text,
              createdAt: n.createdAt,
            })),
          },
        },
      });
    }

    const jobs = await prisma.job.findMany({
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { ok: true, data: jobs },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/jobs/reset error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to reset jobs database" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
