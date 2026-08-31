import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let followups = await prisma.patientFollowupSubmission.findMany({
      where: { patientUserId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Seed default follow-up if empty for demonstration
    if (followups.length === 0) {
      const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR" } });
      const initial = await prisma.patientFollowupSubmission.create({
        data: {
          patientUserId: user.id,
          doctorId: doctor?.id || "doc-1",
          currentSymptoms: "Sneezing frequency significantly reduced from 20 times/morning to 3-4 times. No burning nasal discharge.",
          previousSeverity: 8,
          currentSeverity: 3,
          symptomChange: "IMPROVED",
          newSymptoms: "Mild dryness of throat in the evening.",
          questionsForDoctor: "Should I continue Allium Cepa 200C at the same frequency or reduce to once daily?",
          status: "REVIEWED",
          doctorReply: "Excellent response to Allium Cepa. You may now reduce dosage to once daily in the morning for 4 more days, then discontinue unless symptoms recur.",
          reviewedAt: new Date(Date.now() - 86400000),
        },
      });
      followups = [initial];
    }

    return NextResponse.json({
      success: true,
      followups,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load follow-ups" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      currentSymptoms,
      previousSeverity,
      currentSeverity,
      symptomChange,
      newSymptoms,
      questionsForDoctor,
    } = body;

    if (!currentSymptoms?.trim()) {
      return NextResponse.json(
        { error: "Please describe your current symptoms." },
        { status: 400 }
      );
    }

    const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR" } });

    const newFollowup = await prisma.patientFollowupSubmission.create({
      data: {
        patientUserId: user.id,
        doctorId: doctor?.id || "doc-1",
        currentSymptoms: currentSymptoms.trim(),
        previousSeverity: parseInt(String(previousSeverity || 7), 10),
        currentSeverity: parseInt(String(currentSeverity || 4), 10),
        symptomChange: symptomChange || "IMPROVED",
        newSymptoms: newSymptoms?.trim() || null,
        questionsForDoctor: questionsForDoctor?.trim() || null,
        status: "SUBMITTED",
      },
    });

    await prisma.patientNotification.create({
      data: {
        patientUserId: user.id,
        title: "Follow-up Submitted",
        message: "Your clinical progress report has been submitted to Dr. Sharma for review.",
        type: "FOLLOWUP",
      },
    });

    return NextResponse.json({
      success: true,
      followup: newFollowup,
      message: "Follow-up submitted successfully to your doctor!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit follow-up" },
      { status: 500 }
    );
  }
}
