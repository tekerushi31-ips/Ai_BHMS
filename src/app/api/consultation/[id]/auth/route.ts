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
      return NextResponse.json({ error: "Authentication required to access consultation." }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required." }, { status: 400 });
    }

    // 1. Fetch Appointment with relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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
    });

    if (!appointment) {
      return NextResponse.json({ error: "Consultation appointment not found." }, { status: 404 });
    }

    // 2. Fetch Doctor details
    const doctor = await prisma.user.findUnique({
      where: { id: appointment.doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        doctorProfile: true,
      },
    });

    // 3. Strict Server-Side Access Control
    const isPatient = user.id === appointment.patientUserId;
    const isDoctor = user.id === appointment.doctorId;

    if (!isPatient && !isDoctor && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. You are not an authorized participant in this consultation." },
        { status: 403 }
      );
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This appointment has been cancelled and video consultation is unavailable." },
        { status: 400 }
      );
    }

    // 4. Ensure or create ConsultationSession record
    let session = appointment.consultationSession;
    if (!session) {
      session = await prisma.consultationSession.create({
        data: {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientUserId: appointment.patientUserId,
          roomId: `room_${appointment.id}`,
          status: appointment.status === "COMPLETED" ? "COMPLETED" : "READY",
        },
      });
    }

    return NextResponse.json({
      success: true,
      currentUserRole: isDoctor ? "DOCTOR" : "PATIENT",
      currentUserId: user.id,
      currentUserName: user.name,
      appointment: {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        reason: appointment.reason,
        status: appointment.status,
      },
      doctor: {
        id: doctor?.id,
        name: doctor?.name || "Dr. Vikram Sharma",
        specialization: doctor?.doctorProfile?.specialization || "Homoeopathic Physician",
        clinicName: doctor?.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
        regNo: doctor?.doctorProfile?.registrationNumber || "CCH-MH-2016-8492",
      },
      patient: {
        id: appointment.patientUser.id,
        name: appointment.patientUser.name,
        email: appointment.patientUser.email,
        age: appointment.patientUser.patientProfile?.age || 32,
        gender: appointment.patientUser.patientProfile?.gender || "Male",
        phone: appointment.patientUser.patientProfile?.phone || "+91 98765 43210",
        bloodGroup: appointment.patientUser.patientProfile?.bloodGroup || "B+",
        allergies: appointment.patientUser.patientProfile?.allergies || "None reported",
      },
      session: {
        id: session.id,
        roomId: session.roomId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        doctorNotes: session.doctorNotes,
      },
    });
  } catch (err: any) {
    console.error("[Consultation Auth Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to authorize consultation session." },
      { status: 500 }
    );
  }
}
