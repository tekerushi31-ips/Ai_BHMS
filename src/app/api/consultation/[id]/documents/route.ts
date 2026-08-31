import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Access control: only patient or doctor of this appointment
    if (user.id !== appointment.patientUserId && user.id !== appointment.doctorId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Retrieve the patient's uploaded documents
    const documents = await prisma.patientDocument.findMany({
      where: { patientUserId: appointment.patientUserId },
      orderBy: { uploadDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch shared documents" },
      { status: 500 }
    );
  }
}
