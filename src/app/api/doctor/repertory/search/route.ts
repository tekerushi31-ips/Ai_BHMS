import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repertoryService } from "@/services/repertory";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { symptomText, chapterFilter } = await req.json();

    if (!symptomText || symptomText.trim().length === 0) {
      return NextResponse.json(
        { error: "Symptom description is required to search Kent's Repertory." },
        { status: 400 }
      );
    }

    const result = repertoryService.searchRubrics({
      symptomText,
      chapterFilter,
    });

    return NextResponse.json({
      success: true,
      matches: result.matches,
      hasVerifiedMatch: result.hasVerifiedMatch,
      message: result.message,
    });
  } catch (err) {
    console.error("[Repertory Search Error]:", err);
    return NextResponse.json(
      { error: "Repertorial lookup failed" },
      { status: 500 }
    );
  }
}
