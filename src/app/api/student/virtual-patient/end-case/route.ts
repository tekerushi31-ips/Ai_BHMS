import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VirtualPatientFeedback } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    const session = await prisma.virtualPatientSession.findUnique({
      where: { id: sessionId },
      include: { case: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const groundTruth = JSON.parse(session.case.groundTruthJson);
    const discoveredFacts: string[] = JSON.parse(session.factsDiscoveredJson || "[]");
    const transcript: Array<{ sender: string; text: string }> = JSON.parse(
      session.transcriptJson || "[]"
    );

    const totalKeyFacts: string[] = groundTruth.keyFactsToElicit || [
      "Sensation / Character of Pain",
      "Time & Environmental Modalities",
      "Food Cravings / Thirst Generals",
      "Mental Generals & Emotional Triggers",
      "Sleep & Thermal Constitution",
    ];

    // Compute captured vs missed facts
    const factsCaptured: string[] = [];
    const factsMissed: string[] = [];

    totalKeyFacts.forEach((fact) => {
      const isCaptured = discoveredFacts.some((df) =>
        df.toLowerCase().includes(fact.toLowerCase().slice(0, 5))
      );
      if (isCaptured || discoveredFacts.length >= 4) {
        factsCaptured.push(fact);
      } else {
        factsMissed.push(fact);
      }
    });

    // Calculate completeness and questioning scores
    const completenessScore = Math.min(
      100,
      Math.max(20, Math.round((discoveredFacts.length / (totalKeyFacts.length + 1)) * 100))
    );

    const studentQuestionCount = transcript.filter((t) => t.sender === "STUDENT").length;
    const questioningScore = Math.min(
      95,
      Math.max(30, studentQuestionCount >= 5 ? 85 + Math.min(10, studentQuestionCount) : studentQuestionCount * 16)
    );

    const overallScore = Math.round((completenessScore * 0.6 + questioningScore * 0.4) * 10) / 10;

    const report: VirtualPatientFeedback = {
      completenessScore,
      questioningScore,
      factsDiscovered: discoveredFacts,
      factsMissed,
      questionQualityCritique: [
        "Good systematic inquiry into location and chief complaint.",
        studentQuestionCount >= 5
          ? "Thorough exploration of modalities and physical generals."
          : "Questioning was brief; remember to ask open-ended questions about thermal state and mental causation.",
      ],
      strengths: [
        "Maintained professional, empathetic clinical dialogue.",
        "Identified leading pathological complaints.",
      ],
      areasForImprovement: [
        "Ensure Boenninghausen's 4-component totality (Location, Sensation, Modality, Concomitant) is fully elicited.",
        `Target Simillimum in this simulation was ${groundTruth.targetRemedy}. Review its keynotes in Boericke.`,
      ],
      overallNarrative: `Student completed ${studentQuestionCount} clinical inquiry turns. Successfully elicited ${discoveredFacts.length} cardinal symptom domains with an overall history-taking score of ${overallScore}%.`,
      suggestedRubricsReview: [
        "MIND - CONSOLATION - agg.",
        "HEAD - PAIN - sun, from",
        "STOMACH - DESIRES - salt",
      ],
    };

    // Update session record
    await prisma.virtualPatientSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completenessScore,
        questioningScore,
        narrativeFeedback: JSON.stringify(report),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      report,
      overallScore,
      targetRemedy: groundTruth.targetRemedy,
      educationalNotes: session.case.educationalNotes,
    });
  } catch (err) {
    console.error("[End Case Error]:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
