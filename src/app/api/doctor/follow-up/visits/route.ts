import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      patientId,
      caseId,
      symptomsSummary,
      statusChange = "UNCHANGED",
      observations,
      prescriptionNotes,
      nextFollowUpDays = 21,
    } = await req.json();

    if (!patientId || !symptomsSummary) {
      return NextResponse.json(
        { error: "Patient ID and Symptoms Summary are required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: user.id, deletedAt: null },
      include: { caseVisits: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const visitNumber = patient.caseVisits.length + 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + parseInt(nextFollowUpDays, 10));

    const visit = await prisma.caseVisit.create({
      data: {
        patientId,
        caseId: caseId || null,
        doctorId: user.id,
        visitNumber,
        symptomsSummary,
        statusChange,
        observations: observations || null,
        prescriptionNotes: prescriptionNotes || null,
        nextFollowUpDate: nextDate,
      },
    });

    await auditService.logAction({
      userId: user.id,
      action: "VISIT_RECORDED",
      resource: "CASE_VISIT",
      resourceId: visit.id,
      details: { patientId, visitNumber, statusChange },
    });

    return NextResponse.json({ success: true, visit });
  } catch (err) {
    console.error("[Add Visit Error]:", err);
    return NextResponse.json({ error: "Failed to record follow-up visit" }, { status: 500 });
  }
}
