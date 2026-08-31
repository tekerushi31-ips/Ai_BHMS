import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: user.id },
      include: {
        patientUser: {
          select: {
            id: true,
            name: true,
            email: true,
            patientProfile: true,
          },
        },
        consultationSession: true,
      },
      orderBy: { appointmentDate: "asc" },
    });

    const formatted = appointments.map((a) => ({
      id: a.id,
      patientUserId: a.patientUserId,
      patientName: a.patientUser.name,
      patientEmail: a.patientUser.email,
      patientAge: a.patientUser.patientProfile?.age || 32,
      patientGender: a.patientUser.patientProfile?.gender || "Male",
      patientPhone: a.patientUser.patientProfile?.phone || "+91 98765 43210",
      appointmentDate: a.appointmentDate,
      timeSlot: a.timeSlot,
      reason: a.reason,
      status: a.status,
      doctorNotes: a.doctorNotes,
      consultationSession: a.consultationSession,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      success: true,
      appointments: formatted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve doctor appointments." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, status, doctorNotes } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID required." }, { status: 400 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, doctorId: user.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: status || appointment.status,
        doctorNotes: doctorNotes !== undefined ? doctorNotes : appointment.doctorNotes,
      },
    });

    // If confirmed, notify patient
    if (status === "CONFIRMED") {
      const doctorUser = await prisma.user.findUnique({ where: { id: user.id } });
      await prisma.patientNotification.create({
        data: {
          patientUserId: appointment.patientUserId,
          title: "Appointment Confirmed",
          message: `Your appointment with ${doctorUser?.name || "Dr. Vikram Sharma"} for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot} has been confirmed. Video consultation will be available at the scheduled time.`,
          type: "APPOINTMENT",
        },
      });
    }

    return NextResponse.json({
      success: true,
      appointment: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update appointment." },
      { status: 500 }
    );
  }
}
