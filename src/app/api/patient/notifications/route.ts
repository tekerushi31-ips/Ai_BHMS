import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let notifications = await prisma.patientNotification.findMany({
      where: { patientUserId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (notifications.length === 0) {
      await prisma.patientNotification.createMany({
        data: [
          {
            patientUserId: user.id,
            title: "Welcome to BHMS Health Portal",
            message: "Your patient account has been activated. You can now view health records, track appointments, and message Dr. Sharma.",
            type: "GENERAL",
            isRead: false,
          },
          {
            patientUserId: user.id,
            title: "Follow-up Response Received",
            message: "Dr. Vikram Sharma reviewed your allergic rhinitis follow-up report.",
            type: "FOLLOWUP",
            isRead: false,
          },
        ],
      });

      notifications = await prisma.patientNotification.findMany({
        where: { patientUserId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (id === "ALL") {
      await prisma.patientNotification.updateMany({
        where: { patientUserId: user.id },
        data: { isRead: true },
      });
    } else {
      await prisma.patientNotification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notifications updated.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
