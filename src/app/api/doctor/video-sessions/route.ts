import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoService } from "@/services/video";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const whereClause: any = {
      doctorId: user.id,
      deletedAt: null,
    };

    if (patientId) whereClause.patientId = patientId;
    if (status) whereClause.status = status;

    const sessions = await prisma.videoSession.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            patientCode: true,
            age: true,
            gender: true,
            contact: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("GET /api/doctor/video-sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch video sessions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access. Doctor credentials required." }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, linkedCaseId, scheduledAt, isInstant } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient selection is required." }, { status: 400 });
    }

    // Verify patient belongs to this doctor (Tenant Isolation)
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: user.id, deletedAt: null },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found or unauthorized access." }, { status: 404 });
    }

    const origin = req.headers.get("origin") || req.headers.get("host") ? `http://${req.headers.get("host")}` : "http://localhost:3005";

    const { session, patientJoinUrl } = await videoService.createVideoSession(
      {
        doctorId: user.id,
        patientId,
        linkedCaseId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isInstant: Boolean(isInstant),
      },
      origin
    );

    return NextResponse.json({
      session,
      patientJoinUrl,
      message: isInstant ? "Instant video consultation room ready." : "Video consultation scheduled successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/doctor/video-sessions error:", error);
    return NextResponse.json({ error: error.message || "Failed to create video session." }, { status: 500 });
  }
}
