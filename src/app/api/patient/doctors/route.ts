import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        doctorProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      doctors: doctors.map((doc) => ({
        id: doc.id,
        name: doc.name,
        email: doc.email,
        avatar: doc.avatar,
        qualification: doc.doctorProfile?.qualification || "B.H.M.S., M.D. (Hom.)",
        degree: doc.doctorProfile?.degree || "M.D.",
        specialization: doc.doctorProfile?.specialization || "Classical Homoeopathy & Chronic Diseases",
        clinicName: doc.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
        clinicAddress: doc.doctorProfile?.clinicAddress || "Suite 402, Medical Enclave",
        city: doc.doctorProfile?.city || "Pune",
        registrationNumber: doc.doctorProfile?.registrationNumber || "CCH-2018-9482",
        yearsOfPractice: doc.doctorProfile?.yearsOfPractice ?? 5,
        languages: doc.doctorProfile?.languages || "English, Hindi, Marathi",
        consultationType: doc.doctorProfile?.consultationType || "Online & Offline",
        consultationDays: doc.doctorProfile?.consultationDays || "Mon - Sat",
        availableSlots: ["09:30 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM", "05:00 PM"],
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load registered doctors" },
      { status: 500 }
    );
  }
}
