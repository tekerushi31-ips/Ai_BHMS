import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProfileCompletion } from "@/lib/doctor-profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tenant Isolation: Query strictly scoped to user.id
  const [profile, patients, clinicalCases, caseVisits] = await Promise.all([
    prisma.doctorProfile.findUnique({ where: { userId: user.id } }),
    prisma.patient.findMany({
      where: { doctorId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clinicalCase.findMany({
      where: { doctorId: user.id, deletedAt: null },
      include: { patient: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.caseVisit.findMany({
      where: { doctorId: user.id },
      include: { patient: true },
      orderBy: { visitDate: "desc" },
    }),
  ]);

  const totalPatients = patients.length;
  const newCasesThisMonth = clinicalCases.filter(
    (c) => new Date(c.createdAt).getMonth() === new Date().getMonth()
  ).length;

  // Follow-ups due: visits where nextFollowUpDate is in the next 14 days or overdue
  const now = new Date();
  const followUpsDue = caseVisits.filter(
    (v) => v.nextFollowUpDate && new Date(v.nextFollowUpDate).getTime() <= now.getTime() + 14 * 24 * 60 * 60 * 1000
  );

  // Real clinical safety alerts from stored active cases
  const realAlerts: Array<{
    patientName: string;
    patientId: string;
    level: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
  }> = [];

  clinicalCases.forEach((c) => {
    const text = `${c.chiefComplaint} ${c.location} ${c.sensation} ${c.modalities}`.toLowerCase();
    if (text.includes("chest pain") || text.includes("crushing")) {
      realAlerts.push({
        patientName: c.patient.name,
        patientId: c.patientId,
        level: "CRITICAL",
        title: "Cardiac Red Flag Precaution",
        message: "Chest pain associated with exertion or radiation requires ECG confirmation.",
      });
    }
  });

  const fullDoctorData = {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    phone: profile?.phone || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || "Male",
    qualification: profile?.qualification || "B.H.M.S., M.D. (Hom.)",
    degree: profile?.degree || "M.D. in Homoeopathic Philosophy",
    specialization: profile?.specialization || "Classical Homoeopathy & Chronic Diseases",
    registrationNumber: profile?.registrationNumber || "CCH-2018-9482",
    regNo: profile?.registrationNumber || "CCH-2018-9482",
    yearsOfPractice: profile?.yearsOfPractice ?? 5,
    languages: profile?.languages || "English, Hindi, Marathi",
    consultationType: profile?.consultationType || "Online & Offline",
    clinic: profile?.clinicName || "Homoeopathic Healing Centre",
    clinicName: profile?.clinicName || "Homoeopathic Healing Centre",
    clinicAddress: profile?.clinicAddress || "",
    city: profile?.city || "",
    state: profile?.state || "",
    pincode: profile?.pincode || "",
    clinicPhone: profile?.clinicPhone || "",
    clinicEmail: profile?.clinicEmail || "",
    shortBio: profile?.shortBio || "",
    areasOfPractice: profile?.areasOfPractice || "",
    consultationDays: profile?.consultationDays || "Mon, Tue, Wed, Thu, Fri, Sat",
    availableStartTime: profile?.availableStartTime || "09:00 AM",
    availableEndTime: profile?.availableEndTime || "06:00 PM",
    isOnlineConsultation: profile?.isOnlineConsultation ?? true,
    isOfflineConsultation: profile?.isOfflineConsultation ?? true,
  };

  const completion = calculateProfileCompletion(fullDoctorData);

  return NextResponse.json({
    doctor: fullDoctorData,
    profileCompletion: completion.percentage,
    missingFields: completion.missingFields,
    isProfileComplete: completion.percentage >= 80,
    metrics: {
      totalPatients,
      newCasesThisMonth,
      totalCases: clinicalCases.length,
      followUpsDueCount: followUpsDue.length,
    },
    recentPatients: patients.slice(0, 5).map((p) => ({
      id: p.id,
      patientCode: p.patientCode,
      name: p.name,
      age: p.age,
      gender: p.gender,
      contact: p.contact,
      lastVisit: p.updatedAt,
    })),
    recentCases: clinicalCases.slice(0, 5).map((c) => ({
      id: c.id,
      patientId: c.patientId,
      patientName: c.patient.name,
      chiefComplaint: c.chiefComplaint,
      status: c.status,
      remedyConsidered: c.remedyConsidered,
      updatedAt: c.updatedAt,
    })),
    followUpsDue: followUpsDue.slice(0, 5).map((f) => ({
      id: f.id,
      patientId: f.patientId,
      patientName: f.patient.name,
      dueDate: f.nextFollowUpDate,
      lastStatus: f.statusChange,
    })),
    safetyAlerts: realAlerts,
  });
}
