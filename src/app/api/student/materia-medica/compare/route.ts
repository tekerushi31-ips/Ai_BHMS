import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { materiaMedicaService } from "@/services/materia-medica";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const remedies = materiaMedicaService.getAllRemedies();
    return NextResponse.json({
      remedies: remedies.map((r) => ({
        id: r.id,
        name: r.name,
        commonName: r.commonName,
        familyOrSource: r.familyOrSource,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load remedies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { remedyIds } = body;

    if (!Array.isArray(remedyIds) || remedyIds.length < 2 || remedyIds.length > 4) {
      return NextResponse.json(
        { error: "Please select between 2 and 4 remedies to compare." },
        { status: 400 }
      );
    }

    const compared = materiaMedicaService.compareRemedies(remedyIds);

    return NextResponse.json({
      success: true,
      remedies: compared,
      count: compared.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to compare remedies" },
      { status: 500 }
    );
  }
}
