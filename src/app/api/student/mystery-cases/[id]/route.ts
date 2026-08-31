import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mysteryCaseService } from "@/services/mystery-case";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const caseData = mysteryCaseService.getCaseById(id);

    if (!caseData) {
      return NextResponse.json({ error: "Mystery case not found" }, { status: 404 });
    }

    // Check if user has submitted
    const userSubmission = await prisma.mysteryCaseSubmission.findUnique({
      where: {
        caseId_userId: {
          caseId: id,
          userId: user.id,
        },
      },
    });

    // Fetch comments
    let comments: any[] = [];
    try {
      comments = await prisma.mysteryCaseComment.findMany({
        where: { caseId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch {}

    // If user has not submitted and user is not faculty/admin, hide the actual remedy
    const isRevealed = !!userSubmission || user.role === "ADMIN" || user.role === "DOCTOR";

    return NextResponse.json({
      success: true,
      case: {
        ...caseData,
        actualRemedyHidden: isRevealed ? caseData.actualRemedyHidden : null,
        actualRationale: isRevealed ? caseData.actualRationale : null,
      },
      userSubmission,
      comments,
      isRevealed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load mystery case details" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const caseData = mysteryCaseService.getCaseById(id);

    if (!caseData) {
      return NextResponse.json({ error: "Mystery case not found" }, { status: 404 });
    }

    // Check if already submitted
    const existing = await prisma.mysteryCaseSubmission.findUnique({
      where: {
        caseId_userId: {
          caseId: id,
          userId: user.id,
        },
      },
    });

    if (existing && existing.status === "SUBMITTED") {
      return NextResponse.json(
        { error: "You have already submitted your analysis for this mystery case. It is now locked." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { suggestedRemedy, repertoryRubrics, reasoning, miasmAnalysis } = body;

    if (!suggestedRemedy || !reasoning) {
      return NextResponse.json(
        { error: "Suggested remedy and diagnostic reasoning are required." },
        { status: 400 }
      );
    }

    // Ensure parent mystery case exists in database if relations require it
    try {
      await prisma.mysteryCase.upsert({
        where: { caseNumber: caseData.caseNumber },
        update: {},
        create: {
          id: caseData.id,
          caseNumber: caseData.caseNumber,
          title: caseData.title,
          weekLabel: caseData.weekLabel,
          chiefComplaint: caseData.chiefComplaint,
          patientProfile: JSON.stringify(caseData.patientProfile),
          caseNarrative: JSON.stringify(caseData.caseNarrative),
          symptomsListJson: JSON.stringify(caseData.symptomsList),
          actualRemedy: caseData.actualRemedyHidden,
          actualRationale: caseData.actualRationale,
          difficulty: caseData.difficulty,
        },
      });
    } catch {}

    const submission = await prisma.mysteryCaseSubmission.upsert({
      where: {
        caseId_userId: {
          caseId: id,
          userId: user.id,
        },
      },
      update: {
        suggestedRemedy,
        repertoryRubrics: repertoryRubrics ? JSON.stringify(repertoryRubrics) : null,
        reasoning,
        miasmAnalysis,
        status: "SUBMITTED",
      },
      create: {
        caseId: id,
        userId: user.id,
        suggestedRemedy,
        repertoryRubrics: repertoryRubrics ? JSON.stringify(repertoryRubrics) : null,
        reasoning,
        miasmAnalysis,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      actualRemedy: caseData.actualRemedyHidden,
      actualRationale: caseData.actualRationale,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit mystery case analysis" },
      { status: 500 }
    );
  }
}
