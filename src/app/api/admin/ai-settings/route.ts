import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const settings = await prisma.systemSetting.findMany({
      where: { category: "AI_CONFIG" },
    });

    const aiConfigMap: Record<string, string> = {};
    settings.forEach((s) => {
      aiConfigMap[s.key] = s.value;
    });

    const defaultConfig = {
      aiModel: process.env.AI_MODEL || "gemini-1.5-flash",
      temperature: "0.2",
      maxTokens: "1500",
      ragRetrievalCount: "5",
      defaultLanguage: "English",
      studentSystemPromptVersion: "v2.1-grounded-organon",
      doctorSystemPromptVersion: "v3.0-clinical-repertory",
      facultySystemPromptVersion: "v1.4-viva-evaluation",
      patientSystemPromptVersion: "v1.0-health-literacy",
    };

    const finalConfig = { ...defaultConfig, ...aiConfigMap };

    return NextResponse.json({ success: true, config: finalConfig });
  } catch (err: any) {
    console.error("[Admin AI Settings GET Error]:", err);
    return NextResponse.json({ error: "Failed to load AI settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      aiModel,
      temperature,
      maxTokens,
      ragRetrievalCount,
      defaultLanguage,
      studentSystemPromptVersion,
      doctorSystemPromptVersion,
      facultySystemPromptVersion,
      patientSystemPromptVersion,
    } = body;

    const updates = [
      { key: "aiModel", value: aiModel },
      { key: "temperature", value: String(temperature) },
      { key: "maxTokens", value: String(maxTokens) },
      { key: "ragRetrievalCount", value: String(ragRetrievalCount) },
      { key: "defaultLanguage", value: defaultLanguage },
      { key: "studentSystemPromptVersion", value: studentSystemPromptVersion },
      { key: "doctorSystemPromptVersion", value: doctorSystemPromptVersion },
      { key: "facultySystemPromptVersion", value: facultySystemPromptVersion },
      { key: "patientSystemPromptVersion", value: patientSystemPromptVersion },
    ];

    for (const item of updates) {
      if (item.value !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          create: {
            key: item.key,
            value: item.value,
            category: "AI_CONFIG",
            updatedBy: user.id,
          },
          update: {
            value: item.value,
            updatedBy: user.id,
          },
        });
      }
    }

    await auditService.logAction({
      userId: user.id,
      action: "AI_SETTING_CHANGED",
      resource: "SYSTEM_SETTING",
      details: { aiModel, temperature, maxTokens, ragRetrievalCount },
    });

    return NextResponse.json({
      success: true,
      message: "AI configuration updated successfully",
    });
  } catch (err: any) {
    console.error("[Admin AI Settings PUT Error]:", err);
    return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
  }
}
