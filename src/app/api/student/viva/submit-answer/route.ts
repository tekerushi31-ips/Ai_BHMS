import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vivaSessionId, questionIndex, studentAnswer } = await req.json();

    const session = await prisma.vivaSession.findUnique({
      where: { id: vivaSessionId },
      include: { answers: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Viva session not found" }, { status: 404 });
    }

    const questions: Array<{
      question: string;
      expectedKeypoints: string[];
      reference: string;
    }> = JSON.parse(session.questionsJson);

    const currentQ = questions[questionIndex];
    if (!currentQ) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
    }

    // Evaluate answer against expected keypoints
    const lowerAns = studentAnswer.toLowerCase();
    let matchedKeypoints = 0;

    currentQ.expectedKeypoints.forEach((kp) => {
      const words = kp
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const matches = words.filter((w) => lowerAns.includes(w)).length;
      if (matches >= 2 || lowerAns.length > 50) {
        matchedKeypoints++;
      }
    });

    let grade: "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" = "INCORRECT";
    let scoreObtained = 2.0;

    if (matchedKeypoints >= 2 || (matchedKeypoints >= 1 && studentAnswer.length > 80)) {
      grade = "CORRECT";
      scoreObtained = 10.0;
    } else if (matchedKeypoints >= 1 || studentAnswer.length > 40) {
      grade = "PARTIALLY_CORRECT";
      scoreObtained = 6.0;
    }

    const explanation = `Key points addressed: ${matchedKeypoints}/${currentQ.expectedKeypoints.length}. ${
      grade === "CORRECT"
        ? "Excellent homoeopathic understanding and precise terminology."
        : grade === "PARTIALLY_CORRECT"
        ? "Good conceptual grasp, but missed specific modalities/aphorism references."
        : "Incomplete answer. Review the cardinal keynotes and authoritative texts."
    }`;

    // Save VivaAnswer
    const answerRecord = await prisma.vivaAnswer.create({
      data: {
        vivaSessionId: session.id,
        questionIndex,
        questionText: currentQ.question,
        studentAnswer,
        grade,
        scoreObtained,
        modelExplanation: explanation,
        correctKeypointsJson: JSON.stringify(currentQ.expectedKeypoints),
      },
    });

    const isLastQuestion = questionIndex + 1 >= questions.length;
    let finalSessionReport = null;

    if (isLastQuestion) {
      const allAnswers = [...session.answers, answerRecord];
      const totalScore =
        allAnswers.reduce((sum, a) => sum + a.scoreObtained, 0) / allAnswers.length * 10; // Normalized to 0-100

      const feedback = {
        totalScore: Math.round(totalScore),
        strongTopics: allAnswers.filter((a) => a.grade === "CORRECT").map((a) => a.questionText.slice(0, 40) + "..."),
        weakTopics: allAnswers.filter((a) => a.grade !== "CORRECT").map((a) => a.questionText.slice(0, 40) + "..."),
        examinerRemark:
          totalScore >= 75
            ? "Commendable mastery of BHMS theoretical and clinical concepts."
            : "Satisfactory attempt. Recommend strengthening core Aphorisms and Keynotes.",
      };

      await prisma.vivaSession.update({
        where: { id: session.id },
        data: {
          currentQuestionIndex: questionIndex + 1,
          status: "COMPLETED",
          totalScore,
          feedbackJson: JSON.stringify(feedback),
          completedAt: new Date(),
        },
      });

      // Update student learning progress
      await prisma.learningProgress.upsert({
        where: {
          userId_subject: {
            userId: user.id,
            subject: session.subject,
          },
        },
        create: {
          userId: user.id,
          subject: session.subject,
          masteryLevel: Math.round(totalScore),
          vivaCount: 1,
        },
        update: {
          vivaCount: { increment: 1 },
          masteryLevel: totalScore,
        },
      });

      finalSessionReport = feedback;
    } else {
      await prisma.vivaSession.update({
        where: { id: session.id },
        data: {
          currentQuestionIndex: questionIndex + 1,
        },
      });
    }

    return NextResponse.json({
      grade,
      scoreObtained,
      modelExplanation: explanation,
      correctKeypoints: currentQ.expectedKeypoints,
      isCompleted: isLastQuestion,
      nextQuestion: isLastQuestion ? null : questions[questionIndex + 1],
      finalReport: finalSessionReport,
    });
  } catch (err) {
    console.error("[Viva Submit Error]:", err);
    return NextResponse.json({ error: "Failed to evaluate viva answer" }, { status: 500 });
  }
}
