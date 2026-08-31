export interface SafetyAlert {
  level: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  clinicalContext: string;
  recommendedAction: string;
}

export class SafetyService {
  private static instance: SafetyService;

  public static getInstance(): SafetyService {
    if (!SafetyService.instance) {
      SafetyService.instance = new SafetyService();
    }
    return SafetyService.instance;
  }

  /**
   * Scans case symptoms and notes for red flags and acute medical emergencies
   */
  public evaluateClinicalSafety(caseData: {
    chiefComplaint?: string;
    sensation?: string;
    location?: string;
    modalities?: string;
    physicalGenerals?: string;
    mentalGenerals?: string;
    rawNotes?: string;
  }): SafetyAlert[] {
    const combinedText = Object.values(caseData)
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const alerts: SafetyAlert[] = [];

    // 1. Cardiac Red Flags
    if (
      (combinedText.includes("chest pain") || combinedText.includes("angina") || combinedText.includes("retrosternal")) &&
      (combinedText.includes("left arm") || combinedText.includes("jaw") || combinedText.includes("sweating") || combinedText.includes("breathless") || combinedText.includes("dyspnea"))
    ) {
      alerts.push({
        level: "CRITICAL",
        title: "Potential Acute Coronary Syndrome (ACS) Red Flag",
        message: "Potential concern detected. Review required.",
        clinicalContext: "Chest pain associated with radiation, diaphoresis, or acute dyspnea requires immediate ECG and cardiac biomarker evaluation.",
        recommendedAction: "Refer for emergency medical evaluation / ECG before or alongside homeopathic management.",
      });
    }

    // 2. Acute Abdomen / Appendicitis / Peritonitis
    if (
      (combinedText.includes("severe abdominal pain") || combinedText.includes("right lower quadrant") || combinedText.includes("mcburney") || combinedText.includes("rebound tenderness")) &&
      (combinedText.includes("fever") || combinedText.includes("vomiting") || combinedText.includes("guarding") || combinedText.includes("rigid"))
    ) {
      alerts.push({
        level: "CRITICAL",
        title: "Potential Acute Surgical Abdomen Red Flag",
        message: "Potential concern detected. Review required.",
        clinicalContext: "Severe localized abdominal pain with rigidity, guarding, or high fever may indicate acute appendicitis, perforation, or peritonitis.",
        recommendedAction: "Immediate surgical consultation and diagnostic ultrasound/CT imaging recommended.",
      });
    }

    // 3. Neurological Emergencies
    if (
      combinedText.includes("sudden weakness") ||
      combinedText.includes("facial droop") ||
      combinedText.includes("slurred speech") ||
      combinedText.includes("hemiparesis") ||
      combinedText.includes("thunderclap headache") ||
      combinedText.includes("worst headache of life")
    ) {
      alerts.push({
        level: "CRITICAL",
        title: "Potential Stroke / Neurological Emergency Red Flag",
        message: "Potential concern detected. Review required.",
        clinicalContext: "Sudden onset focal neurological deficits or thunderclap headache may signify acute cerebrovascular event or subarachnoid hemorrhage.",
        recommendedAction: "Urgent hospitalization and neuro-imaging (CT/MRI brain) required.",
      });
    }

    // 4. Severe Psychiatric / Suicidal Risk
    if (
      combinedText.includes("suicide") ||
      combinedText.includes("end my life") ||
      combinedText.includes("kill myself") ||
      combinedText.includes("self harm")
    ) {
      alerts.push({
        level: "CRITICAL",
        title: "Psychiatric Safety Alert: Suicide Risk",
        message: "Potential concern detected. Review required.",
        clinicalContext: "Expressed intent or active ideation of self-harm requires immediate safety planning and mental health professional involvement.",
        recommendedAction: "Do not leave patient unattended; facilitate immediate psychiatric consultation / emergency crisis helpline support.",
      });
    }

    // 5. Severe Pediatric / Dehydration Signs
    if (
      (combinedText.includes("child") || combinedText.includes("infant") || combinedText.includes("baby")) &&
      (combinedText.includes("sunken eyes") || combinedText.includes("lethargic") || combinedText.includes("no urine") || combinedText.includes("anuria"))
    ) {
      alerts.push({
        level: "WARNING",
        title: "Severe Pediatric Dehydration Alert",
        message: "Potential concern detected. Review required.",
        clinicalContext: "Lethargy, sunken fontanelles/eyes, and anuria in infants indicate severe dehydration.",
        recommendedAction: "Immediate parenteral or oral rehydration monitoring required.",
      });
    }

    return alerts;
  }
}

export const safetyService = SafetyService.getInstance();
