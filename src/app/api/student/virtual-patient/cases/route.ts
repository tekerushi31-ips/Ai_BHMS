import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await prisma.virtualPatientCase.findMany({
    select: {
      id: true,
      codeName: true,
      title: true,
      age: true,
      gender: true,
      occupation: true,
      difficulty: true,
      educationalNotes: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ cases });
}
