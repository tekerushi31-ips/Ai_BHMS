import { CaseAnalysisResult } from "@/types";
import { ragService } from "../rag";
import { safetyService } from "../safety";
import { CLINICAL_DISCLAIMER } from "@/lib/constants";

export interface CaseInput {
  chiefComplaint: string;
  duration?: string;
  location?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
  mentalGenerals?: string;
  physicalGenerals?: string;
  pastHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
  investigations?: string;
  currentMedications?: string;
  rawNotes?: string;
}

export class CaseAnalysisService {
  private static instance: CaseAnalysisService;

  public static getInstance(): CaseAnalysisService {
    if (!CaseAnalysisService.instance) {
      CaseAnalysisService.instance = new CaseAnalysisService();
    }
    return CaseAnalysisService.instance;
  }

  public async analyzeCase(caseData: CaseInput): Promise<{
    analysis: CaseAnalysisResult;
    ragSources: any[];
  }> {
    // 1. Evaluate Safety & Red Flags
    const safetyAlerts = safetyService.evaluateClinicalSafety(caseData);

    // 2. Identify Missing Information (Clinical gaps)
    const missingInfo: string[] = [];
    if (!caseData.modalities || caseData.modalities.trim().length < 5) {
      missingInfo.push("Precise Modalities missing: Thermal (< heat / < cold), Time (< morning / night), Positional, and Motion.");
    }
    if (!caseData.sensation || caseData.sensation.trim().length < 3) {
      missingInfo.push("Sensation characterization missing: Throbbing, burning, stitching, aching, or cramping nature.");
    }
    if (!caseData.concomitants || caseData.concomitants.trim().length < 3) {
      missingInfo.push("Concomitant symptoms: Co-occurring symptoms in other organ systems during the acute/chronic episode.");
    }
    if (!caseData.mentalGenerals || caseData.mentalGenerals.trim().length < 5) {
      missingInfo.push("Mental Generals missing: Disposition, irritability, anxiety, fears, weeping tendency, memory, and emotional triggers.");
    }
    if (!caseData.physicalGenerals || caseData.physicalGenerals.trim().length < 5) {
      missingInfo.push("Physical Generals missing: Thermal reaction (Chilly vs Hot), thirst (Thirsty vs Thirstless), appetite, cravings, aversions, and perspiration.");
    }
    if (!caseData.duration || caseData.duration.trim().length < 2) {
      missingInfo.push("Chronological onset & duration: Precise onset (sudden vs gradual) and timeline of progression.");
    }

    // 3. Totality of Symptoms Synthesis
    const totalityOfSymptoms: string[] = [];
    if (caseData.chiefComplaint) {
      totalityOfSymptoms.push(`Chief Complaint: ${caseData.chiefComplaint}`);
    }
    if (caseData.location || caseData.sensation) {
      totalityOfSymptoms.push(`Location & Sensation: ${[caseData.location, caseData.sensation].filter(Boolean).join(" - ")}`);
    }
    if (caseData.modalities) {
      totalityOfSymptoms.push(`Modalities: ${caseData.modalities}`);
    }
    if (caseData.mentalGenerals) {
      totalityOfSymptoms.push(`Mental Generals: ${caseData.mentalGenerals}`);
    }
    if (caseData.physicalGenerals) {
      totalityOfSymptoms.push(`Physical Generals: ${caseData.physicalGenerals}`);
    }
    if (caseData.concomitants) {
      totalityOfSymptoms.push(`Concomitants: ${caseData.concomitants}`);
    }

    // 4. Candidate Repertory Rubrics Extraction
    const suggestedRubrics = this.extractCandidateRubrics(caseData);

    // 5. Query Verified Knowledge Base
    const query = [caseData.chiefComplaint, caseData.sensation, caseData.modalities, caseData.mentalGenerals]
      .filter(Boolean)
      .join(" ");

    const ragResult = await ragService.searchKnowledge(query, {
      verifiedOnly: true,
      limit: 4,
      minSimilarityThreshold: 0.3,
    });

    // 6. Uncertainty Assessment
    const uncertaintyNotes =
      missingInfo.length > 2
        ? "High Uncertainty: Case taking is incomplete. Key modalities and constitutional generals are missing, limiting repertorial synthesis. Qualified doctor clarification is required before selecting a remedy."
        : "Moderate Uncertainty: Totality synthesized based on current clinical presentation. Differential Materia Medica confirmation required by practitioner.";

    const result: CaseAnalysisResult = {
      summary: {
        chiefComplaint: caseData.chiefComplaint || "Not specified",
        duration: caseData.duration || "Not specified",
        locationSensation: `${caseData.location || "General"} : ${caseData.sensation || "Unspecified"}`,
        modalities: caseData.modalities || "Unspecified",
        concomitants: caseData.concomitants || "None reported",
        mentalGenerals: caseData.mentalGenerals || "Not recorded",
        physicalGenerals: caseData.physicalGenerals || "Not recorded",
      },
      totalityOfSymptoms,
      missingInformation: missingInfo,
      suggestedRubrics,
      safetyAlerts: safetyAlerts.map((a) => ({
        level: a.level,
        message: a.message,
        clinicalContext: a.clinicalContext,
      })),
      uncertaintyNotes,
      disclaimer: CLINICAL_DISCLAIMER,
    };

    return {
      analysis: result,
      ragSources: ragResult.sources,
    };
  }

  private extractCandidateRubrics(caseData: CaseInput): Array<{
    rubric: string;
    relevance: string;
    kentReference?: string;
  }> {
    const text = `${caseData.chiefComplaint} ${caseData.location} ${caseData.sensation} ${caseData.modalities} ${caseData.mentalGenerals} ${caseData.physicalGenerals}`.toLowerCase();
    const rubrics: Array<{ rubric: string; relevance: string; kentReference?: string }> = [];

    if (text.includes("headache") || text.includes("head")) {
      if (text.includes("morning") || text.includes("sun")) {
        rubrics.push({
          rubric: "HEAD - PAIN - morning, sun, with the",
          relevance: "Matches morning aggravation of cephalic complaint (Nat-m, Glon, Sang, Spig).",
          kentReference: "Kent Repertory p. 142",
        });
      }
      if (text.includes("throbbing") || text.includes("pulsat")) {
        rubrics.push({
          rubric: "HEAD - PAIN - pulsating, throbbing",
          relevance: "Character of vascular congestion (Bell, Glon, Melil, China).",
          kentReference: "Kent Repertory p. 182",
        });
      }
      if (text.includes("cold air") || text.includes("draft")) {
        rubrics.push({
          rubric: "HEAD - PAIN - cold air - agg.",
          relevance: "Aggravation from exposure to cold air / wind (Acon, Sil, Nux-v, Hep).",
          kentReference: "Kent Repertory p. 148",
        });
      }
    }

    if (text.includes("anxiety") || text.includes("fear") || text.includes("restless")) {
      if (text.includes("death") || text.includes("fatal")) {
        rubrics.push({
          rubric: "MIND - FEAR - death, of",
          relevance: "Characteristic mental keynote (Acon, Ars, Phos, Plat, Sec).",
          kentReference: "Kent Repertory p. 43",
        });
      }
      if (text.includes("anticipat") || text.includes("exam") || text.includes("event")) {
        rubrics.push({
          rubric: "MIND - ANXIETY - anticipation, from",
          relevance: "Anticipatory anxiety and diarrhea before engagements (Gels, Arg-n, Lyc, Med).",
          kentReference: "Kent Repertory p. 6",
        });
      }
    }

    if (text.includes("stomach") || text.includes("gastric") || text.includes("acidity") || text.includes("burning")) {
      if (text.includes("burning")) {
        rubrics.push({
          rubric: "STOMACH - PAIN - burning",
          relevance: "Gastric burning sensation (Ars, Phos, Nux-v, Iris, Sulph).",
          kentReference: "Kent Repertory p. 518",
        });
      }
      if (text.includes("warm drinks") || text.includes("hot water")) {
        rubrics.push({
          rubric: "STOMACH - PAIN - warm drinks - amel.",
          relevance: "Relief from warm fluids (Ars, Chel, Nux-v).",
          kentReference: "Kent Repertory p. 526",
        });
      }
    }

    if (rubrics.length === 0) {
      rubrics.push({
        rubric: "GENERALITIES - PAIN - burning, externally and internally",
        relevance: "General modality synthesis pending further detailed case symptom elicitation.",
        kentReference: "Kent Repertory p. 1342",
      });
    }

    return rubrics;
  }
}

export const caseAnalysisService = CaseAnalysisService.getInstance();
