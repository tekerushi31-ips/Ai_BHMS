import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

const UserUpdateSchema = z.object({
  userId: z.string(),
  isActive: z.boolean().optional(),
  role: z.enum(["STUDENT", "DOCTOR", "PATIENT", "ADMIN"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const whereClause: any = {};
    if (role && role !== "ALL") {
      whereClause.role = role;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: {
          select: {
            specialization: true,
            registrationNumber: true,
            clinicName: true,
          },
        },
        studentProfile: {
          select: {
            yearOfStudy: true,
            college: true,
          },
        },
        patientProfile: {
          select: {
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("[Admin Users GET Error]:", err);
    return NextResponse.json({ error: "Failed to load user records" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = UserUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
    }

    const { userId, isActive, role } = validated.data;

    // Prevent admin from deactivating or demoting themselves
    if (userId === adminUser.id && (isActive === false || (role && role !== "ADMIN"))) {
      return NextResponse.json(
        { error: "You cannot deactivate or demote your own admin account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (role) updateData.role = role;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await auditService.logAction({
      userId: adminUser.id,
      action: typeof isActive === "boolean" ? (isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED") : "USER_ROLE_UPDATED",
      resource: "USER",
      resourceId: userId,
      details: {
        targetEmail: targetUser.email,
        oldRole: targetUser.role,
        newRole: updated.role,
        isActive: updated.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.name} updated successfully`,
      user: updated,
    });
  } catch (err: any) {
    console.error("[Admin Users PUT Error]:", err);
    return NextResponse.json({ error: "Failed to update user account" }, { status: 500 });
  }
}
