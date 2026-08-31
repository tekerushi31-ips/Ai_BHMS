import { NextResponse } from "next/server";
import { videoService } from "@/services/video";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const result = await videoService.validateJoinToken(token);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      session: result.session,
    });
  } catch (error: any) {
    console.error("GET /api/video-call/join/[token] error:", error);
    return NextResponse.json({ valid: false, error: "Validation failed." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const { consentAccepted } = body;

    const validation = await videoService.validateJoinToken(token);
    if (!validation.valid || !validation.session) {
      return NextResponse.json({ error: validation.message || "Invalid token" }, { status: 400 });
    }

    const session = await prisma.videoSession.findUnique({
      where: { joinToken: token },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updateData: any = {
      consentRecorded: Boolean(consentAccepted),
    };

    if (session.status === "SCHEDULED" || session.status === "WAITING") {
      updateData.status = "ACTIVE";
      if (!session.startedAt) updateData.startedAt = new Date();
    }

    const updated = await prisma.videoSession.update({
      where: { id: session.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      message: "Patient joined consultation room.",
    });
  } catch (error: any) {
    console.error("POST /api/video-call/join/[token] error:", error);
    return NextResponse.json({ error: "Failed to join session." }, { status: 500 });
  }
}
