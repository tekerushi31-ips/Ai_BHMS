import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { voiceService } from "@/services/voice";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rawText } = await req.json();

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "No voice transcription text provided" },
        { status: 400 }
      );
    }

    const normalized = voiceService.normalizeVoiceTranscript(rawText);

    return NextResponse.json({
      success: true,
      result: normalized,
    });
  } catch (err) {
    console.error("[Voice Normalize Error]:", err);
    return NextResponse.json(
      { error: "Failed to process multilingual audio transcription" },
      { status: 500 }
    );
  }
}
