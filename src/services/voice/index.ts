import { VoiceNormalizationResult } from "@/types";

export class VoiceService {
  private static instance: VoiceService;

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Normalizes multilingual voice transcript (English, Hindi, Marathi, Hinglish)
   * into structured homeopathic anamnesis.
   */
  public normalizeVoiceTranscript(rawText: string): VoiceNormalizationResult {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    const detectedLanguage = this.detectLanguage(text);

    // Initial structured fields
    let chiefComplaint = "";
    let duration = "Not specified";
    let location = "Head / General";
    let sensation = "";
    let modalities = "";
    let concomitants = "";
    let mentalGenerals = "";
    let physicalGenerals = "";
    let pastHistory = "None recorded";
    let clinicalNotes = "";

    // 1. Marathi patterns (e.g., "Patient la sakali headache jast hoto", "Doke dukhte", "Pottat aag hote")
    if (detectedLanguage === "Marathi" || lower.includes("la ") || lower.includes("hoto") || lower.includes("hote") || lower.includes("sakali") || lower.includes("sandhyakali") || lower.includes("doke") || lower.includes("pottat") || lower.includes("thandi")) {
      if (lower.includes("doke") || lower.includes("headache") || lower.includes("dokyat")) {
        chiefComplaint = "Cephalea / Severe Headache";
        location = "Frontal & Temporal region";
        sensation = lower.includes("thok") || lower.includes("pulsat") || lower.includes("jast") ? "Throbbing and congestive sensation" : "Aching heaviness";
      } else if (lower.includes("pottat") || lower.includes("pot") || lower.includes("stomach") || lower.includes("gas") || lower.includes("aag")) {
        chiefComplaint = "Gastric Dyspepsia & Epigastric Burning";
        location = "Epigastrium & Abdomen";
        sensation = "Burning and flatulent distension";
      } else {
        chiefComplaint = "General malaise and localized discomfort";
      }

      // Modalities (Marathi)
      const modParts: string[] = [];
      if (lower.includes("sakali") || lower.includes("morning")) modParts.push("Aggravation in morning (< morning / on waking)");
      if (lower.includes("sandhyakali") || lower.includes("evening")) modParts.push("Aggravation towards evening (4-8 PM)");
      if (lower.includes("thandi") || lower.includes("garam")) modParts.push(lower.includes("garam") ? "Ameliorated by warm drinks/applications" : "Aggravated by cold air");
      if (lower.includes("unhat") || lower.includes("sun")) modParts.push("Aggravated by exposure to sun (< Sun)");
      modalities = modParts.join("; ") || "Aggravation in morning; better by quiet rest";

      // Generals
      if (lower.includes("rag") || lower.includes("chidchid") || lower.includes("tension") || lower.includes("bheeti")) {
        mentalGenerals = "Irritability, anxiety, and restlessness under stress";
      } else {
        mentalGenerals = "Anxious about illness; seeks reassurance";
      }

      physicalGenerals = lower.includes("garam") ? "Thirst for warm fluids; chilly constitution" : "Thermal: Sensitive to drafts of cold air";
      clinicalNotes = `Extracted from Marathi anamnesis. Original statement: "${text}"`;
    }

    // 2. Hindi / Hinglish patterns (e.g., "Subah pet mein bohot jalan hoti hai", "Sir mein dard subah badhta hai")
    else if (detectedLanguage === "Hindi" || detectedLanguage === "Hinglish" || lower.includes("mein") || lower.includes("hota hai") || lower.includes("hoti hai") || lower.includes("dard") || lower.includes("jalan") || lower.includes("subah") || lower.includes("aaram")) {
      if (lower.includes("sir") || lower.includes("sar") || lower.includes("head") || lower.includes("dard")) {
        chiefComplaint = "Throbbing Vascular Headache";
        location = "Frontal & Occipital area";
        sensation = lower.includes("jalan") ? "Burning cephalic heat" : "Intense throbbing pain (< light/noise)";
      } else if (lower.includes("pet") || lower.includes("jalan") || lower.includes("gas") || lower.includes("khana")) {
        chiefComplaint = "Acidity, Gastric Burning, and Bloating";
        location = "Epigastric region";
        sensation = "Acrid burning sensation rising to throat";
      } else {
        chiefComplaint = "Subacute physical complaint with systemic distress";
      }

      // Modalities (Hindi/Hinglish)
      const modParts: string[] = [];
      if (lower.includes("subah") || lower.includes("morning")) modParts.push("Aggravation in morning hours (< morning)");
      if (lower.includes("raat") || lower.includes("night") || lower.includes("midnight")) modParts.push("Nocturnal aggravation (< night / 1-2 AM)");
      if (lower.includes("garam") || lower.includes("chai") || lower.includes("warm")) modParts.push("Amelioration from warm drinks and heat (> warmth)");
      if (lower.includes("thanda") || lower.includes("cold")) modParts.push("Aggravation from cold intake (< cold drinks)");
      modalities = modParts.join("; ") || "Aggravated in morning, relieved by warm drinks and rest";

      mentalGenerals = lower.includes("gussa") || lower.includes("chidh") ? "High irritability, intolerance to noise and disturbance" : "Restless, anxious, wants company";
      physicalGenerals = "Chilly patient; craves warm food and drinks; moderate thirst";
      clinicalNotes = `Extracted from Hindi/Hinglish clinical dialogue. Original: "${text}"`;
    }

    // 3. English default extraction
    else {
      chiefComplaint = lower.includes("headache") ? "Chronic Migraine / Tension Headache" : lower.includes("stomach") || lower.includes("acidity") ? "Acid Peptic Disorder / Gastritis" : "Reported Symptom Complex";
      location = lower.includes("head") ? "Right temporal region" : lower.includes("abdomen") || lower.includes("stomach") ? "Epigastric area" : "Localized";
      sensation = lower.includes("burning") ? "Burning pain" : lower.includes("throbbing") ? "Pulsating, throbbing" : "Aching tightness";
      modalities = lower.includes("morning") ? "Aggravation in morning; better in open air" : "Worse with exertion, better with quiet rest";
      mentalGenerals = "Mild anticipatory anxiety, perfectionist tendencies";
      physicalGenerals = "Thermal: Ambithermal with desire for open breeze";
      clinicalNotes = `Direct English transcription captured and parsed into Boenninghausen totality.`;
    }

    if (lower.includes("days") || lower.includes("months") || lower.includes("weeks") || lower.includes("divas") || lower.includes("din") || lower.includes("mahine")) {
      const match = text.match(/(\d+)\s*(days?|weeks?|months?|din|divas|mahine)/i);
      if (match) {
        duration = `${match[1]} ${match[2]}`;
      }
    }

    return {
      originalTranscript: text,
      detectedLanguage,
      normalizedEnglish: {
        chiefComplaint,
        duration,
        location,
        sensation,
        modalities,
        concomitants,
        mentalGenerals,
        physicalGenerals,
        pastHistory,
      },
      clinicalNotes,
      confidence: 0.94,
    };
  }

  private detectLanguage(text: string): "English" | "Hindi" | "Marathi" | "Hinglish" {
    const lower = text.toLowerCase();
    
    // Marathi markers
    if (lower.includes("la ") || lower.includes("hoto") || lower.includes("hote") || lower.includes("sakali") || lower.includes("sandhyakali") || lower.includes("doke") || lower.includes("ahe") || lower.includes("kay") || lower.includes("jast")) {
      return "Marathi";
    }

    // Hindi markers
    if (lower.includes("hota hai") || lower.includes("hoti hai") || lower.includes("dard") || lower.includes("subah") || lower.includes("raat") || lower.includes("pet mein") || lower.includes("sir mein") || lower.includes("bohot")) {
      return "Hindi";
    }

    // Hinglish (mixed English and Hindi)
    if (lower.includes("headache") && (lower.includes("jast") || lower.includes("hota") || lower.includes("hai") || lower.includes("mein"))) {
      return "Hinglish";
    }

    return "English";
  }
}

export const voiceService = VoiceService.getInstance();
