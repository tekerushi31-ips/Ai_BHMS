import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, answers, timeSpentSec = 120 } = await req.json();

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No answers submitted" }, { status: 400 });
    }

    const dbQuestions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    let correctCount = 0;
    const topicStats: Record<string, { total: number; correct: number }> = {};
    const questionReview: Array<{
      id: string;
      question: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
      referenceBook: string;
    }> = [];

    dbQuestions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctOption;
      if (isCorrect) correctCount++;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;

      questionReview.push({
        id: q.id,
        question: q.question,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
        referenceBook: q.referenceBook,
      });
    });

    const totalQuestions = dbQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Save QuizAttempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        subject: subject || "Materia Medica",
        totalQuestions,
        correctCount,
        timeSpentSec,
        answersJson: JSON.stringify(answers),
        topicBreakdownJson: JSON.stringify(topicStats),
      },
    });

    // Update LearningProgress
    await prisma.learningProgress.upsert({
      where: {
        userId_subject: {
          userId: user.id,
          subject: subject || "Materia Medica",
        },
      },
      create: {
        userId: user.id,
        subject: subject || "Materia Medica",
        masteryLevel: percentage,
        quizzesTaken: 1,
      },
      update: {
        quizzesTaken: { increment: 1 },
        masteryLevel: percentage,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score: `${correctCount}/${totalQuestions}`,
      percentage,
      timeSpentSec,
      topicStats,
      questionReview,
    });
  } catch (err) {
    console.error("[Quiz Submit Error]:", err);
    return NextResponse.json({ error: "Failed to evaluate quiz" }, { status: 500 });
  }
}
