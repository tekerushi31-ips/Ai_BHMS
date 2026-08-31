import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await req.json();

    const vpCase = await prisma.virtualPatientCase.findUnique({
      where: { id: caseId },
    });

    if (!vpCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const groundTruth = JSON.parse(vpCase.groundTruthJson);

    // Create a new fresh session
    const session = await prisma.virtualPatientSession.create({
      data: {
        userId: user.id,
        caseId: vpCase.id,
        status: "IN_PROGRESS",
        transcriptJson: JSON.stringify([
          {
            sender: "PATIENT",
            text: `Hello Doctor. I've come because ${groundTruth.chiefComplaint}`,
            timestamp: new Date().toISOString(),
          },
        ]),
        factsDiscoveredJson: JSON.stringify(["Chief Complaint"]),
      },
      include: {
        case: true,
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        transcript: JSON.parse(session.transcriptJson),
        factsDiscovered: JSON.parse(session.factsDiscoveredJson || "[]"),
        case: {
          id: vpCase.id,
          title: vpCase.title,
          age: vpCase.age,
          gender: vpCase.gender,
          occupation: vpCase.occupation,
          difficulty: vpCase.difficulty,
        },
      },
    });
  } catch (err) {
    console.error("[VP Session Error]:", err);
    return NextResponse.json({ error: "Failed to initialize session" }, { status: 500 });
  }
}
