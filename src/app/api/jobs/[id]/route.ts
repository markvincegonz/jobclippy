import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStage } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { ok: false, error: "Job not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, data: job },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to retrieve job" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.company !== undefined) dataToUpdate.company = body.company;
    if (body.location !== undefined) dataToUpdate.location = body.location;
    if (body.salary !== undefined) dataToUpdate.salary = body.salary;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.url !== undefined) dataToUpdate.url = body.url;
    if (body.skills !== undefined && Array.isArray(body.skills)) dataToUpdate.skills = body.skills;

    if (body.stage !== undefined && Object.values(JobStage).includes(body.stage as JobStage)) {
      dataToUpdate.stage = body.stage as JobStage;
      if (body.stage === JobStage.applied && !body.appliedAt) {
        dataToUpdate.appliedAt = new Date();
      }
    }

    if (body.appliedAt !== undefined) {
      dataToUpdate.appliedAt = body.appliedAt ? new Date(body.appliedAt) : null;
    }
    if (body.interviewDate !== undefined) {
      dataToUpdate.interviewDate = body.interviewDate ? new Date(body.interviewDate) : null;
    }

    // Support adding a note during PATCH
    if (body.newNote && typeof body.newNote === "string" && body.newNote.trim()) {
      dataToUpdate.notes = {
        create: {
          text: body.newNote.trim(),
        },
      };
    }

    const updated = await prisma.job.update({
      where: { id },
      data: dataToUpdate,
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(
      { ok: true, data: updated },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update job" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await prisma.job.delete({
      where: { id },
      include: {
        notes: true,
      },
    });

    return NextResponse.json(
      { ok: true, data: deleted },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete job" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
