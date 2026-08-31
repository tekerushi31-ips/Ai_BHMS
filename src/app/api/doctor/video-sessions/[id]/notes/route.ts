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
    const body = await req.json();
    const { noteText } = body;

    if (!noteText || typeof noteText !== "string" || !noteText.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty." }, { status: 400 });
    }

    const note = await videoService.saveSessionNote(id, user.id, noteText.trim());

    return NextResponse.json({ note, message: "Consultation note recorded." });
  } catch (error: any) {
    console.error("POST /api/doctor/video-sessions/[id]/notes error:", error);
    return NextResponse.json({ error: error.message || "Failed to save session note." }, { status: 500 });
  }
}
