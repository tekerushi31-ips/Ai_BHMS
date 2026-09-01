import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/auth";
import { auditService } from "@/services/audit";

export async function POST(req: NextRequest) {
  try {
    const { preset } = await req.json();

    let targetEmail = "student1@bhms.ai";
    let targetName = "Aarav Sharma";
    let targetRole: "STUDENT" | "DOCTOR" | "PATIENT" | "ADMIN" = "STUDENT";
    let redirectUrl = "/student/dashboard";

    if (preset === "student2") {
      targetEmail = "student2@bhms.ai";
      targetName = "Pooja Deshmukh";
      targetRole = "STUDENT";
      redirectUrl = "/student/dashboard";
    } else if (preset === "student3") {
      targetEmail = "student3@bhms.ai";
      targetName = "Rohan Kulkarni";
      targetRole = "STUDENT";
      redirectUrl = "/student/dashboard";
    } else if (preset === "doctor1" || preset === "doctor") {
      targetEmail = "dr.sharma@bhms.ai";
      targetName = "Dr. Vikram Sharma";
      targetRole = "DOCTOR";
      redirectUrl = "/doctor/dashboard";
    } else if (preset === "doctor2") {
      targetEmail = "dr.patil@bhms.ai";
      targetName = "Dr. Ananya Patil";
      targetRole = "DOCTOR";
      redirectUrl = "/doctor/dashboard";
    } else if (preset === "admin") {
      targetEmail = "admin@bhms.ai";
      targetName = "Admin Officer";
      targetRole = "ADMIN";
      redirectUrl = "/admin";
    } else if (preset === "patient" || preset === "patient1") {
      targetEmail = "patient.amit@bhms.ai";
      targetName = "Amit Deshmukh";
      targetRole = "PATIENT";
      redirectUrl = "/patient/dashboard";
    }

    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: targetEmail },
      });

      // Auto-create missing demo user in database
      if (!user) {
        const bcrypt = (await import("bcryptjs")).default;
        const passHash = await bcrypt.hash("Password123!", 10);

        if (targetRole === "STUDENT") {
          user = await prisma.user.create({
            data: {
              email: targetEmail,
              passwordHash: passHash,
              name: targetName,
              role: "STUDENT",
              studentProfile: {
                create: {
                  yearOfStudy: 4,
                  college: "National Homoeopathic Medical College",
                  targetExam: "AIAPGET & Final BHMS",
                  streakDays: 5,
                  totalStudyHours: 32.5,
                },
              },
            },
          });
        } else if (targetRole === "DOCTOR") {
          user = await prisma.user.create({
            data: {
              email: targetEmail,
              passwordHash: passHash,
              name: targetName,
              role: "DOCTOR",
              doctorProfile: {
                create: {
                  clinicName: "Homoeopathic Healing Centre",
                  registrationNumber: "CCH-2024-8842",
                  specialization: "Classical Homoeopathy & Chronic Diseases",
                  yearsOfPractice: 7,
                },
              },
            },
          });
        } else if (targetRole === "PATIENT") {
          user = await prisma.user.create({
            data: {
              email: targetEmail,
              passwordHash: passHash,
              name: targetName,
              role: "PATIENT",
              patientProfile: {
                create: {
                  age: 32,
                  gender: "Male",
                  phone: "+91 98765 43210",
                  address: "42, Sunrise Apartments, Pune, Maharashtra",
                  emergencyContact: "+91 98765 00000 (Spouse)",
                  bloodGroup: "B+",
                  allergies: "Dust mites, Pollen",
                },
              },
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email: targetEmail,
              passwordHash: passHash,
              name: targetName,
              role: "ADMIN",
            },
          });
        }
      }
    } catch (dbError) {
      console.warn("[Demo Login DB Warning - using in-memory demo session]:", dbError);
    }

    const sessionPayload = {
      id: user?.id || `demo-${preset || "student"}-id`,
      email: user?.email || targetEmail,
      name: user?.name || targetName,
      role: (user?.role || targetRole) as any,
      avatar: user?.avatar || null,
    };

    const token = await signToken(sessionPayload);
    await setSessionCookie(token);

    try {
      if (user?.id) {
        await auditService.logAction({
          userId: user.id,
          action: "DEMO_LOGIN",
          resource: "AUTH",
          details: { preset, email: sessionPayload.email, role: sessionPayload.role },
        });
      }
    } catch (e) {
      // Ignore non-critical audit logging failure
    }

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
    });
  } catch (err) {
    console.error("[Demo Login Catch-All Error]:", err);
    return NextResponse.json(
      { error: "Failed to authenticate demo user" },
      { status: 500 }
    );
  }
}

