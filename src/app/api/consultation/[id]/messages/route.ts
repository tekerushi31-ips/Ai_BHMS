import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;

    const session = await prisma.consultationSession.findUnique({
      where: { appointmentId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: true, messages: [] });
    }

    // Verify user participation
    if (user.id !== session.patientUserId && user.id !== session.doctorId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      messages: session.messages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch consultation messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await context.params;
    const body = await req.json();
    const { message, attachmentUrl, attachmentName } = body;

    if (!message?.trim() && !attachmentUrl) {
      return NextResponse.json({ error: "Message content or attachment required." }, { status: 400 });
    }

    const session = await prisma.consultationSession.findUnique({
      where: { appointmentId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const isPatient = user.id === session.patientUserId;
    const isDoctor = user.id === session.doctorId;

    if (!isPatient && !isDoctor && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const chatMsg = await prisma.consultationChatMessage.create({
      data: {
        consultationSessionId: session.id,
        senderUserId: user.id,
        senderName: user.name,
        senderRole: isDoctor ? "DOCTOR" : "PATIENT",
        message: message?.trim() || "",
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: chatMsg,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send consultation message" },
      { status: 500 }
    );
  }
}
