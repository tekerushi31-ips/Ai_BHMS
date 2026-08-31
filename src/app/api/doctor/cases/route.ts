import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await prisma.clinicalCase.findMany({
    where: { doctorId: user.id, deletedAt: null },
    include: { patient: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ cases });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      patientId,
      chiefComplaint,
      location,
      sensation,
      modalities,
      concomitants,
      mentalGenerals,
      physicalGenerals,
      pastHistory,
      familyHistory,
      personalHistory,
      investigations,
      currentMedications,
      rawNotes,
      structuredJson,
      rubricTags,
      remedyConsidered,
      potencyPrescribed,
      status = "SAVED",
    } = body;

    if (!patientId || !chiefComplaint) {
      return NextResponse.json(
        { error: "Patient selection and Chief Complaint are required" },
        { status: 400 }
      );
    }

    // Verify patient belongs to this doctor
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: user.id, deletedAt: null },
    });

    if (!patient) {
      return NextResponse.json({ error: "Unauthorized patient access" }, { status: 403 });
    }

    let savedCase;
    if (id) {
      // Update existing case
      savedCase = await prisma.clinicalCase.update({
        where: { id },
        data: {
          chiefComplaint,
          location,
          sensation,
          modalities,
          concomitants,
          mentalGenerals,
          physicalGenerals,
          pastHistory,
          familyHistory,
          personalHistory,
          investigations,
          currentMedications,
          rawNotes,
          structuredJson: structuredJson ? (typeof structuredJson === "string" ? structuredJson : JSON.stringify(structuredJson)) : null,
          rubricTags,
          remedyConsidered,
          potencyPrescribed,
          status,
        },
      });
    } else {
      // Create new clinical case
      savedCase = await prisma.clinicalCase.create({
        data: {
          patientId,
          doctorId: user.id,
          chiefComplaint,
          location,
          sensation,
          modalities,
          concomitants,
          mentalGenerals,
          physicalGenerals,
          pastHistory,
          familyHistory,
          personalHistory,
          investigations,
          currentMedications,
          rawNotes,
          structuredJson: structuredJson ? (typeof structuredJson === "string" ? structuredJson : JSON.stringify(structuredJson)) : null,
          rubricTags,
          remedyConsidered,
          potencyPrescribed,
          status,
        },
      });

      // Also create an initial CaseVisit record
      await prisma.caseVisit.create({
        data: {
          patientId,
          caseId: savedCase.id,
          doctorId: user.id,
          visitNumber: 1,
          symptomsSummary: chiefComplaint,
          statusChange: "UNCHANGED",
          observations: "Initial Case Sheet Recorded.",
          prescriptionNotes: remedyConsidered ? `${remedyConsidered} ${potencyPrescribed || ""}` : "Under repertorial analysis",
        },
      });
    }

    await auditService.logAction({
      userId: user.id,
      action: id ? "CASE_UPDATED" : "CASE_CREATED",
      resource: "CASE",
      resourceId: savedCase.id,
      details: { patientId, status },
    });

    return NextResponse.json({ success: true, case: savedCase });
  } catch (err) {
    console.error("[Save Case Error]:", err);
    return NextResponse.json({ error: "Failed to save clinical case" }, { status: 500 });
  }
}
