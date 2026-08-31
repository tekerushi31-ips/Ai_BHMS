import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { examService } from "@/services/exam";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "AIAPGET";
    const subject = searchParams.get("subject") || "ALL";

    const questions = examService.getQuestionsForExam(mode, subject);

    // Strip out correctOption and explanation for the active test phase
    const sanitizedQuestions = questions.map((q, idx) => ({
      id: q.id,
      number: idx + 1,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    }));

    return NextResponse.json({
      success: true,
      mode,
      subject,
      totalQuestions: sanitizedQuestions.length,
      durationMinutes: mode === "AIAPGET" ? 120 : mode === "UNIVERSITY" ? 60 : 30,
      questions: sanitizedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load exam questions" },
      { status: 500 }
    );
  }
}
