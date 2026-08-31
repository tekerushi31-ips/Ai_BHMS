import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { videoService } from "@/services/video";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { noteId } = body;

    const caseVisit = await videoService.pushNoteToPatientRecord(id, user.id, noteId);

    return NextResponse.json({
      caseVisit,
      message: "Consultation notes pushed to patient case record successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/doctor/video-sessions/[id]/push-to-record error:", error);
    return NextResponse.json({ error: error.message || "Failed to push notes to record." }, { status: 500 });
  }
}
