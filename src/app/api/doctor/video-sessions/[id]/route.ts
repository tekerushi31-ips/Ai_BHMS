import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.videoSession.findFirst({
      where: {
        id,
        doctorId: user.id,
        deletedAt: null,
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        linkedCase: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Video session not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("GET /api/doctor/video-sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch video session." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, startedAt, endedAt, durationSeconds, consentRecorded } = body;

    const existing = await prisma.videoSession.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Video session not found or unauthorized." }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (endedAt) updateData.endedAt = new Date(endedAt);
    if (typeof durationSeconds === "number") updateData.durationSeconds = durationSeconds;
    if (typeof consentRecorded === "boolean") updateData.consentRecorded = consentRecorded;

    const updated = await prisma.videoSession.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
        notes: true,
      },
    });

    // Log status changes
    if (status) {
      await auditService.logAction(
        user.id,
        `VIDEO_SESSION_${status}`,
        "video_sessions",
        id,
        { durationSeconds: updated.durationSeconds, patientId: updated.patientId }
      );
    }

    return NextResponse.json({ session: updated });
  } catch (error: any) {
    console.error("PATCH /api/doctor/video-sessions/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update video session." }, { status: 500 });
  }
}
