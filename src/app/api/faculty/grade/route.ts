import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionType, id, score, feedback, status } = body;

    if (!id || !submissionType) {
      return NextResponse.json({ error: "Submission ID and type are required." }, { status: 400 });
    }

    const numericScore = score !== undefined && score !== null ? parseFloat(String(score)) : null;

    if (submissionType === "LOGBOOK") {
      const updated = await prisma.studentLogbook.update({
        where: { id },
        data: {
          facultyScore: numericScore,
          facultyFeedback: feedback || null,
          status: status || "REVIEWED",
        },
      });
      return NextResponse.json({ success: true, item: updated });
    } else if (submissionType === "MYSTERY_CASE") {
      const updated = await prisma.mysteryCaseSubmission.update({
        where: { id },
        data: {
          score: numericScore,
          facultyFeedback: feedback || null,
          status: status || "REVIEWED",
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "Unknown submission type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit faculty grading" },
      { status: 500 }
    );
  }
}
