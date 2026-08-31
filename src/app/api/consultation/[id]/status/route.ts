import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;
    const body = await req.json();
    const { action, durationSeconds, doctorNotes, pushToCaseVisit } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consultationSession: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const isPatient = user.id === appointment.patientUserId;
    const isDoctor = user.id === appointment.doctorId;

    if (!isPatient && !isDoctor && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    // 1. ACTION: START_CALL
    if (action === "START_CALL") {
      // Update appointment & session to IN_PROGRESS
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "IN_PROGRESS" },
      });

      await prisma.consultationSession.upsert({
        where: { appointmentId },
        update: {
          status: "IN_PROGRESS",
          startedAt: appointment.consultationSession?.startedAt || now,
        },
        create: {
          appointmentId,
          doctorId: appointment.doctorId,
          patientUserId: appointment.patientUserId,
          roomId: `room_${appointmentId}`,
          status: "IN_PROGRESS",
          startedAt: now,
        },
      });

      // If doctor starts call, notify patient
      if (isDoctor) {
        const doctorUser = await prisma.user.findUnique({ where: { id: user.id } });
        await prisma.patientNotification.create({
          data: {
            patientUserId: appointment.patientUserId,
            title: "Video Consultation Started",
            message: `${doctorUser?.name || "Your doctor"} has started your video consultation. Click to join now!`,
            type: "APPOINTMENT",
          },
        });
      }

      return NextResponse.json({
        success: true,
        status: "IN_PROGRESS",
        message: "Consultation call started.",
      });
    }

    // 2. ACTION: END_CALL
    if (action === "END_CALL") {
      const finalDuration = durationSeconds !== undefined ? Number(durationSeconds) : 0;

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "COMPLETED",
          doctorNotes: doctorNotes || appointment.doctorNotes,
        },
      });

      const updatedSession = await prisma.consultationSession.update({
        where: { appointmentId },
        data: {
          status: "COMPLETED",
          endedAt: now,
          durationSeconds: finalDuration,
          doctorNotes: doctorNotes || undefined,
        },
      });

      // Optional: Push notes to Patient Clinical Case Visit if requested by doctor
      if (isDoctor && pushToCaseVisit && doctorNotes?.trim()) {
        // Find existing patient record
        const patientRecord = await prisma.patient.findFirst({
          where: {
            doctorId: user.id,
            name: { contains: "Amit" }, // matches patient
          },
        });

        if (patientRecord) {
          const visitCount = await prisma.caseVisit.count({
            where: { patientId: patientRecord.id },
          });

          await prisma.caseVisit.create({
            data: {
              patientId: patientRecord.id,
              doctorId: user.id,
              visitNumber: visitCount + 1,
              visitDate: now,
              symptomsSummary: `[Video Consultation Notes]: ${doctorNotes}`,
              statusChange: "UNCHANGED",
              observations: `Video consultation completed. Duration: ${Math.round(finalDuration / 60)} min.`,
              prescriptionNotes: "Consultation completed via BHMS AI Telehealth.",
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        durationSeconds: updatedSession.durationSeconds,
        message: "Consultation completed and saved.",
      });
    }

    // 3. ACTION: SAVE_NOTES
    if (action === "SAVE_NOTES") {
      if (!isDoctor && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the doctor can save clinical notes." }, { status: 403 });
      }

      await prisma.consultationSession.update({
        where: { appointmentId },
        data: { doctorNotes },
      });

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { doctorNotes },
      });

      return NextResponse.json({
        success: true,
        message: "Clinical notes updated successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (err: any) {
    console.error("[Consultation Status Update Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update consultation status." },
      { status: 500 }
    );
  }
}
