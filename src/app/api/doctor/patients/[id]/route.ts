import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Strict tenant scoping
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      doctorId: user.id,
      deletedAt: null,
    },
    include: {
      clinicalCases: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
      caseVisits: {
        orderBy: { visitDate: "desc" },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.patient.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        age: body.age ? parseInt(body.age, 10) : existing.age,
        gender: body.gender ?? existing.gender,
        contact: body.contact ?? existing.contact,
        occupation: body.occupation ?? existing.occupation,
        address: body.address ?? existing.address,
        medicalHistorySummary: body.medicalHistorySummary ?? existing.medicalHistorySummary,
      },
    });

    await auditService.logAction({
      userId: user.id,
      action: "PATIENT_UPDATED",
      resource: "PATIENT",
      resourceId: id,
    });

    return NextResponse.json({ success: true, patient: updated });
  } catch (err) {
    console.error("[Update Patient Error]:", err);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.patient.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Soft delete for clinical audit trail
    await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await auditService.logAction({
      userId: user.id,
      action: "PATIENT_DELETED",
      resource: "PATIENT",
      resourceId: id,
      details: { patientName: existing.name },
    });

    return NextResponse.json({ success: true, message: "Patient removed successfully" });
  } catch (err) {
    console.error("[Delete Patient Error]:", err);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
