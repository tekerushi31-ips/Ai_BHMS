import { FollowUpSummaryResult } from "@/types";

export interface StoredVisit {
  id: string;
  visitNumber: number;
  visitDate: Date | string;
  symptomsSummary: string;
  statusChange: string; // IMPROVED, UNCHANGED, AGGRAVATED, NEW_SYMPTOMS
  observations?: string | null;
  prescriptionNotes?: string | null;
}

export class FollowUpService {
  private static instance: FollowUpService;

  public static getInstance(): FollowUpService {
    if (!FollowUpService.instance) {
      FollowUpService.instance = new FollowUpService();
    }
    return FollowUpService.instance;
  }

  /**
   * Compares chronological visits strictly based on stored visit data
   */
  public analyzeVisits(visits: StoredVisit[]): FollowUpSummaryResult | null {
    if (!visits || visits.length < 2) {
      return null;
    }

    // Sort visits chronologically (oldest to newest)
    const sortedVisits = [...visits].sort(
      (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
    );

    const initialVisit = sortedVisits[0];
    const latestVisit = sortedVisits[sortedVisits.length - 1];
    const previousVisit = sortedVisits[sortedVisits.length - 2];

    const improved: string[] = [];
    const unchanged: string[] = [];
    const aggravated: string[] = [];
    const newSymps: string[] = [];

    // Analyze status changes across visits
    sortedVisits.slice(1).forEach((v) => {
      const summary = (v.symptomsSummary || "").toLowerCase();
      const status = v.statusChange || "UNCHANGED";

      if (status === "IMPROVED" || summary.includes("relief") || summary.includes("better") || summary.includes("improved") || summary.includes("decreased")) {
        improved.push(`Visit #${v.visitNumber} (${new Date(v.visitDate).toLocaleDateString()}): ${v.symptomsSummary}`);
      } else if (status === "AGGRAVATED" || summary.includes("worse") || summary.includes("increased") || summary.includes("aggravated")) {
        aggravated.push(`Visit #${v.visitNumber} (${new Date(v.visitDate).toLocaleDateString()}): ${v.symptomsSummary}`);
      } else if (status === "NEW_SYMPTOMS" || summary.includes("new symptom") || summary.includes("appeared")) {
        newSymps.push(`Visit #${v.visitNumber} (${new Date(v.visitDate).toLocaleDateString()}): ${v.symptomsSummary}`);
      } else {
        unchanged.push(`Visit #${v.visitNumber} (${new Date(v.visitDate).toLocaleDateString()}): ${v.symptomsSummary}`);
      }
    });

    // Determine overall trend
    let trend: FollowUpSummaryResult["trend"] = "UNCHANGED";
    if (improved.length > 0 && aggravated.length === 0 && newSymps.length === 0) {
      trend = "IMPROVED";
    } else if (aggravated.length > 0 && improved.length === 0) {
      trend = "AGGRAVATED";
    } else if (improved.length > 0 && (aggravated.length > 0 || newSymps.length > 0)) {
      trend = "MIXED";
    }

    // Prescribing considerations derived from Kent's 12 Observations & Hering's Law
    const considerations: string[] = [];
    if (trend === "IMPROVED") {
      considerations.push("Kent Observation #4: General improvement without aggravation indicates well-chosen remedy in proper potency. Maintain placebo (SL) and avoid repeating as long as improvement continues.");
      considerations.push("Verify Hering's Law of Cure: Ensure symptoms are moving from above downward, within outwards, and in reverse order of appearance.");
    } else if (trend === "AGGRAVATED") {
      considerations.push("Kent Observation #1 & #2: A prolonged aggravation indicates either deep incurable pathology or an excessively high potency. Observe carefully before prescribing an antidote.");
    } else if (trend === "MIXED") {
      considerations.push("Kent Observation #8: If old symptoms return while general health improves, this is a positive prognostic sign. Do not interfere.");
      considerations.push("If entirely new un-related symptoms appear, re-case taking may be indicated for a second prescription.");
    } else {
      considerations.push("Kent Observation #11: When remedy does not seem to act and symptoms remain unchanged, review susceptibility, obstacles to cure, or consider repeating in higher potency / LM scale.");
    }

    const narrativeSummary = `Patient has completed ${visits.length} recorded visits spanning from ${new Date(initialVisit.visitDate).toLocaleDateString()} to ${new Date(latestVisit.visitDate).toLocaleDateString()}. Based strictly on recorded anamnesis, the overall clinical trajectory is categorized as ${trend}.`;

    return {
      trend,
      summary: narrativeSummary,
      improvedSymptoms: improved,
      unchangedSymptoms: unchanged,
      aggravatedSymptoms: aggravated,
      newSymptoms: newSymps,
      prescribingConsiderations: considerations,
      nextStepsAdvice:
        trend === "IMPROVED"
          ? "Continue current management with Placebo/Sac Lac. Schedule next follow-up in 3-4 weeks."
          : "Review mental generals and modalities for possible complementary or second prescription.",
    };
  }
}

export const followUpService = FollowUpService.getInstance();
