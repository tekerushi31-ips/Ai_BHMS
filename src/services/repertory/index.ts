import { RepertoryMatch } from "@/types";

export interface RepertoryQueryRequest {
  symptomText: string;
  chapterFilter?: string; // MIND, HEAD, STOMACH, ABDOMEN, RESPIRATION, GENERALITIES, etc.
}

export interface RepertorizeRequest {
  selectedRubricIds: string[];
}

export interface RepertorizationRemedyScore {
  remedy: string;
  shortName: string;
  totalScore: number;
  rubricCoverageCount: number;
  rubricGrades: Record<string, number>; // rubricId -> grade (1, 2, 3)
}

export interface RepertorizationTableResult {
  rubrics: RepertoryMatch[];
  remedyScores: RepertorizationRemedyScore[];
  totalRubricsSelected: number;
}

export class RepertoryService {
  private static instance: RepertoryService;

  public static readonly CHAPTERS = [
    "ALL",
    "MIND",
    "VERTIGO",
    "HEAD",
    "EYE",
    "VISION",
    "EAR",
    "HEARING",
    "NOSE",
    "FACE",
    "MOUTH",
    "TEETH",
    "THROAT",
    "EXTERNAL THROAT",
    "STOMACH",
    "ABDOMEN",
    "RECTUM",
    "STOOL",
    "BLADDER",
    "KIDNEYS",
    "PROSTATE",
    "URETHRA",
    "URINE",
    "GENITALIA MALE",
    "GENITALIA FEMALE",
    "LARYNX AND TRACHEA",
    "RESPIRATION",
    "COUGH",
    "EXPECTORATION",
    "CHEST",
    "BACK",
    "EXTREMITIES",
    "SLEEP",
    "CHILL",
    "FEVER",
    "PERSPIRATION",
    "SKIN",
    "GENERALITIES",
  ];

  public static readonly KENT_RUBRIC_DATABASE: RepertoryMatch[] = [
    {
      id: "rubric-1",
      rubric: "MIND - ANXIETY - anticipation, from (stage fright, engagements, examinations)",
      chapter: "MIND",
      source: "Kent's Repertory, Section Mind, p. 6",
      explanation: "Apprehension, nervous diarrhea, tremors before appearing in public, taking tests, or prior to appointments.",
      confidenceScore: 0.95,
      relatedRemedies: [
        { name: "Gelsemium Sempervirens", grade: 3 },
        { name: "Argentum Nitricum", grade: 3 },
        { name: "Lycopodium Clavatum", grade: 2 },
        { name: "Medorrhinum", grade: 2 },
        { name: "Silicea Terra", grade: 1 },
      ],
    },
    {
      id: "rubric-2",
      rubric: "MIND - FEAR - death, of (predicts the time of death, acute anguish)",
      chapter: "MIND",
      source: "Kent's Repertory, Section Mind, p. 43",
      explanation: "Overwhelming dread of impending demise, restlessness, panic attacks, especially at night.",
      confidenceScore: 0.92,
      relatedRemedies: [
        { name: "Aconitum Napellus", grade: 3 },
        { name: "Arsenicum Album", grade: 3 },
        { name: "Phosphorus", grade: 2 },
        { name: "Platina", grade: 2 },
        { name: "Calcarea Carbonica", grade: 1 },
      ],
    },
    {
      id: "rubric-3",
      rubric: "HEAD - PAIN - morning, sun; with the (increases until noon, decreases towards evening)",
      chapter: "HEAD",
      source: "Kent's Repertory, Section Head, p. 142",
      explanation: "Sun headache starting with sunrise, reaching acme at midday, declining with sunset.",
      confidenceScore: 0.94,
      relatedRemedies: [
        { name: "Natrum Muriaticum", grade: 3 },
        { name: "Glonoinum", grade: 3 },
        { name: "Sanguinaria Canadensis", grade: 3 },
        { name: "Spigelia Anthelmia", grade: 3 },
        { name: "Belladonna", grade: 2 },
      ],
    },
    {
      id: "rubric-4",
      rubric: "HEAD - PAIN - pulsating, throbbing (congestive, red face, dilated pupils)",
      chapter: "HEAD",
      source: "Kent's Repertory, Section Head, p. 182",
      explanation: "Violent vascular hammering sensation in temporals and vertex, aggravated by light and noise.",
      confidenceScore: 0.91,
      relatedRemedies: [
        { name: "Belladonna", grade: 3 },
        { name: "Glonoinum", grade: 3 },
        { name: "Melilotus Alba", grade: 2 },
        { name: "China Officinalis", grade: 2 },
        { name: "Bryonia Alba", grade: 2 },
      ],
    },
    {
      id: "rubric-5",
      rubric: "STOMACH - PAIN - burning (relieved by warm drinks, aggravated midnight)",
      chapter: "STOMACH",
      source: "Kent's Repertory, Section Stomach, p. 518",
      explanation: "Intense epigastric pyrosis and caustic heat, thirst for small sips of water at short intervals.",
      confidenceScore: 0.89,
      relatedRemedies: [
        { name: "Arsenicum Album", grade: 3 },
        { name: "Phosphorus", grade: 3 },
        { name: "Nux Vomica", grade: 2 },
        { name: "Iris Versicolor", grade: 2 },
        { name: "Sulphur", grade: 2 },
      ],
    },
    {
      id: "rubric-6",
      rubric: "ABDOMEN - DISTENSION, fullness - eating - after, a few mouthfuls",
      chapter: "ABDOMEN",
      source: "Kent's Repertory, Section Abdomen, p. 544",
      explanation: "Immediate flatulent distension and sense of excessive repletion even after eating very small quantities.",
      confidenceScore: 0.93,
      relatedRemedies: [
        { name: "Lycopodium Clavatum", grade: 3 },
        { name: "Nux Moschata", grade: 2 },
        { name: "China Officinalis", grade: 2 },
        { name: "Carbo Vegetabilis", grade: 2 },
      ],
    },
    {
      id: "rubric-7",
      rubric: "RECTUM - DIARRHEA - anticipation, excitement, from",
      chapter: "RECTUM",
      source: "Kent's Repertory, Section Rectum, p. 611",
      explanation: "Emotional diarrhea triggered by stress, unexpected news, or preparing for an important event.",
      confidenceScore: 0.96,
      relatedRemedies: [
        { name: "Gelsemium Sempervirens", grade: 3 },
        { name: "Argentum Nitricum", grade: 3 },
        { name: "Thuja Occidentalis", grade: 1 },
        { name: "Opium", grade: 1 },
      ],
    },
    {
      id: "rubric-8",
      rubric: "GENERALITIES - MOTION - amel., continuous (worse on beginning motion, better continuing)",
      chapter: "GENERALITIES",
      source: "Kent's Repertory, Section Generalities, p. 1374",
      explanation: "Stiffness on first moving, gradually easing as movement continues; restlessness in bed.",
      confidenceScore: 0.92,
      relatedRemedies: [
        { name: "Rhus Toxicodendron", grade: 3 },
        { name: "Ruta Graveolens", grade: 2 },
        { name: "Conium Maculatum", grade: 2 },
        { name: "Rhododendron Chrysanthum", grade: 2 },
      ],
    },
    {
      id: "rubric-9",
      rubric: "GENERALITIES - WARMTH - agg. (hot patient, craves open cool air, worse in warm room)",
      chapter: "GENERALITIES",
      source: "Kent's Repertory, Section Generalities, p. 1412",
      explanation: "Thermal aggravation from external heat, warm clothes, closed rooms; thirstlessness.",
      confidenceScore: 0.90,
      relatedRemedies: [
        { name: "Pulsatilla Pratensis", grade: 3 },
        { name: "Sulphur", grade: 3 },
        { name: "Apis Mellifica", grade: 3 },
        { name: "Iodium", grade: 3 },
        { name: "Secale Cornutum", grade: 2 },
      ],
    },
    {
      id: "rubric-10",
      rubric: "CHEST - PAIN - stitching - respiration, deep; on (worse coughing, pressure amel.)",
      chapter: "CHEST",
      source: "Kent's Repertory, Section Chest, p. 832",
      explanation: "Sharp pleuritic stitching pain aggravated by least motion and inspiration, relieved by lying on painful side.",
      confidenceScore: 0.94,
      relatedRemedies: [
        { name: "Bryonia Alba", grade: 3 },
        { name: "Kali Carbonicum", grade: 3 },
        { name: "Squilla Maritima", grade: 2 },
        { name: "Ranunculus Bulbosus", grade: 2 },
        { name: "Aconitum Napellus", grade: 2 },
      ],
    },
    {
      id: "rubric-11",
      rubric: "STOMACH - NAUSEA - headache, during",
      chapter: "STOMACH",
      source: "Kent's Repertory, Section Stomach, p. 506",
      explanation: "Nausea, vomiting, and retching occurring simultaneously with violent cephalalgia or migraine.",
      confidenceScore: 0.91,
      relatedRemedies: [
        { name: "Ipecacuanha", grade: 3 },
        { name: "Sanguinaria Canadensis", grade: 3 },
        { name: "Iris Versicolor", grade: 3 },
        { name: "Nux Vomica", grade: 2 },
        { name: "Natrum Muriaticum", grade: 2 },
      ],
    },
    {
      id: "rubric-12",
      rubric: "RESPIRATION - ASTHMATIC - night - midnight, after (2 to 3 a.m.)",
      chapter: "RESPIRATION",
      source: "Kent's Repertory, Section Respiration, p. 765",
      explanation: "Nocturnal paroxysmal dyspnea forcing patient to sit upright with extreme restlessness and suffocation.",
      confidenceScore: 0.93,
      relatedRemedies: [
        { name: "Arsenicum Album", grade: 3 },
        { name: "Kali Carbonicum", grade: 3 },
        { name: "Sambucus Nigra", grade: 2 },
        { name: "Spongia Tosta", grade: 2 },
        { name: "Medorrhinum", grade: 2 },
      ],
    },
    {
      id: "rubric-13",
      rubric: "EXTREMITIES - PAIN - joints - gouty, tearing (agg. damp cold weather)",
      chapter: "EXTREMITIES",
      source: "Kent's Repertory, Section Extremities, p. 1012",
      explanation: "Tearing arthritic and nodosity pains in small joints aggravated during barometric drop or rainy seasons.",
      confidenceScore: 0.88,
      relatedRemedies: [
        { name: "Colchicum Autumnale", grade: 3 },
        { name: "Ledum Palustre", grade: 3 },
        { name: "Rhus Toxicodendron", grade: 3 },
        { name: "Benzoicum Acidum", grade: 3 },
        { name: "Causticum", grade: 2 },
      ],
    },
    {
      id: "rubric-14",
      rubric: "SKIN - ERUPTIONS - vesicular - itching, voluptuous (burning after scratching)",
      chapter: "SKIN",
      source: "Kent's Repertory, Section Skin, p. 1315",
      explanation: "Intolerable pruritus in folds and webs of fingers; scratching brings pleasure followed by intense burning.",
      confidenceScore: 0.95,
      relatedRemedies: [
        { name: "Sulphur", grade: 3 },
        { name: "Psorinum", grade: 3 },
        { name: "Mezereum", grade: 2 },
        { name: "Rhus Toxicodendron", grade: 2 },
        { name: "Graphites", grade: 2 },
      ],
    },
    {
      id: "rubric-15",
      rubric: "MIND - FASTIDIOUS (order, cleanliness, anxiety for trifles)",
      chapter: "MIND",
      source: "Kent's Repertory, Section Mind, p. 41",
      explanation: "Obsessive desire for neatness, precision, everything in its exact place; intolerance of disorder.",
      confidenceScore: 0.93,
      relatedRemedies: [
        { name: "Arsenicum Album", grade: 3 },
        { name: "Nux Vomica", grade: 3 },
        { name: "Graphites", grade: 2 },
        { name: "Anacardium Orientale", grade: 1 },
        { name: "Carcinosinum", grade: 2 },
      ],
    },
  ];

  public static getInstance(): RepertoryService {
    if (!RepertoryService.instance) {
      RepertoryService.instance = new RepertoryService();
    }
    return RepertoryService.instance;
  }

  public getAllRubrics(): RepertoryMatch[] {
    return RepertoryService.KENT_RUBRIC_DATABASE;
  }

  public searchRubrics(req: RepertoryQueryRequest): {
    matches: RepertoryMatch[];
    hasVerifiedMatch: boolean;
    message: string;
  } {
    const rawTokens = req.symptomText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (rawTokens.length === 0 && (!req.chapterFilter || req.chapterFilter === "ALL")) {
      return {
        matches: RepertoryService.KENT_RUBRIC_DATABASE,
        hasVerifiedMatch: true,
        message: `Showing all ${RepertoryService.KENT_RUBRIC_DATABASE.length} verified Kent rubrics.`,
      };
    }

    const filtered = RepertoryService.KENT_RUBRIC_DATABASE.filter((item) => {
      if (req.chapterFilter && req.chapterFilter !== "ALL") {
        if (item.chapter.toLowerCase() !== req.chapterFilter.toLowerCase()) {
          return false;
        }
      }
      if (rawTokens.length === 0) return true;

      const targetText = `${item.rubric} ${item.chapter} ${item.explanation} ${item.relatedRemedies.map((r) => r.name).join(" ")}`.toLowerCase();
      return rawTokens.some((token) => targetText.includes(token));
    }).map((item) => {
      if (rawTokens.length === 0) return item;
      const targetText = `${item.rubric} ${item.chapter} ${item.explanation}`.toLowerCase();
      let matchCount = 0;
      for (const token of rawTokens) {
        if (targetText.includes(token)) matchCount++;
      }
      const score = Math.min(0.98, (matchCount + 0.5) / (rawTokens.length + 0.8));
      return { ...item, confidenceScore: Math.round(score * 100) / 100 };
    });

    if (filtered.length === 0) {
      return {
        matches: [],
        hasVerifiedMatch: false,
        message: "No verified rubric found.",
      };
    }

    return {
      matches: filtered,
      hasVerifiedMatch: true,
      message: `Found ${filtered.length} verified rubric candidate(s).`,
    };
  }

  public repertorizeRubrics(selectedRubricIds: string[]): RepertorizationTableResult {
    const selectedRubrics = RepertoryService.KENT_RUBRIC_DATABASE.filter((r) =>
      selectedRubricIds.includes(r.id)
    );

    if (selectedRubrics.length === 0) {
      return {
        rubrics: [],
        remedyScores: [],
        totalRubricsSelected: 0,
      };
    }

    // Aggregate scores per remedy
    const remedyMap = new Map<
      string,
      {
        remedy: string;
        shortName: string;
        totalScore: number;
        rubricCoverageCount: number;
        rubricGrades: Record<string, number>;
      }
    >();

    for (const rubric of selectedRubrics) {
      for (const rem of rubric.relatedRemedies) {
        const key = rem.name;
        if (!remedyMap.has(key)) {
          const shortName = key.split(" ")[0] || key;
          remedyMap.set(key, {
            remedy: key,
            shortName,
            totalScore: 0,
            rubricCoverageCount: 0,
            rubricGrades: {},
          });
        }

        const entry = remedyMap.get(key)!;
        entry.rubricGrades[rubric.id] = rem.grade;
        entry.totalScore += rem.grade;
        entry.rubricCoverageCount += 1;
      }
    }

    // Sort by rubric coverage count descending, then total score descending
    const sortedScores = Array.from(remedyMap.values()).sort((a, b) => {
      if (b.rubricCoverageCount !== a.rubricCoverageCount) {
        return b.rubricCoverageCount - a.rubricCoverageCount;
      }
      return b.totalScore - a.totalScore;
    });

    return {
      rubrics: selectedRubrics,
      remedyScores: sortedScores,
      totalRubricsSelected: selectedRubrics.length,
    };
  }
}

export const repertoryService = RepertoryService.getInstance();
