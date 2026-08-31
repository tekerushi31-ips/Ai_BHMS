import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
    const logbook = await prisma.studentLogbook.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!logbook) {
      return NextResponse.json({ error: "Logbook entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      logbook,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch logbook entry" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.studentLogbook.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Logbook entry not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== "ADMIN" && user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already submitted by student and user is student, prevent modification
    if (existing.status === "SUBMITTED" && user.role === "STUDENT") {
      return NextResponse.json(
        { error: "Case has already been submitted to professor and is locked from modification." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updated = await prisma.studentLogbook.update({
      where: { id },
      data: {
        patientIdOrOpd: body.patientIdOrOpd ?? existing.patientIdOrOpd,
        patientAge: body.patientAge ? parseInt(String(body.patientAge), 10) : existing.patientAge,
        patientGender: body.patientGender ?? existing.patientGender,
        department: body.department ?? existing.department,
        chiefComplaint: body.chiefComplaint ?? existing.chiefComplaint,
        duration: body.duration ?? existing.duration,
        location: body.location ?? existing.location,
        sensation: body.sensation ?? existing.sensation,
        modalities: body.modalities ?? existing.modalities,
        historyPresentIllness: body.historyPresentIllness ?? existing.historyPresentIllness,
        pastHistory: body.pastHistory ?? existing.pastHistory,
        familyHistory: body.familyHistory ?? existing.familyHistory,
        personalHistory: body.personalHistory ?? existing.personalHistory,
        treatmentHistory: body.treatmentHistory ?? existing.treatmentHistory,
        generalsPhysical: body.generalsPhysical ?? existing.generalsPhysical,
        generalsMental: body.generalsMental ?? existing.generalsMental,
        appetite: body.appetite ?? existing.appetite,
        thirst: body.thirst ?? existing.thirst,
        sleep: body.sleep ?? existing.sleep,
        thermalPreference: body.thermalPreference ?? existing.thermalPreference,
        examinationDetails: body.examinationDetails ?? existing.examinationDetails,
        investigationsJson: body.investigations ? JSON.stringify(body.investigations) : existing.investigationsJson,
        remedyPrescribed: body.remedyPrescribed ?? existing.remedyPrescribed,
        potencyPosology: body.potencyPosology ?? existing.potencyPosology,
        caseTotalityNotes: body.caseTotalityNotes ?? existing.caseTotalityNotes,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json({
      success: true,
      logbook: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update logbook entry" },
      { status: 500 }
    );
  }
}
