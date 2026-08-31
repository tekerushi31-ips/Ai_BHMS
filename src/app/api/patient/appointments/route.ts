import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientUserId: user.id },
      orderBy: { appointmentDate: "desc" },
    });

    // Populate doctor info
    const doctorIds = Array.from(new Set(appointments.map((a) => a.doctorId)));
    const doctors = await prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, name: true, doctorProfile: true },
    });

    const docMap = new Map(doctors.map((d) => [d.id, d]));

    const enriched = appointments.map((a) => {
      const doc = docMap.get(a.doctorId);
      return {
        ...a,
        doctorName: doc?.name || "Dr. Vikram Sharma",
        specialization: doc?.doctorProfile?.specialization || "Homoeopathic Physician",
        clinicName: doc?.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
      };
    });

    return NextResponse.json({
      success: true,
      appointments: enriched,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load appointments" },
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
    const { doctorId, appointmentDate, timeSlot, reason } = body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return NextResponse.json(
        { error: "Doctor, date, time slot, and reason for visit are required." },
        { status: 400 }
      );
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Selected doctor not found." }, { status: 404 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientUserId: user.id,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        reason,
        status: "PENDING",
      },
    });

    // Create notification
    await prisma.patientNotification.create({
      data: {
        patientUserId: user.id,
        title: "Appointment Request Submitted",
        message: `Your appointment request with ${doctor.name} for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot} is pending confirmation.`,
        type: "APPOINTMENT",
      },
    });

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      message: "Appointment request submitted successfully!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}
