import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logbooks = await prisma.studentLogbook.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      logbooks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch student logbooks" },
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
      patientIdOrOpd,
      patientAge,
      patientGender,
      department,
      chiefComplaint,
      duration,
      location,
      sensation,
      modalities,
      historyPresentIllness,
      pastHistory,
      familyHistory,
      personalHistory,
      treatmentHistory,
      generalsPhysical,
      generalsMental,
      appetite,
      thirst,
      sleep,
      thermalPreference,
      examinationDetails,
      investigations,
      remedyPrescribed,
      potencyPosology,
      caseTotalityNotes,
      status, // "DRAFT" | "SUBMITTED"
    } = body;

    if (!patientIdOrOpd || !chiefComplaint) {
      return NextResponse.json(
        { error: "Patient ID/OPD and Chief Complaint are required." },
        { status: 400 }
      );
    }

    const newLogbook = await prisma.studentLogbook.create({
      data: {
        userId: user.id,
        patientIdOrOpd: String(patientIdOrOpd),
        patientAge: parseInt(String(patientAge || "30"), 10),
        patientGender: patientGender || "Male",
        department: department || "Medicine OPD",
        chiefComplaint,
        duration,
        location,
        sensation,
        modalities,
        historyPresentIllness,
        pastHistory,
        familyHistory,
        personalHistory,
        treatmentHistory,
        generalsPhysical,
        generalsMental,
        appetite,
        thirst,
        sleep,
        thermalPreference,
        examinationDetails,
        investigationsJson: investigations ? JSON.stringify(investigations) : null,
        remedyPrescribed,
        potencyPosology,
        caseTotalityNotes,
        status: status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      logbook: newLogbook,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create logbook case record" },
      { status: 500 }
    );
  }
}
