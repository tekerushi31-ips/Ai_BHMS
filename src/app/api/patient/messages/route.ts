import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let messages = await prisma.patientMessage.findMany({
      where: { patientUserId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const doctor = await prisma.user.findFirst({
      where: { role: "DOCTOR" },
      select: { id: true, name: true, doctorProfile: true },
    });

    // Seed default starter messages if empty
    if (messages.length === 0 && doctor) {
      await prisma.patientMessage.createMany({
        data: [
          {
            patientUserId: user.id,
            doctorId: doctor.id,
            senderRole: "DOCTOR",
            content: `Hello Amit, welcome to the BHMS health portal. Please let me know if you experience any changes in your morning sneezing or nasal symptoms after beginning your remedy.`,
            createdAt: new Date(Date.now() - 86400000 * 2),
            isRead: true,
          },
          {
            patientUserId: user.id,
            doctorId: doctor.id,
            senderRole: "PATIENT",
            content: `Thank you Dr. Sharma. The morning paroxysms have reduced significantly. I have uploaded my latest CBC report as well.`,
            createdAt: new Date(Date.now() - 86400000),
            isRead: true,
          },
          {
            patientUserId: user.id,
            doctorId: doctor.id,
            senderRole: "DOCTOR",
            content: `I reviewed your CBC and eosinophil counts. The response is very positive. Keep following the prescribed dosage until our next appointment.`,
            createdAt: new Date(Date.now() - 3600000 * 12),
            isRead: true,
          },
        ],
      });

      messages = await prisma.patientMessage.findMany({
        where: { patientUserId: user.id },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      messages,
      doctor: doctor
        ? {
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.doctorProfile?.specialization || "Homoeopathic Physician",
            clinicName: doctor.doctorProfile?.clinicName || "Homoeopathic Healing Centre",
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, doctorId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }

    const doc = doctorId
      ? await prisma.user.findUnique({ where: { id: doctorId } })
      : await prisma.user.findFirst({ where: { role: "DOCTOR" } });

    if (!doc) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const message = await prisma.patientMessage.create({
      data: {
        patientUserId: user.id,
        doctorId: doc.id,
        senderRole: "PATIENT",
        content: content.trim(),
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
