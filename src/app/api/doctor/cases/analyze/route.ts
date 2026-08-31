import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { caseAnalysisService } from "@/services/case-analysis";
import { auditService } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseData = await req.json();

    if (!caseData.chiefComplaint || caseData.chiefComplaint.trim().length === 0) {
      return NextResponse.json(
        { error: "Chief Complaint is required for homeopathic case analysis." },
        { status: 400 }
      );
    }

    const result = await caseAnalysisService.analyzeCase(caseData);

    await auditService.logAction({
      userId: user.id,
      action: "CASE_ANALYZED",
      resource: "AI_CASE_ANALYSIS",
      details: {
        chiefComplaint: caseData.chiefComplaint,
        safetyFlagsCount: result.analysis.safetyAlerts.length,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      ragSources: result.ragSources,
    });
  } catch (err) {
    console.error("[Case Analysis Error]:", err);
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
