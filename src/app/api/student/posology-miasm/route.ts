import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { posologyMiasmService } from "@/services/posology-miasm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const symptoms = posologyMiasmService.getAllSymptoms();
    const potencyGuidelines = posologyMiasmService.getPotencyGuidelines();

    return NextResponse.json({
      success: true,
      symptoms,
      potencyGuidelines,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load posology & miasm data" },
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
    const { symptomIds } = body;

    if (!Array.isArray(symptomIds) || symptomIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one symptom for educational miasmatic analysis." },
        { status: 400 }
      );
    }

    const analysis = posologyMiasmService.analyzeMiasmaticTotality(symptomIds);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to perform miasmatic analysis" },
      { status: 500 }
    );
  }
}
