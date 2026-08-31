import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { examService } from "@/services/exam";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mode, responses, timeSpentSeconds, isAutoSubmitted } = body;

    if (!Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid exam responses format" }, { status: 400 });
    }

    const evaluation = examService.evaluateExam(responses, timeSpentSeconds || 0);

    // Save exam session in database
    const savedSession = await prisma.examSession.create({
      data: {
        userId: user.id,
        mode: mode || "AIAPGET",
        totalQuestions: evaluation.totalQuestions,
        durationMinutes: mode === "AIAPGET" ? 120 : 60,
        timeSpentSeconds: timeSpentSeconds || 0,
        correctCount: evaluation.correctCount,
        wrongCount: evaluation.wrongCount,
        unattemptedCount: evaluation.unattemptedCount,
        totalScore: evaluation.totalScore,
        answersJson: JSON.stringify(responses),
        subjectBreakdown: JSON.stringify(evaluation.subjectBreakdown),
        status: isAutoSubmitted ? "AUTO_SUBMITTED" : "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: savedSession.id,
      evaluation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to evaluate exam submission" },
      { status: 500 }
    );
  }
}
