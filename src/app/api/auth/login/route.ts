import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { auditService } from "@/services/audit";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
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
      action: "USER_LOGIN",
      resource: "AUTH",
      details: { email: user.email, role: user.role },
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
    console.error("[Login API Error]:", err);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
