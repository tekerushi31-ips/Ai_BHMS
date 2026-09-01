import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {};
    if (action && action !== "ALL") {
      whereClause.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("[Admin Audit Logs GET Error]:", err);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
