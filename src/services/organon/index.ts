export interface OrganonAphorism {
  aphorismNumber: number;
  title: string;
  topic: string;
  category: "FUNDAMENTALS" | "VITAL_FORCE" | "DISEASE_NATURE" | "DRUG_PROVING" | "CASE_TAKING" | "POSOLOGY_REPERTORY" | "CHRONIC_MIASMS";
  originalText: string;
  referenceEdition: string;
  studentNotes: {
    simplifiedExplanation: string;
    keyPoints: string[];
    visualFlowchart: {
      concept: string;
      meaning: string;
      application: string;
      example: string;
    };
    aiapgetExamPointers: string[];
    clinicalConnection: string;
  };
}

export class OrganonService {
  private static instance: OrganonService;

  public static readonly APHORISMS: OrganonAphorism[] = [
    {
      aphorismNumber: 1,
      title: "The Physician's Highest and Only Mission",
      topic: "Mission of Physician",
      category: "FUNDAMENTALS",
      originalText:
        "The physician's high and only mission is to restore the sick to health, to cure, as it is termed.",
      referenceEdition: "Organon of Medicine (6th Edition), §1, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "The physician's true role is the cure of sickness, not constructing speculative theoretical philosophical systems without healing the sick.",
        keyPoints: [
          "Focus must remain on healing the actual diseased individual.",
          "Hahnemann contrasts 'true cure' against empty theoretical disputations in the footnote.",
          "Cure means restoring dynamic equilibrium, not merely suppressing isolated symptoms.",
        ],
        visualFlowchart: {
          concept: "Mission of Cure (§1)",
          meaning: "Direct restoration of vital health in the living individual.",
          application: "Focus clinical work on holistic individualization rather than speculative medical theories.",
          example: "Administering the constitutional similimum rather than chemical suppression of a single eruption.",
        },
        aiapgetExamPointers: [
          "Footnote to §1 criticizes physicians who construct theoretical medical systems while neglecting practical cure.",
          "Frequently asked in AIAPGET: What is the highest mission according to §1? ('To restore the sick to health, to cure').",
        ],
        clinicalConnection:
          "Never lose sight of the patient's holistic well-being for academic debates; the litmus test of every prescription is real, gentle healing.",
      },
    },
    {
      aphorismNumber: 2,
      title: "The Highest Ideal of Cure",
      topic: "Ideal Cure & Cito, Tuto, Jucunde",
      category: "FUNDAMENTALS",
      originalText:
        "The highest ideal of cure is rapid, gentle and permanent restoration of the health, or removal and annihilation of the disease in its whole extent, in the shortest, most reliable, and most harmless way, on easily comprehensible principles.",
      referenceEdition: "Organon of Medicine (6th Edition), §2, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "A true cure must be rapid (cito), gentle (jucunde), permanent (tuto), reliable, harmless, and based on clear rational principles.",
        keyPoints: [
          "Three core criteria: Rapid (without unnecessary delay), Gentle (no severe toxic reactions), Permanent (no recurrence or palliative rebound).",
          "Must eradicate the disease in its entire totality.",
          "Principles must be rational, intelligible, and repeatable (Similia Similibus Curentur).",
        ],
        visualFlowchart: {
          concept: "Ideal of Cure (§2)",
          meaning: "Rapid, Gentle, Permanent restoration on comprehensible laws.",
          application: "Selecting minimal dynamic dose to cure without aggravating suffering.",
          example: "Curing acute otitis with Chamomilla in 2 hours gently without secondary digestive toxicity.",
        },
        aiapgetExamPointers: [
          "Asclepiades' Latin maxim: 'Cito, Tuto, et Jucunde' (Swiftly, Safely, and Pleasantly) underlies §2.",
          "Keywords: Rapid, Gentle, Permanent, Shortest, Most Harmless, Easily Comprehensible.",
        ],
        clinicalConnection:
          "If a treatment causes toxic side-effects or temporary relief with severe rebound, it violates §2.",
      },
    },
    {
      aphorismNumber: 3,
      title: "Knowledge Required of a True Practitioner of Healing",
      topic: "Prerequisites of the True Physician",
      category: "FUNDAMENTALS",
      originalText:
        "If the physician clearly perceives what is to be cured in diseases, that is to say, in every individual case of disease (knowledge of disease, indication)... if he clearly perceives what is curative in medicines... and if he knows how to adapt, according to clearly defined principles, what is curative in medicines to what is diseased in the patient... and finally, if he knows the obstacles to recovery... then he understands how to treat judiciously and rationally, and he is a true practitioner of the healing art.",
      referenceEdition: "Organon of Medicine (6th Edition), §3, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "To be a true master of healing, the doctor must master 4 pillars: Knowledge of Disease, Knowledge of Medicinal Powers, Knowledge of Choice of Remedy/Dose, and Knowledge of Obstacles to Cure.",
        keyPoints: [
          "1. Knowledge of Disease: Individual case perceiving totality.",
          "2. Knowledge of Medicines: Exact pathogeneses from provings.",
          "3. Knowledge of Application: Choosing correct similimum, potency, dose, repetition.",
          "4. Knowledge of Obstacles: Removing hygiene, diet, or emotional impediments.",
        ],
        visualFlowchart: {
          concept: "4 Pillars of the True Physician (§3)",
          meaning: "Disease Knowledge + Drug Knowledge + Similimum Application + Obstacle Removal.",
          application: "Complete anamnesis followed by RAG repertorization and removing dietary antidotes.",
          example: "Identifying a patient's grief, matching Ignatia, stopping excessive coffee intake to eliminate obstacles.",
        },
        aiapgetExamPointers: [
          "Termed 'Judicious Practitioner' (Wahres Heilleben).",
          "4 distinct requirements frequently tested in Match-the-Following questions.",
        ],
        clinicalConnection:
          "A remedy will fail even if correctly chosen if maintaining causes and obstacles to cure (§3 & §4) are unaddressed.",
      },
    },
    {
      aphorismNumber: 9,
      title: "The Dynamic Vital Force in Health",
      topic: "Vital Force / Dynamis",
      category: "VITAL_FORCE",
      originalText:
        "In the healthy condition of man, the spiritual vital force (autocracy), the dynamis that animates the material body (organism), rules with unbounded sway, and retains all the parts of the organism in admirable, harmonious, vital operation, as regards both sensations and functions, so that our indwelling, reason-gifted mind can freely employ this living, healthy instrument for the higher purposes of our existence.",
      referenceEdition: "Organon of Medicine (6th Edition), §9, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "The invisible dynamic life principle (Vital Force / Dynamis) maintains all sensations and functions in perfect harmony so humans can fulfill their spiritual purpose.",
        keyPoints: [
          "Vital force is spiritual, dynamic, autonomic ('autocracy').",
          "Maintains health without conscious effort.",
          "Material body cannot feel, act, or preserve itself without the Vital Force.",
          "Health is the harmonious instrument for the higher purpose of human existence.",
        ],
        visualFlowchart: {
          concept: "Vital Force in Health (§9)",
          meaning: "Spiritual, immaterial dynamis governing harmonious biological functions.",
          application: "Understanding that pathology begins dynamically before structural tissue damage occurs.",
          example: "Normal thermoregulation, digestion, and emotional balance functioning in spontaneous equilibrium.",
        },
        aiapgetExamPointers: [
          "6th Edition introduced 'Dynamis' and 'Vital Principle' alongside 'Vital Force'.",
          "Purpose of health: 'Reason-gifted mind can freely employ this living instrument for higher purposes of existence'.",
        ],
        clinicalConnection:
          "Homeopaths treat the deranged dynamic life force, not local organs in isolation.",
      },
    },
    {
      aphorismNumber: 26,
      title: "The Therapeutic Law of Nature (Similia Similibus Curentur)",
      topic: "Law of Similars / Homeopathic Law of Nature",
      category: "FUNDAMENTALS",
      originalText:
        "A weaker dynamic affection is permanently extinguished in the living organism by a stronger one, if the latter (whilst differing in kind) is very similar to the former in its manifestations.",
      referenceEdition: "Organon of Medicine (6th Edition), §26, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "The universal therapeutic law of nature: A natural disease is extinguished by an artificial medicinal disease that is stronger and strikingly similar in symptoms.",
        keyPoints: [
          "Core foundation of all homeopathic healing.",
          "Natural disease is dynamic and weaker; potentized homeopathic remedy produces a stronger, similar artificial dynamic state.",
          "When the similar artificial disease takes over, the natural disease vanishes, and the short-acting remedy subsides, leaving health.",
        ],
        visualFlowchart: {
          concept: "Therapeutic Law of Nature (§26)",
          meaning: "Stronger similar dynamic affection permanently extinguishes the weaker affection.",
          application: "Matching patient totality to the proving totality of the single potentized remedy.",
          example: "Administering potentized Belladonna to extinguish similar scarlet fever sore throat and delirium.",
        },
        aiapgetExamPointers: [
          "Exact phrasing: 'A weaker dynamic affection is permanently extinguished in the living organism by a stronger one...'.",
          "Tested in nearly every AIAPGET and PSC entrance exam.",
        ],
        clinicalConnection:
          "The law of similars is not a human invention but an immutable dynamic law observed across nature.",
      },
    },
    {
      aphorismNumber: 153,
      title: "Characteristic, Strange, Rare, and Peculiar Symptoms",
      topic: "Characteristic vs Common Symptoms",
      category: "CASE_TAKING",
      originalText:
        "In this search for a homoeopathic specific remedy... the more striking, singular, uncommon and peculiar (characteristic) signs and symptoms of the case of disease are chiefly and most solely to be kept in view; for it is more particularly these that very similar ones in the list of symptoms of the selected medicine must correspond to... The more general and undefined symptoms: loss of appetite, headache, debility, restless sleep, discomfort, and so forth, demand but little attention...",
      referenceEdition: "Organon of Medicine (6th Edition), §153, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "When repertorizing and choosing a remedy, focus primarily on Strange, Rare, Peculiar (SRP) and Characteristic symptoms, not common non-specific symptoms.",
        keyPoints: [
          "Characteristic / SRP symptoms individualize both the patient and the remedy.",
          "Common symptoms (fever, headache, loss of appetite, weakness) belong to many remedies and offer low prescribing value.",
          "Uncommon modalities (e.g. headache better cold bathing, cough better eating) guide precision prescribing.",
        ],
        visualFlowchart: {
          concept: "Characteristic Totality (§153)",
          meaning: "Prioritizing Strange, Rare, Peculiar (SRP) symptoms over generic common pathology.",
          application: "Filtering Kent rubrics for distinctive modalities and mental keynotes.",
          example: "Thirst for ice-cold water in large gulps during high fever (Phosphorus) vs thirstlessness with dry mouth (Pulsatilla).",
        },
        aiapgetExamPointers: [
          "Crucial aphorism: §153 is the foundation of Kentian hierarchical symptom evaluation.",
          "Common symptoms vs Peculiar/Characteristic symptoms distinction.",
        ],
        clinicalConnection:
          "Do not repertorize 20 common symptoms; select the 4-6 most peculiar, characteristic symptoms.",
      },
    },
    {
      aphorismNumber: 270,
      title: "Preparation of 50-Millesimal (LM / Q) Potencies",
      topic: "LM / 50-Millesimal Potencies",
      category: "POSOLOGY_REPERTORY",
      originalText:
        "In order to best obtain this development of power... a small globule of the 30th centesimal potency is dissolved in 500 drops of water mixed with alcohol, and from this one drop is potentized with 100 drops of alcohol with 100 succussions... giving a ratio of 1:50,000.",
      referenceEdition: "Organon of Medicine (6th Edition), §270, Samuel Hahnemann",
      studentNotes: {
        simplifiedExplanation:
          "The detailed pharmacopeia method for creating 50-Millesimal (LM or Q) potencies with 1:50,000 dilution ratio and 100 succussions.",
        keyPoints: [
          "Introduced exclusively in the 6th Edition of Organon.",
          "Provides highest curative power with minimum risk of homeopathic aggravation.",
          "Medicinal liquid can be repeated frequently in modified water doses (succussing the bottle before each dose).",
        ],
        visualFlowchart: {
          concept: "50-Millesimal Scale (§270)",
          meaning: "1:50,000 dilution ratio prepared with succussion for gentle, rapid chronic treatment.",
          application: "Administering LM potencies in chronic diseases with repeated succussed doses.",
          example: "LM 0/1 to LM 0/6 given daily with succussion in chronic osteoarthritis.",
        },
        aiapgetExamPointers: [
          "Ratio of Centesimal is 1:100; Decimal is 1:10; 50-Millesimal is 1:50,000.",
          "Number of succussions in LM potency preparation: 100 succussions per stage.",
        ],
        clinicalConnection:
          "LM potencies prevent violent aggravations in hypersensitive, frail, or deeply pathological patients.",
      },
    },
  ];

  public static getInstance(): OrganonService {
    if (!OrganonService.instance) {
      OrganonService.instance = new OrganonService();
    }
    return OrganonService.instance;
  }

  public getAllAphorisms(): OrganonAphorism[] {
    return OrganonService.APHORISMS;
  }

  public searchAphorisms(query: string, categoryFilter?: string): OrganonAphorism[] {
    const q = query.trim().toLowerCase();

    return OrganonService.APHORISMS.filter((item) => {
      if (categoryFilter && categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;

      const matchesNum = item.aphorismNumber.toString() === q || `§${item.aphorismNumber}` === q || `aphorism ${item.aphorismNumber}` === q;
      if (matchesNum) return true;

      const searchableText = `${item.title} ${item.topic} ${item.originalText} ${item.studentNotes.simplifiedExplanation} ${item.studentNotes.keyPoints.join(" ")}`.toLowerCase();
      return searchableText.includes(q);
    });
  }

  public getAphorismByNumber(num: number): OrganonAphorism | undefined {
    return OrganonService.APHORISMS.find((a) => a.aphorismNumber === num);
  }
}

export const organonService = OrganonService.getInstance();
