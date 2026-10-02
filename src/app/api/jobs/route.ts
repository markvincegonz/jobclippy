import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStage } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  try {
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
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch jobs from database" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.company) {
      return NextResponse.json(
        { ok: false, error: "Title and Company are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const stageValue = (body.stage && Object.values(JobStage).includes(body.stage as JobStage))
      ? (body.stage as JobStage)
      : JobStage.wishlist;

    const newJob = await prisma.job.create({
      data: {
        title: body.title,
        company: body.company,
        location: body.location || "Remote",
        salary: body.salary || "Salary not listed",
        stage: stageValue,
        skills: Array.isArray(body.skills) ? body.skills : [],
        description: body.description || "",
        url: body.url || "",
        notes: body.notes
          ? {
              create: Array.isArray(body.notes)
                ? body.notes.map((n: { text: string }) => ({ text: n.text }))
                : typeof body.notes === "string" && body.notes.trim()
                ? [{ text: body.notes.trim() }]
                : [],
            }
          : undefined,
      },
      include: {
        notes: true,
      },
    });

    return NextResponse.json(
      { ok: true, data: newJob },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create job in database" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
