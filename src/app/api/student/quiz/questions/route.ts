import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const difficulty = searchParams.get("difficulty");
  const count = parseInt(searchParams.get("count") || "5", 10);

  const whereClause: any = {};
  if (subject && subject !== "ALL") {
    whereClause.subject = subject;
  }
  if (difficulty && difficulty !== "ALL") {
    whereClause.difficulty = difficulty;
  }

  const questions = await prisma.quizQuestion.findMany({
    where: whereClause,
    take: count,
  });

  return NextResponse.json({ questions });
}
