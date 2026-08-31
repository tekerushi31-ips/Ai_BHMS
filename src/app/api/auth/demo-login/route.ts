import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/auth";
import { auditService } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const { preset } = await req.json();

    let targetEmail = "student1@bhms.ai";
    if (preset === "student2") targetEmail = "student2@bhms.ai";
    if (preset === "student3") targetEmail = "student3@bhms.ai";
    if (preset === "doctor1") targetEmail = "dr.sharma@bhms.ai";
    if (preset === "doctor2") targetEmail = "dr.patil@bhms.ai";
    if (preset === "admin") targetEmail = "admin@bhms.ai";
    if (preset === "patient" || preset === "patient1") targetEmail = "patient.amit@bhms.ai";

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    // Auto-create patient demo user if not yet in database
    if (!user && (preset === "patient" || preset === "patient1")) {
      const bcrypt = (await import("bcryptjs")).default;
      const passHash = await bcrypt.hash("Password123!", 10);
      user = await prisma.user.create({
        data: {
          email: "patient.amit@bhms.ai",
          passwordHash: passHash,
          name: "Amit Deshmukh",
          role: "PATIENT",
          patientProfile: {
            create: {
              age: 32,
              gender: "Male",
              phone: "+91 98765 43210",
              address: "42, Sunrise Apartments, Pune, Maharashtra",
              emergencyContact: "+91 98765 00000 (Spouse)",
              bloodGroup: "B+",
              allergies: "Dust mites, Pollen (no known drug allergies)",
            },
          },
        },
      });

      // Find Dr. Vikram Sharma to connect
      const doctor = await prisma.user.findFirst({
        where: { role: "DOCTOR" },
      });

      if (doctor) {
        // Create initial appointment
        await prisma.appointment.create({
          data: {
            patientUserId: user.id,
            doctorId: doctor.id,
            appointmentDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
            timeSlot: "10:30 AM",
            reason: "Follow-up for chronic allergic rhinitis & morning sneezing.",
            status: "CONFIRMED",
          },
        });

        // Create initial notification
        await prisma.patientNotification.create({
          data: {
            patientUserId: user.id,
            title: "Appointment Confirmed",
            message: `Your consultation with ${doctor.name} on ${new Date(Date.now() + 86400000 * 2).toLocaleDateString()} at 10:30 AM is confirmed.`,
            type: "APPOINTMENT",
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: `Demo account ${targetEmail} not found.` },
        { status: 404 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      avatar: user.avatar,
    };

    const token = await signToken(sessionPayload);
    await setSessionCookie(token);

    await auditService.logAction({
      userId: user.id,
      action: "DEMO_LOGIN",
      resource: "AUTH",
      details: { preset, email: user.email, role: user.role },
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl:
        user.role === "STUDENT"
          ? "/student/dashboard"
          : user.role === "DOCTOR"
          ? "/doctor/dashboard"
          : user.role === "PATIENT"
          ? "/patient/dashboard"
          : "/admin",
    });
  } catch (err) {
    console.error("[Demo Login Error]:", err);
    return NextResponse.json(
      { error: "Failed to authenticate demo user" },
      { status: 500 }
    );
  }
}
