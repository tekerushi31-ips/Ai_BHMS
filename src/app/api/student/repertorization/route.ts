import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repertoryService } from "@/services/repertory";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const chapter = searchParams.get("chapter") || "ALL";

    const searchResult = repertoryService.searchRubrics({
      symptomText: q,
      chapterFilter: chapter,
    });

    return NextResponse.json({
      chapters: RepertoryServiceClassChapters(),
      ...searchResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to search rubrics" }, { status: 500 });
  }
}

function RepertoryServiceClassChapters() {
  return [
    "ALL",
    "MIND",
    "VERTIGO",
    "HEAD",
    "EYE",
    "VISION",
    "EAR",
    "HEARING",
    "NOSE",
    "FACE",
    "MOUTH",
    "TEETH",
    "THROAT",
    "EXTERNAL THROAT",
    "STOMACH",
    "ABDOMEN",
    "RECTUM",
    "STOOL",
    "BLADDER",
    "KIDNEYS",
    "PROSTATE",
    "URETHRA",
    "URINE",
    "GENITALIA MALE",
    "GENITALIA FEMALE",
    "LARYNX AND TRACHEA",
    "RESPIRATION",
    "COUGH",
    "EXPECTORATION",
    "CHEST",
    "BACK",
    "EXTREMITIES",
    "SLEEP",
    "CHILL",
    "FEVER",
    "PERSPIRATION",
    "SKIN",
    "GENERALITIES",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rubricIds, saveSession, sessionTitle } = body;

    if (!Array.isArray(rubricIds) || rubricIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one rubric to repertorize." },
        { status: 400 }
      );
    }

    const result = repertoryService.repertorizeRubrics(rubricIds);

    let savedSession = null;
    if (saveSession) {
      savedSession = await prisma.repertorySession.create({
        data: {
          userId: user.id,
          title: sessionTitle || `Repertorization of ${rubricIds.length} Rubrics`,
          selectedRubrics: JSON.stringify(result.rubrics),
          resultsJson: JSON.stringify(result.remedyScores),
        },
      });
    }

    return NextResponse.json({
      success: true,
      result,
      savedSessionId: savedSession?.id || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to calculate repertorization" },
      { status: 500 }
    );
  }
}
