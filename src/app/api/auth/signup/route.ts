import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { auditService } from "@/services/audit";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "DOCTOR", "PATIENT"]),
  collegeOrClinic: z.string().optional(),
  yearOrReg: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SignupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role, collegeOrClinic, yearOrReg } = validated.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role,
        studentProfile:
          role === "STUDENT"
            ? {
                create: {
                  college: collegeOrClinic || "Homoeopathic Medical College",
                  yearOfStudy: parseInt(yearOrReg || "1", 10) || 1,
                  targetExam: "University Exams & AIAPGET",
                },
              }
            : undefined,
        doctorProfile:
          role === "DOCTOR"
            ? {
                create: {
                  clinicName: collegeOrClinic || "Homoeopathic Healing Centre",
                  registrationNumber: yearOrReg || "CCH-PENDING",
                  specialization: "Classical Homoeopathy",
                },
              }
            : undefined,
        patientProfile:
          role === "PATIENT"
            ? {
                create: {
                  age: parseInt(yearOrReg || "30", 10) || 30,
                  phone: collegeOrClinic || "+91 98765 43210",
                  gender: "Male",
                  bloodGroup: "B+",
                },
              }
            : undefined,
      },
    });

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
      action: "USER_SIGNUP",
      resource: "AUTH",
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl:
        role === "STUDENT"
          ? "/student/dashboard"
          : role === "DOCTOR"
          ? "/doctor/dashboard"
          : "/patient/dashboard",
    });
  } catch (err) {
    console.error("[Signup API Error]:", err);
    return NextResponse.json(
      { error: "Failed to create user account" },
      { status: 500 }
    );
  }
}
