import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [quizAttempts, vivaSessions, vpSessions, learningProgress] =
    await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vivaSession.findMany({
        where: { userId: user.id },
        include: { answers: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.virtualPatientSession.findMany({
        where: { userId: user.id },
        include: { case: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.learningProgress.findMany({
        where: { userId: user.id },
      }),
    ]);

  // Aggregate Subject Mastery
  const subjectMastery = learningProgress.map((lp) => ({
    subject: lp.subject,
    masteryLevel: Math.round(lp.masteryLevel),
    quizzesTaken: lp.quizzesTaken,
    vivaCount: lp.vivaCount,
    casesSolved: lp.casesSolved,
    weakTopics: lp.weakTopicsJson ? JSON.parse(lp.weakTopicsJson) : [],
    strongTopics: lp.strongTopicsJson ? JSON.parse(lp.strongTopicsJson) : [],
  }));

  // Activity breakdown
  const totalQuizzes = quizAttempts.length;
  const totalVivas = vivaSessions.filter((v) => v.status === "COMPLETED").length;
  const totalVpCases = vpSessions.filter((s) => s.status === "COMPLETED").length;

  const avgQuizAccuracy =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => acc + (q.correctCount / q.totalQuestions) * 100, 0) /
            totalQuizzes
        )
      : 0;

  // Real data-derived study plan
  const actionPlan: string[] = [];
  subjectMastery.forEach((sm) => {
    if (sm.masteryLevel < 65) {
      actionPlan.push(
        `Focus Revision: ${sm.subject} (Mastery: ${sm.masteryLevel}%). Review weak topics: ${sm.weakTopics.slice(0, 2).join(", ") || "General Fundamentals"}.`
      );
    }
  });

  if (actionPlan.length === 0) {
    actionPlan.push(
      "Excellent overall mastery across active subjects. Practice advanced Clinical Case Simulations to refine repertorization skills."
    );
  }

  return NextResponse.json({
    metrics: {
      totalQuizzes,
      totalVivas,
      totalVpCases,
      avgQuizAccuracy,
    },
    subjectMastery,
    actionPlan,
    recentQuizHistory: quizAttempts.slice(0, 10).map((q) => ({
      id: q.id,
      subject: q.subject,
      correctCount: q.correctCount,
      totalQuestions: q.totalQuestions,
      percentage: Math.round((q.correctCount / q.totalQuestions) * 100),
      createdAt: q.createdAt,
    })),
    recentVivaHistory: vivaSessions.slice(0, 10).map((v) => ({
      id: v.id,
      subject: v.subject,
      score: v.totalScore ? Math.round(v.totalScore) : null,
      status: v.status,
      createdAt: v.createdAt,
    })),
  });
}
