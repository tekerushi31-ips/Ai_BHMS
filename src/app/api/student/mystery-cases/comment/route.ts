import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { caseId, content } = body;

    if (!caseId || !content?.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty." }, { status: 400 });
    }

    const comment = await prisma.mysteryCaseComment.create({
      data: {
        caseId,
        userId: user.id,
        userName: user.name || "BHMS Scholar",
        userRole: user.role,
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
