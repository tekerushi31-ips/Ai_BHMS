import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mysteryCaseService } from "@/services/mystery-case";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staticCases = mysteryCaseService.getAllCases();

    // Fetch user submissions for these cases
    const userSubmissions = await prisma.mysteryCaseSubmission.findMany({
      where: { userId: user.id },
    });

    const submissionMap = new Map(userSubmissions.map((s) => [s.caseId, s]));

    const casesWithStatus = staticCases.map((c) => {
      const sub = submissionMap.get(c.id);
      return {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        weekLabel: c.weekLabel,
        chiefComplaint: c.chiefComplaint,
        patientProfile: c.patientProfile,
        difficulty: c.difficulty,
        hasSubmitted: !!sub,
        submissionStatus: sub?.status || "UNSUBMITTED",
        submissionScore: sub?.score ?? null,
        activeUntil: c.activeUntil,
      };
    });

    return NextResponse.json({
      success: true,
      cases: casesWithStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch mystery cases" },
      { status: 500 }
    );
  }
}
