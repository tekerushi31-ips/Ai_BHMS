import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ragService } from "@/services/rag";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, category = "ALL" } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Doctor clinical retrieval searches ONLY verified sources
    const isDoctor = user.role === "DOCTOR";
    const result = await ragService.searchKnowledge(query, {
      category,
      verifiedOnly: isDoctor, // Strict verified-only for doctors
      limit: 6,
      minSimilarityThreshold: 0.3,
    });

    return NextResponse.json({
      success: true,
      query,
      sources: result.sources,
      hasVerifiedMatch: result.hasVerifiedMatch,
      count: result.count,
      message:
        result.sources.length === 0
          ? "No verified source found for this query in the authoritative Homoeopathic knowledge base."
          : `Retrieved ${result.sources.length} authoritative reference(s).`,
    });
  } catch (err) {
    console.error("[Knowledge Search Error]:", err);
    return NextResponse.json(
      { error: "Knowledge search service unavailable" },
      { status: 500 }
    );
  }
}
