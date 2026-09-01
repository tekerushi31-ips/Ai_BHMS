import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { auditService } from "@/services/audit";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Account deactivated. Please contact platform administration." },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Strict Admin Authorization Check
    if (user.role !== "ADMIN") {
      await auditService.logAction({
        userId: user.id,
        action: "ADMIN_LOGIN_DENIED",
        resource: "AUTH",
        details: { email, role: user.role, reason: "Insufficient privileges" },
      });

      return NextResponse.json(
        { error: "Access Denied: Only platform administrators can log into the Central Admin Portal." },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN",
      avatar: user.avatar,
    };

    const token = await signToken(sessionPayload);
    await setSessionCookie(token);

    await auditService.logAction({
      userId: user.id,
      action: "ADMIN_LOGIN_SUCCESS",
      resource: "AUTH",
      details: { email: user.email },
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl: "/admin/dashboard",
    });
  } catch (err: any) {
    console.error("[Admin Auth Login Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to authenticate admin session" },
      { status: 500 }
    );
  }
}
