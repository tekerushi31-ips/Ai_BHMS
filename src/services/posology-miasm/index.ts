export interface MiasmSymptomItem {
  id: string;
  name: string;
  category: "MIND" | "HEAD_EYES" | "GI_STOMACH" | "SKIN" | "GENERALITIES";
  miasmAffinity: {
    psora: number;
    sycosis: number;
    syphilis: number;
    tubercular: number;
  };
  explanation: string;
  classicReference: string;
}

export interface MiasmaticAnalysisOutput {
  totalSymptomsAnalyzed: number;
  distribution: {
    psora: number;       // percentage
    sycosis: number;     // percentage
    syphilis: number;    // percentage
    tubercular: number;  // percentage
  };
  predominantMiasm: string;
  secondaryMiasm: string;
  educationalSynthesis: string;
  miasmDetails: Array<{
    miasm: "Psora" | "Sycosis" | "Syphilis" | "Tubercular";
    percentage: number;
    characteristics: string[];
    typicalPathology: string;
    leadingRemedies: string[];
  }>;
  disclaimer: string;
}

export interface PotencyEducationalGuide {
  potencyScale: string;
  name: string;
  susceptibilityLevel: string;
  pathologicalDepth: string;
  repetitionRules: string;
  kentObservationLink: string;
  educationalConsiderations: string[];
  referenceSource: string;
  safetyCaution: string;
}

export class PosologyMiasmService {
  private static instance: PosologyMiasmService;

  public static readonly SYMPTOM_DATABASE: MiasmSymptomItem[] = [
    {
      id: "sym-1",
      name: "Anxiety with restless dread of future, anticipatory nervousness",
      category: "MIND",
      miasmAffinity: { psora: 75, sycosis: 15, syphilis: 5, tubercular: 5 },
      explanation: "Functional mental hyperactivity and functional anxiety are primary hallmarks of Psora.",
      classicReference: "J.H. Allen, The Chronic Miasms, Vol 1 (Psora), p. 32",
    },
    {
      id: "sym-2",
      name: "Fixed ideas, suspicion, jealousy, secretiveness, guilt feelings",
      category: "MIND",
      miasmAffinity: { psora: 10, sycosis: 70, syphilis: 10, tubercular: 10 },
      explanation: "Incoordination, fixed obsessions, behavioral concealment belong predominantly to Sycosis.",
      classicReference: "H.A. Roberts, The Principles and Art of Cure, p. 210",
    },
    {
      id: "sym-3",
      name: "Destructive impulses, despair of recovery, nocturnal suicidal brooding",
      category: "MIND",
      miasmAffinity: { psora: 10, sycosis: 10, syphilis: 70, tubercular: 10 },
      explanation: "Destructiveness of mind and deep hopeless gloom are characteristic of Syphilitic stigma.",
      classicReference: "J.T. Kent, Lectures on Homoeopathic Philosophy, p. 195",
    },
    {
      id: "sym-4",
      name: "Restless desire to travel, dissatisfaction with surroundings, romantic longing",
      category: "MIND",
      miasmAffinity: { psora: 15, sycosis: 10, syphilis: 10, tubercular: 65 },
      explanation: "Cosmopolitan yearning and erratic changeability characterize the Tubercular / Pseudo-psora diathesis.",
      classicReference: "P. Sankaran, The Elements of Homoeopathy, Vol 2",
    },
    {
      id: "sym-5",
      name: "Voluptuous skin itching, dry scaly eruptions, burning after scratching",
      category: "SKIN",
      miasmAffinity: { psora: 80, sycosis: 5, syphilis: 5, tubercular: 10 },
      explanation: "Functional irritation of skin with pruritus and absence of structural ulceration is pure Psora.",
      classicReference: "Samuel Hahnemann, Chronic Diseases, Part 1, p. 48",
    },
    {
      id: "sym-6",
      name: "Warts, cauliflower condylomata, fleshy polypi, greasy skin with dark maculae",
      category: "SKIN",
      miasmAffinity: { psora: 5, sycosis: 85, syphilis: 5, tubercular: 5 },
      explanation: "Hypertrophy, benign overgrowth, and tissue accumulation are the physiological markers of Sycosis.",
      classicReference: "J.H. Allen, The Chronic Miasms, Vol 2 (Sycosis), p. 64",
    },
    {
      id: "sym-7",
      name: "Deep, punched-out painless ulcers, destruction of osseous tissue, copper-colored spots",
      category: "SKIN",
      miasmAffinity: { psora: 5, sycosis: 5, syphilis: 85, tubercular: 5 },
      explanation: "Cellular necrosis, ulceration, and bone caries represent active Syphilitic tissue breakdown.",
      classicReference: "H.A. Roberts, The Principles and Art of Cure, p. 235",
    },
    {
      id: "sym-8",
      name: "Recurrent colds, easy perspiration on slight exertion, rapid emaciation despite ravenous appetite",
      category: "GENERALITIES",
      miasmAffinity: { psora: 15, sycosis: 5, syphilis: 10, tubercular: 70 },
      explanation: "Lethal combustion of vitality with vulnerability of the respiratory system characterizes the Tubercular state.",
      classicReference: "E.B. Nash, Leaders in Homoeopathic Therapeutics, p. 312",
    },
    {
      id: "sym-9",
      name: "Marked nocturnal aggravation (sunset to sunrise), bone pains worse night",
      category: "GENERALITIES",
      miasmAffinity: { psora: 10, sycosis: 10, syphilis: 75, tubercular: 5 },
      explanation: "Nocturnal periodicity and aggravation when the sun is absent are hallmarks of Syphilis.",
      classicReference: "J.T. Kent, Lectures on Homoeopathic Philosophy",
    },
    {
      id: "sym-10",
      name: "Aggravation in damp cold weather, relief from discharge (catarrh, menses, perspiration)",
      category: "GENERALITIES",
      miasmAffinity: { psora: 15, sycosis: 70, syphilis: 5, tubercular: 10 },
      explanation: "Barometric sensitivity to dampness and relief when stored discharges flow are classic Sycotic modalities.",
      classicReference: "J.H. Allen, The Chronic Miasms, Vol 2",
    },
  ];

  public static readonly POTENCY_GUIDELINES: PotencyEducationalGuide[] = [
    {
      potencyScale: "30C",
      name: "30th Centesimal (Medium-Low Dynamic)",
      susceptibilityLevel: "Moderate to Low, Elderly, Infantile, Pathological Changes Present",
      pathologicalDepth: "Functional disturbance, subacute states, organic alterations where high potencies might cause dangerous aggravation.",
      repetitionRules: "Can be repeated every few hours in acute states or once to twice weekly in chronic conditions.",
      kentObservationLink: "Kent's 3rd & 4th Observations: Aggravation is quick, short, and followed by rapid improvement.",
      educationalConsiderations: [
        "Safe introductory potency for sensitive patients.",
        "Actively engages vital reaction without overwhelming depleted reserves.",
        "Commonly taught for first clinical trial when pathological state is uncertain.",
      ],
      referenceSource: "J.T. Kent, Lectures on Homoeopathic Philosophy, Lecture XXXIV",
      safetyCaution: "Educational reference only. Prescription requires registered homoeopathic practitioner review.",
    },
    {
      potencyScale: "200C",
      name: "200th Centesimal (Medium-High Dynamic)",
      susceptibilityLevel: "High Susceptibility, Clear Mental Generals, Youth, Intellectuals",
      pathologicalDepth: "Deep dynamic chronic diseases, clear characteristic mental & physical totality without gross irreversible organic pathology.",
      repetitionRules: "Administered as a single dose; allow to act undisturbed for weeks until symptoms clearly relapse.",
      kentObservationLink: "Kent's 1st & 2nd Observations: Long, deep action with possible prolonged curative aggravation.",
      educationalConsiderations: [
        "Gold standard constitutional potency for clear similimum pictures.",
        "Never repeat while improvement continues.",
        "Requires watchful waiting and careful follow-up analysis.",
      ],
      referenceSource: "Boericke & Tafel, Principles of Homoeopathic Posology",
      safetyCaution: "Educational reference only. Prescription requires registered homoeopathic practitioner review.",
    },
    {
      potencyScale: "1M",
      name: "1,000th Centesimal (High Dynamic)",
      susceptibilityLevel: "Very High Vitality, Unclouded Mental Keynotes, Young Patients",
      pathologicalDepth: "Primary dynamic constitutional derangement, severe acute mental shock, pure functional neuralgias.",
      repetitionRules: "Single infrequent dose; wait months if necessary.",
      kentObservationLink: "Kent's 11th Observation: When remedy cures without any aggravation, prognosis is exceptionally favorable.",
      educationalConsiderations: [
        "Should only be selected when totality matches with utmost precision.",
        "Contraindicated in advanced organic destruction (e.g. cavitary tuberculosis, end-stage organ failure) due to danger of fatal exhaustion.",
      ],
      referenceSource: "Stuart Close, The Genius of Homoeopathy, Chapter XII (Posology)",
      safetyCaution: "Educational reference only. Prescription requires registered homoeopathic practitioner review.",
    },
    {
      potencyScale: "LM",
      name: "50-Millesimal Scale (LM 0/1 to LM 0/30)",
      susceptibilityLevel: "Universal: Highly sensitive patients, hypersensitive constitutions, chronic pathology",
      pathologicalDepth: "Deep chronic diseases of long standing, chronic miasmatic dyscrasias.",
      repetitionRules: "Dissolved in water, succussed before each dose, administered daily or on alternate days without fear of violent aggravations.",
      kentObservationLink: "Organon 6th Edition §270-§282: Continuous gentle healing action with minimal aggravation.",
      educationalConsiderations: [
        "Hahnemann's ultimate perfected posology method introduced in the 6th Edition.",
        "Allows frequent repetition and dynamic micro-adjustments via succussion.",
      ],
      referenceSource: "Samuel Hahnemann, Organon of Medicine 6th Ed., §270-282",
      safetyCaution: "Educational reference only. Prescription requires registered homoeopathic practitioner review.",
    },
    {
      potencyScale: "Q / Mother Tincture",
      name: "Mother Tincture & Low Decimal (Q, 1X, 3X, 6X)",
      susceptibilityLevel: "Low Vitality, Advanced Pathology, Physiological Drainage Needed",
      pathologicalDepth: "Organ support, drainage, palliative physiological action, biochemic tissue salt replenishment.",
      repetitionRules: "Administered multiple times daily in drops with water.",
      kentObservationLink: "Material physiological action supporting excretory pathways (liver, kidneys, skin).",
      educationalConsiderations: [
        "Used for clinical organopathic drainage (e.g. Berberis Vulgaris Q for renal calculi, Crataegus Q for cardiac tone).",
      ],
      referenceSource: "J.C. Burnett, Diseases of the Spleen and Organopathy",
      safetyCaution: "Educational reference only. Prescription requires registered homoeopathic practitioner review.",
    },
  ];

  public static getInstance(): PosologyMiasmService {
    if (!PosologyMiasmService.instance) {
      PosologyMiasmService.instance = new PosologyMiasmService();
    }
    return PosologyMiasmService.instance;
  }

  public getAllSymptoms(): MiasmSymptomItem[] {
    return PosologyMiasmService.SYMPTOM_DATABASE;
  }

  public getPotencyGuidelines(): PotencyEducationalGuide[] {
    return PosologyMiasmService.POTENCY_GUIDELINES;
  }

  public analyzeMiasmaticTotality(selectedSymptomIds: string[]): MiasmaticAnalysisOutput {
    const selected = PosologyMiasmService.SYMPTOM_DATABASE.filter((s) =>
      selectedSymptomIds.includes(s.id)
    );

    if (selected.length === 0) {
      return {
        totalSymptomsAnalyzed: 0,
        distribution: { psora: 25, sycosis: 25, syphilis: 25, tubercular: 25 },
        predominantMiasm: "Undetermined",
        secondaryMiasm: "Undetermined",
        educationalSynthesis: "Please select one or more case symptoms to compute the educational miasmatic distribution.",
        miasmDetails: [],
        disclaimer: "Educational miasmatic analysis — for study/review only.",
      };
    }

    let totalPsora = 0;
    let totalSycosis = 0;
    let totalSyphilis = 0;
    let totalTubercular = 0;

    for (const item of selected) {
      totalPsora += item.miasmAffinity.psora;
      totalSycosis += item.miasmAffinity.sycosis;
      totalSyphilis += item.miasmAffinity.syphilis;
      totalTubercular += item.miasmAffinity.tubercular;
    }

    const grandTotal = totalPsora + totalSycosis + totalSyphilis + totalTubercular;
    const psoraPct = Math.round((totalPsora / grandTotal) * 100);
    const sycosisPct = Math.round((totalSycosis / grandTotal) * 100);
    const syphilisPct = Math.round((totalSyphilis / grandTotal) * 100);
    const tubercularPct = Math.max(0, 100 - (psoraPct + sycosisPct + syphilisPct)); // ensure sums to 100

    const miasmScores = [
      { name: "Psora", score: psoraPct },
      { name: "Sycosis", score: sycosisPct },
      { name: "Syphilis", score: syphilisPct },
      { name: "Tubercular", score: tubercularPct },
    ].sort((a, b) => b.score - a.score);

    const predominant = miasmScores[0].name;
    const secondary = miasmScores[1].name;

    const miasmDetails: MiasmaticAnalysisOutput["miasmDetails"] = [
      {
        miasm: "Psora",
        percentage: psoraPct,
        characteristics: [
          "Functional nervous hypersensitivity and pruritus.",
          "Lack of structural destruction; physiological irritability.",
          "Burning sensations and hunger at 11 a.m.",
        ],
        typicalPathology: "Functional dyspepsia, pruritus, anxiety neurosis, eczema without deep ulceration.",
        leadingRemedies: ["Sulphur", "Psorinum", "Calcarea Carbonica", "Lycopodium"],
      },
      {
        miasm: "Sycosis",
        percentage: sycosisPct,
        characteristics: [
          "Hypertrophy, overgrowth, polypi, warts, and excrescences.",
          "Aggravation from cold damp weather; relief from continuous discharges.",
          "Fixed ideas, secretiveness, joint stiffness.",
        ],
        typicalPathology: "Fibroids, pelvic inflammatory disease, warts, asthma worse damp, gout.",
        leadingRemedies: ["Thuja Occidentalis", "Medorrhinum", "Natrum Sulphuricum", "Silicea"],
      },
      {
        miasm: "Syphilis",
        percentage: syphilisPct,
        characteristics: [
          "Destruction of tissues, ulceration, necrosis, and bone caries.",
          "Aggravation at night (sunset to sunrise).",
          "Despair, fixed deep melancholia.",
        ],
        typicalPathology: "Deep punched-out ulcers, periostitis, suicidal depression, arterial degeneration.",
        leadingRemedies: ["Mercurius Solubilis", "Syphilinum", "Aurum Metallicum", "Nitric Acid"],
      },
      {
        miasm: "Tubercular",
        percentage: tubercularPct,
        characteristics: [
          "Cosmopolitan restlessness, desire to travel, rapid emaciation.",
          "Vulnerability of respiratory tract, recurrent colds.",
          "Sudden fluctuations of temperature and vitality.",
        ],
        typicalPathology: "Bronchiectasis, recurrent bronchitis, chronic lymphadenopathy, ringworm.",
        leadingRemedies: ["Tuberculinum", "Bacillinum", "Phosphorus", "Drosera"],
      },
    ];

    const synthesis = `Based on the ${selected.length} entered symptom indications, the totality exhibits a primary ${predominant} (${miasmScores[0].score}%) foundation with secondary ${secondary} (${miasmScores[1].score}%) expressions. In classical homoeopathic strategy, addressing the predominant miasmatic obstacle with a deeply acting anti-miasmatic similimum is essential for permanent cure.`;

    return {
      totalSymptomsAnalyzed: selected.length,
      distribution: {
        psora: psoraPct,
        sycosis: sycosisPct,
        syphilis: syphilisPct,
        tubercular: tubercularPct,
      },
      predominantMiasm: predominant,
      secondaryMiasm: secondary,
      educationalSynthesis: synthesis,
      miasmDetails,
      disclaimer: "Educational miasmatic analysis — for study/review. Never replace independent qualified homeopathic medical practitioner authorization.",
    };
  }
}

export const posologyMiasmService = PosologyMiasmService.getInstance();
