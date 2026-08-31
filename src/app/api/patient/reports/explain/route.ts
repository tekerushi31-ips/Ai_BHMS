import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, reportName } = body;

    let explanationData = {
      reportTitle: reportName || "Laboratory Health Report",
      disclaimer: "This is general educational information. Discuss your report with your qualified healthcare professional.",
      summary: "This report measures standard laboratory blood parameters to assess inflammatory markers and immune balance.",
      terms: [
        {
          term: "Absolute Eosinophil Count (AEC)",
          simplified: "A specific type of white blood cell involved in allergic reactions and parasite defense.",
          generalMeaning: "When mildly higher than average, it commonly suggests environmental allergies (such as pollen, dust, or asthma) or skin sensitivities.",
        },
        {
          term: "Total Serum IgE (Immunoglobulin E)",
          simplified: "An antibody produced by your immune system when it encounters allergens.",
          generalMeaning: "Elevated IgE indicates an active allergic constitution or tendency toward allergic rhinitis, eczema, or reactive airway symptoms.",
        },
        {
          term: "Hemoglobin (Hb)",
          simplified: "The iron-rich protein in red blood cells that carries oxygen throughout your body.",
          generalMeaning: "Normal levels indicate adequate oxygen-carrying capacity and good nutritional foundation.",
        },
      ],
      recommendedQuestions: [
        "How do these eosinophil / IgE levels correlate with my morning sneezing and nasal congestion?",
        "Does my homoeopathic remedy address both the acute symptoms and this underlying allergic sensitivity?",
        "Are there specific lifestyle or dietary adjustments you recommend during high-pollen seasons?",
      ],
    };

    // If reportId provided, save AI explanation in document record
    if (reportId) {
      await prisma.patientDocument.update({
        where: { id: reportId },
        data: {
          aiExplanation: explanationData.summary,
        },
      });
    }

    return NextResponse.json({
      success: true,
      explanation: explanationData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to explain report" },
      { status: 500 }
    );
  }
}
