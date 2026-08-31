import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    // Security check: ensure the patient owns the appointment
    if (appointment.patientUserId !== user.id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.patientNotification.create({
      data: {
        patientUserId: user.id,
        title: "Appointment Cancelled",
        message: `Your appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled.`,
        type: "APPOINTMENT",
      },
    });

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: "Appointment cancelled successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
