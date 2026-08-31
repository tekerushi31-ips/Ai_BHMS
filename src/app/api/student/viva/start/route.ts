import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VIVA_QUESTION_BANK: Record<
  string,
  Array<{
    question: string;
    expectedKeypoints: string[];
    reference: string;
  }>
> = {
  "Materia Medica": [
    {
      question: "Differentiate the burning sensations and thermal modalities of Arsenicum Album, Sulphur, and Apis Mellifica.",
      expectedKeypoints: [
        "Arsenicum: Burning relieved by heat / warm drinks (chilly patient)",
        "Sulphur: Burning aggravated by heat / warm bed, wants cold (hot patient)",
        "Apis: Stinging burning relieved by cold applications, completely thirstless",
      ],
      reference: "Boericke & Nash's Leaders",
    },
    {
      question: "Explain the characteristic keynote triad and mental generals of Lycopodium Clavatum.",
      expectedKeypoints: [
        "4 PM to 8 PM aggravation",
        "Right to left directionality",
        "Flatulence and fullness after a few mouthfuls",
        "Anticipatory anxiety with stage fright, dictatorial at home",
      ],
      reference: "Allen's Keynotes",
    },
    {
      question: "What are the cardinal indications for Pulsatilla Pratensis in acute and chronic conditions?",
      expectedKeypoints: [
        "Mild, weeping disposition craves consolation",
        "Complete thirstlessness with dry mouth",
        "Wandering changeable pains",
        "Better in open cool air, worse in warm closed room",
      ],
      reference: "Boericke's Materia Medica",
    },
  ],
  "Organon of Medicine & Philosophy": [
    {
      question: "Explain Dr. Hahnemann's concept of the Spiritual Vital Force as stated in Aphorism §9.",
      expectedKeypoints: [
        "Spiritual, autocracy, dynamis",
        "Animates the material organism with unbounded sway",
        "Maintains harmony of sensations and functions",
        "Allows indwelling reason-gifted mind to serve higher purpose of existence",
      ],
      reference: "Organon of Medicine §9",
    },
    {
      question: "What is Aphorism §153 and why is it crucial for individualization in homoeopathic prescribing?",
      expectedKeypoints: [
        "Focus on striking, singular, uncommon, and peculiar (characteristic) symptoms",
        "Common symptoms have low prescribing value",
        "Matches individual characteristics of patient with pathogenesis of drug",
      ],
      reference: "Organon of Medicine §153",
    },
    {
      question: "State and explain the Similia Principle (Similia Similibus Curentur) as a natural therapeutic law.",
      expectedKeypoints: [
        "Like cures like",
        "A substance capable of producing morbid symptoms in healthy human can cure similar symptoms in disease",
        "Aphorism §26 - stronger dynamic affection extinguishes weaker one",
      ],
      reference: "Organon of Medicine §26",
    },
  ],
  "Repertory & Case Taking": [
    {
      question: "What constitutes Boenninghausen's Doctrine of Complete Symptom?",
      expectedKeypoints: [
        "Location (tissue affinity and side)",
        "Sensation (nature of pain)",
        "Modality (aggravations and ameliorations - time, thermal, position)",
        "Concomitants (associated symptoms)",
      ],
      reference: "Boenninghausen's Therapeutic Pocket Book",
    },
    {
      question: "Explain the grading of remedies in Kent's Repertory and how numerical weights are assigned.",
      expectedKeypoints: [
        "Grade 3: BOLD CAPITALS (3 marks) - confirmed in multiple provers and toxicological trials",
        "Grade 2: Italics (2 marks) - verified in clinical cured cases",
        "Grade 1: Roman (1 mark) - occasionally observed",
      ],
      reference: "Kent's Repertory Introduction",
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, difficulty, questionCount = 3 } = await req.json();

    const questionsPool =
      VIVA_QUESTION_BANK[subject] ||
      VIVA_QUESTION_BANK["Materia Medica"];

    const selectedQuestions = questionsPool.slice(0, questionCount);

    const session = await prisma.vivaSession.create({
      data: {
        userId: user.id,
        subject: subject || "Materia Medica",
        difficulty: difficulty || "MEDIUM",
        questionCount: selectedQuestions.length,
        currentQuestionIndex: 0,
        questionsJson: JSON.stringify(selectedQuestions),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        subject: session.subject,
        difficulty: session.difficulty,
        totalQuestions: session.questionCount,
        currentQuestionIndex: 0,
        currentQuestion: selectedQuestions[0],
      },
    });
  } catch (err) {
    console.error("[Viva Start Error]:", err);
    return NextResponse.json({ error: "Failed to start viva session" }, { status: 500 });
  }
}
