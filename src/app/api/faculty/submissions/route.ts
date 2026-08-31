import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch student logbooks submitted to faculty
    const submittedLogbooks = await prisma.studentLogbook.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch mystery case submissions
    let mysterySubmissions: any[] = [];
    try {
      mysterySubmissions = await prisma.mysteryCaseSubmission.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          case: {
            select: { title: true, caseNumber: true, weekLabel: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      submittedLogbooks,
      mysterySubmissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load faculty submissions" },
      { status: 500 }
    );
  }
}
