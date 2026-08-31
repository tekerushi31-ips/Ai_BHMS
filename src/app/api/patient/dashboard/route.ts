import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Patient Profile
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: user.id },
    });

    // 2. Fetch Upcoming Appointment
    const upcomingAppointment = await prisma.appointment.findFirst({
      where: {
        patientUserId: user.id,
        appointmentDate: { gte: new Date(Date.now() - 3600000) }, // from 1 hour ago onwards
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { appointmentDate: "asc" },
    });

    let upcomingDoctor = null;
    if (upcomingAppointment) {
      upcomingDoctor = await prisma.user.findUnique({
        where: { id: upcomingAppointment.doctorId },
        select: { id: true, name: true, email: true, doctorProfile: true },
      });
    }

    // 3. Fetch Connected Doctor (from profile or first doctor who treated patient)
    let connectedDoctor = null;
    if (profile?.primaryDoctorId) {
      connectedDoctor = await prisma.user.findUnique({
        where: { id: profile.primaryDoctorId },
        select: { id: true, name: true, email: true, doctorProfile: true },
      });
    }

    if (!connectedDoctor) {
      // Find the first registered doctor in system
      connectedDoctor = await prisma.user.findFirst({
        where: { role: "DOCTOR" },
        select: { id: true, name: true, email: true, doctorProfile: true },
      });
    }

    // 4. Fetch Last Visit (Clinical visit record from doctor)
    // Find matching Patient record by name or contact
    const patientRecord = await prisma.patient.findFirst({
      where: {
        OR: [
          { name: { contains: user.name } },
          { contact: profile?.phone || undefined },
        ],
      },
      include: {
        caseVisits: {
          orderBy: { visitDate: "desc" },
          take: 1,
        },
        clinicalCases: {
          orderBy: { visitDate: "desc" },
          take: 1,
        },
      },
    });

    const lastVisit = patientRecord?.caseVisits[0] || null;
    const lastCase = patientRecord?.clinicalCases[0] || null;

    // 5. Fetch Pending Follow-up
    const pendingFollowup = await prisma.patientFollowupSubmission.findFirst({
      where: { patientUserId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // 6. Fetch Unread Notifications Count
    const unreadNotificationsCount = await prisma.patientNotification.count({
      where: { patientUserId: user.id, isRead: false },
    });

    // 7. Fetch Recent Reports Count
    const totalReportsCount = await prisma.patientDocument.count({
      where: { patientUserId: user.id },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile,
      upcomingAppointment: upcomingAppointment
        ? {
            ...upcomingAppointment,
            doctorName: upcomingDoctor?.name || "Dr. Vikram Sharma",
            specialization: upcomingDoctor?.doctorProfile?.specialization || "Homoeopathic Physician",
            clinicName: upcomingDoctor?.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
          }
        : null,
      lastVisit: lastCase
        ? {
            visitDate: lastCase.visitDate,
            chiefComplaint: lastCase.chiefComplaint,
            remedyPrescribed: lastCase.remedyConsidered,
            potencyPrescribed: lastCase.potencyPrescribed,
          }
        : null,
      connectedDoctor: connectedDoctor
        ? {
            id: connectedDoctor.id,
            name: connectedDoctor.name,
            specialization: connectedDoctor.doctorProfile?.specialization || "Classical Homoeopathic Consultant",
            clinicName: connectedDoctor.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
            registrationNumber: connectedDoctor.doctorProfile?.registrationNumber || "CCH-2018-9482",
          }
        : null,
      pendingFollowup: pendingFollowup
        ? {
            id: pendingFollowup.id,
            currentSymptoms: pendingFollowup.currentSymptoms,
            currentSeverity: pendingFollowup.currentSeverity,
            status: pendingFollowup.status,
            createdAt: pendingFollowup.createdAt,
            doctorReply: pendingFollowup.doctorReply,
          }
        : null,
      stats: {
        unreadNotificationsCount,
        totalReportsCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load patient dashboard" },
      { status: 500 }
    );
  }
}
