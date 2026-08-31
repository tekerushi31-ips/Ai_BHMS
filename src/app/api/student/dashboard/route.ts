import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch real stored student data
  const [profile, quizAttempts, vivaSessions, vpSessions, learningProgress] =
    await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId: user.id } }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.vivaSession.findMany({
        where: { userId: user.id },
        include: { answers: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.virtualPatientSession.findMany({
        where: { userId: user.id },
        include: { case: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.learningProgress.findMany({
        where: { userId: user.id },
      }),
    ]);

  // Compute actual metrics from database
  const totalQuizzes = quizAttempts.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(
          (quizAttempts.reduce(
            (acc, q) => acc + (q.correctCount / q.totalQuestions) * 100,
            0
          ) /
            totalQuizzes) *
            10
        ) / 10
      : null;

  const completedVivas = vivaSessions.filter((v) => v.status === "COMPLETED");
  const avgVivaScore =
    completedVivas.length > 0
      ? Math.round(
          (completedVivas.reduce((acc, v) => acc + (v.totalScore || 0), 0) /
            completedVivas.length) *
            10
        ) / 10
      : null;

  const completedVpCases = vpSessions.filter((s) => s.status === "COMPLETED").length;

  // Weak subjects and recommendations derived strictly from stored data
  const weakSubjects: string[] = [];
  const strongSubjects: string[] = [];

  learningProgress.forEach((lp) => {
    if (lp.masteryLevel < 60) {
      weakSubjects.push(lp.subject);
    } else if (lp.masteryLevel >= 75) {
      strongSubjects.push(lp.subject);
    }
  });

  // Calculate dynamic recommendations based on real scores
  const recommendations: string[] = [];
  if (totalQuizzes === 0) {
    recommendations.push("Take your first Materia Medica or Organon Quiz to benchmark your subject mastery.");
  } else if (avgQuizScore && avgQuizScore < 70) {
    recommendations.push("Review Allen's Keynotes and Aphorisms §1-§29 to improve foundational quiz scores.");
  }

  if (completedVivas.length === 0) {
    recommendations.push("Start an AI Viva Session on Organon of Medicine to test oral examination readiness.");
  }

  if (completedVpCases === 0) {
    recommendations.push("Practice simulated case-taking with Virtual Patient Sunita Kadam (Chronic Cephalea).");
  }

  if (weakSubjects.length > 0) {
    recommendations.push(`Targeted revision recommended for: ${weakSubjects.join(", ")}.`);
  }

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      year: profile?.yearOfStudy ? `${profile.yearOfStudy}th Year BHMS` : "BHMS Student",
      college: profile?.college || "Homoeopathic Medical College",
      streakDays: profile?.streakDays || 0,
      totalStudyHours: profile?.totalStudyHours || 0,
    },
    metrics: {
      totalQuizzes,
      avgQuizScore,
      totalVivas: vivaSessions.length,
      avgVivaScore,
      completedVpCases,
    },
    weakSubjects,
    strongSubjects,
    recommendations,
    recentQuizAttempts: quizAttempts.map((q) => ({
      id: q.id,
      subject: q.subject,
      score: `${q.correctCount}/${q.totalQuestions}`,
      percentage: Math.round((q.correctCount / q.totalQuestions) * 100),
      date: q.createdAt,
    })),
    recentVpSessions: vpSessions.map((s) => ({
      id: s.id,
      caseTitle: s.case.title,
      status: s.status,
      score: s.completenessScore ? `${Math.round(s.completenessScore)}%` : "In Progress",
      date: s.createdAt,
    })),
  });
}
