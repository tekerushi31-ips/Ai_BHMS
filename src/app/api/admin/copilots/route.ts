import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Admin authorization required" }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany({
      where: { category: "FEATURE_FLAG" },
    });

    const flagsMap: Record<string, boolean> = {};
    settings.forEach((s) => {
      flagsMap[s.key] = s.value === "true";
    });

    const defaultFlags = {
      // 1. STUDENT AI
      "student:ai_tutor": true,
      "student:virtual_patient": true,
      "student:repertorization": true,
      "student:materia_medica": true,
      "student:quiz": true,
      "student:viva": true,
      "student:aiapget": true,
      "student:organon": true,
      "student:logbook": true,

      // 2. DOCTOR AI
      "doctor:clinical_ai": true,
      "doctor:voice_ai": true,
      "doctor:rag_search": true,
      "doctor:repertory": true,
      "doctor:followup_ai": true,

      // 3. FACULTY AI
      "faculty:mystery_cases": true,
      "faculty:case_review": true,
      "faculty:feedback_ai": true,
      "faculty:evaluation": true,

      // 4. PATIENT AI
      "patient:health_assistant": true,
      "patient:record_summary": true,
      "patient:appointment_help": true,
      "patient:question_prep": true,
    };

    const copilotFlags = { ...defaultFlags, ...flagsMap };

    return NextResponse.json({ success: true, flags: copilotFlags });
  } catch (err: any) {
    console.error("[Admin Copilots GET Error]:", err);
    return NextResponse.json({ error: "Failed to load copilot feature settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const { key, enabled } = body;

    if (!key || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid flag parameters" }, { status: 400 });
    }

    await prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: enabled ? "true" : "false",
        category: "FEATURE_FLAG",
        updatedBy: user.id,
      },
      update: {
        value: enabled ? "true" : "false",
        updatedBy: user.id,
      },
    });

    await auditService.logAction({
      userId: user.id,
      action: "FEATURE_TOGGLED",
      resource: "FEATURE_FLAG",
      details: { key, enabled },
    });

    return NextResponse.json({
      success: true,
      message: `Feature ${key} set to ${enabled ? "ON" : "OFF"}`,
    });
  } catch (err: any) {
    console.error("[Admin Copilots PUT Error]:", err);
    return NextResponse.json({ error: "Failed to update feature setting" }, { status: 500 });
  }
}
