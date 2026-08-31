import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followUpService } from "@/services/follow-up";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Verify patient belongs to this doctor
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: user.id, deletedAt: null },
      include: {
        caseVisits: {
          orderBy: { visitDate: "asc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const visits = patient.caseVisits;

    if (visits.length < 2) {
      return NextResponse.json({
        success: true,
        canAnalyze: false,
        visitCount: visits.length,
        message: "Follow-up comparative analysis requires at least 2 recorded visits for this patient.",
        visits,
      });
    }

    const analysis = followUpService.analyzeVisits(visits);

    return NextResponse.json({
      success: true,
      canAnalyze: true,
      visitCount: visits.length,
      patientName: patient.name,
      patientCode: patient.patientCode,
      analysis,
      visits,
    });
  } catch (err) {
    console.error("[Follow-up Analysis Error]:", err);
    return NextResponse.json(
      { error: "Follow-up comparison failed" },
      { status: 500 }
    );
  }
}
