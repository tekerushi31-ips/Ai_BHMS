import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProfileCompletion } from "@/lib/doctor-profile";

const ProfileUpdateSchema = z.object({
  // Personal Info
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),

  // Professional Info
  qualification: z.string().min(2, "Qualification is required"),
  degree: z.string().optional().nullable(),
  specialization: z.string().min(2, "Specialization is required"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  yearsOfPractice: z.number().min(0, "Years of experience cannot be negative"),
  languages: z.string().optional().nullable(),
  consultationType: z.string().optional().nullable(),

  // Clinic Info
  clinicName: z.string().min(2, "Clinic name is required"),
  clinicAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().refine((val) => !val || /^\d{6}$/.test(val.trim()), {
    message: "Pincode must be 6 digits",
  }).optional().nullable(),
  clinicPhone: z.string().optional().nullable(),
  clinicEmail: z.string().email("Invalid clinic email").or(z.literal("")).optional().nullable(),

  // Bio
  shortBio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional().nullable(),
  areasOfPractice: z.string().optional().nullable(),

  // Availability
  consultationDays: z.string().optional().nullable(),
  availableStartTime: z.string().optional().nullable(),
  availableEndTime: z.string().optional().nullable(),
  isOnlineConsultation: z.boolean().optional(),
  isOfflineConsultation: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tenant Isolation: Query strictly scoped to authenticated user ID
    let doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
    });

    // If profile record does not exist yet, safely create a default record
    if (!doctorProfile) {
      doctorProfile = await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          clinicName: "Homoeopathic Healing Centre",
          registrationNumber: "CCH-2018-9482",
          specialization: "Classical Homoeopathy & Chronic Diseases",
          yearsOfPractice: 5,
        },
      });
    }

    const fullProfile = {
      // User table
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,

      // DoctorProfile table
      phone: doctorProfile.phone || "",
      dateOfBirth: doctorProfile.dateOfBirth || "",
      gender: doctorProfile.gender || "Male",
      qualification: doctorProfile.qualification || "B.H.M.S., M.D. (Hom.)",
      degree: doctorProfile.degree || "M.D. in Homoeopathic Philosophy",
      specialization: doctorProfile.specialization || "Classical Homoeopathy & Chronic Diseases",
      registrationNumber: doctorProfile.registrationNumber || "CCH-2018-9482",
      yearsOfPractice: doctorProfile.yearsOfPractice ?? 5,
      languages: doctorProfile.languages || "English, Hindi, Marathi",
      consultationType: doctorProfile.consultationType || "Online & Offline",

      clinicName: doctorProfile.clinicName || "Homoeopathic Healing Centre",
      clinicAddress: doctorProfile.clinicAddress || "",
      city: doctorProfile.city || "Pune",
      state: doctorProfile.state || "Maharashtra",
      pincode: doctorProfile.pincode || "411001",
      clinicPhone: doctorProfile.clinicPhone || "",
      clinicEmail: doctorProfile.clinicEmail || "",

      shortBio: doctorProfile.shortBio || "",
      areasOfPractice: doctorProfile.areasOfPractice || "",

      consultationDays: doctorProfile.consultationDays || "Mon, Tue, Wed, Thu, Fri, Sat",
      availableStartTime: doctorProfile.availableStartTime || "09:00 AM",
      availableEndTime: doctorProfile.availableEndTime || "06:00 PM",
      isOnlineConsultation: doctorProfile.isOnlineConsultation ?? true,
      isOfflineConsultation: doctorProfile.isOfflineConsultation ?? true,
    };

    const completion = calculateProfileCompletion(fullProfile);

    return NextResponse.json({
      profile: fullProfile,
      completion,
    });
  } catch (err: any) {
    console.error("[Doctor Profile GET Error]:", err);
    return NextResponse.json(
      { error: "Unable to load doctor profile. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = ProfileUpdateSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validated.data;

    // Security: Only update user's own record (deriving ID from authenticated session)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.name,
          email: data.email,
          ...(data.avatar ? { avatar: data.avatar } : {}),
        },
      }),
      prisma.doctorProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || "Male",
          qualification: data.qualification,
          degree: data.degree || null,
          specialization: data.specialization,
          registrationNumber: data.registrationNumber,
          yearsOfPractice: data.yearsOfPractice,
          languages: data.languages || null,
          consultationType: data.consultationType || null,

          clinicName: data.clinicName,
          clinicAddress: data.clinicAddress || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          clinicPhone: data.clinicPhone || null,
          clinicEmail: data.clinicEmail || null,

          shortBio: data.shortBio || null,
          areasOfPractice: data.areasOfPractice || null,

          consultationDays: data.consultationDays || null,
          availableStartTime: data.availableStartTime || null,
          availableEndTime: data.availableEndTime || null,
          isOnlineConsultation: data.isOnlineConsultation ?? true,
          isOfflineConsultation: data.isOfflineConsultation ?? true,
        },
        update: {
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || "Male",
          qualification: data.qualification,
          degree: data.degree || null,
          specialization: data.specialization,
          registrationNumber: data.registrationNumber,
          yearsOfPractice: data.yearsOfPractice,
          languages: data.languages || null,
          consultationType: data.consultationType || null,

          clinicName: data.clinicName,
          clinicAddress: data.clinicAddress || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          clinicPhone: data.clinicPhone || null,
          clinicEmail: data.clinicEmail || null,

          shortBio: data.shortBio || null,
          areasOfPractice: data.areasOfPractice || null,

          consultationDays: data.consultationDays || null,
          availableStartTime: data.availableStartTime || null,
          availableEndTime: data.availableEndTime || null,
          isOnlineConsultation: data.isOnlineConsultation ?? true,
          isOfflineConsultation: data.isOfflineConsultation ?? true,
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { doctorProfile: true },
    });

    const updatedDoctorProfile = updatedUser?.doctorProfile;

    const fullProfile = {
      userId: user.id,
      name: updatedUser?.name || data.name,
      email: updatedUser?.email || data.email,
      avatar: updatedUser?.avatar || data.avatar,

      phone: updatedDoctorProfile?.phone || "",
      dateOfBirth: updatedDoctorProfile?.dateOfBirth || "",
      gender: updatedDoctorProfile?.gender || "Male",
      qualification: updatedDoctorProfile?.qualification || "",
      degree: updatedDoctorProfile?.degree || "",
      specialization: updatedDoctorProfile?.specialization || "",
      registrationNumber: updatedDoctorProfile?.registrationNumber || "",
      yearsOfPractice: updatedDoctorProfile?.yearsOfPractice ?? 0,
      languages: updatedDoctorProfile?.languages || "",
      consultationType: updatedDoctorProfile?.consultationType || "",

      clinicName: updatedDoctorProfile?.clinicName || "",
      clinicAddress: updatedDoctorProfile?.clinicAddress || "",
      city: updatedDoctorProfile?.city || "",
      state: updatedDoctorProfile?.state || "",
      pincode: updatedDoctorProfile?.pincode || "",
      clinicPhone: updatedDoctorProfile?.clinicPhone || "",
      clinicEmail: updatedDoctorProfile?.clinicEmail || "",

      shortBio: updatedDoctorProfile?.shortBio || "",
      areasOfPractice: updatedDoctorProfile?.areasOfPractice || "",

      consultationDays: updatedDoctorProfile?.consultationDays || "",
      availableStartTime: updatedDoctorProfile?.availableStartTime || "",
      availableEndTime: updatedDoctorProfile?.availableEndTime || "",
      isOnlineConsultation: updatedDoctorProfile?.isOnlineConsultation ?? true,
      isOfflineConsultation: updatedDoctorProfile?.isOfflineConsultation ?? true,
    };

    const completion = calculateProfileCompletion(fullProfile);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: fullProfile,
      completion,
    });
  } catch (err: any) {
    console.error("[Doctor Profile PUT Error]:", err);
    return NextResponse.json(
      { error: "Unable to save profile. Please try again." },
      { status: 500 }
    );
  }
}
