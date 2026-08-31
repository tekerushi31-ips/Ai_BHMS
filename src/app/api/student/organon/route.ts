import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { organonService } from "@/services/organon";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "ALL";

    const results = organonService.searchAphorisms(q, category);

    return NextResponse.json({
      success: true,
      count: results.length,
      aphorisms: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to search Organon aphorisms" },
      { status: 500 }
    );
  }
}
