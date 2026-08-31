export interface MysteryCaseDTO {
  id: string;
  caseNumber: number;
  title: string;
  weekLabel: string;
  chiefComplaint: string;
  patientProfile: {
    age: number;
    gender: string;
    occupation: string;
  };
  caseNarrative: {
    presentIllness: string;
    modalitiesAndSensations: string;
    generalsAndThermal: string;
    mentalCharacteristics: string;
    investigations: string;
  };
  symptomsList: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  actualRemedyHidden: string;
  actualRationale: string;
  activeUntil: string;
}

export class MysteryCaseService {
  private static instance: MysteryCaseService;

  public static readonly CASES: MysteryCaseDTO[] = [
    {
      id: "mystery-case-1",
      caseNumber: 1,
      title: "The Case of the Trembling Final Year Scholar",
      weekLabel: "Week 1 Challenge",
      chiefComplaint: "Acute anticipatory panic, nervous exhaustion, and painless watery diarrhea before clinical viva examinations.",
      patientProfile: {
        age: 23,
        gender: "Male",
        occupation: "Final Year Medical Student",
      },
      caseNarrative: {
        presentIllness:
          "Patient is a 23-year-old student preparing for upcoming final professional viva exams. Whenever he thinks of appearing before examiners or presenting a case, his hands tremble violently, his heart flutters with a heavy sensation, and he suffers from urgent, painless, involuntary loose stools driving him to the toilet multiple times.",
        modalitiesAndSensations:
          "Sensation as if the heart would stop beating unless he keeps in constant motion. Heaviness of the head with band-like constriction around occiput extending to forehead. Aggravation from exciting news, thinking of exams, and humid damp air. Amelioration after passing copious clear pale urine.",
        generalsAndThermal:
          "Complete thirstlessness even with dry mouth. Eyelids are so heavy he can barely keep them open during the day (drowsiness). Chilly patient who shivers without rigors.",
        mentalCharacteristics:
          "Extreme stage fright and cowardice before any engagement. Dullness, apathy, sluggish mental comprehension despite high intelligence.",
        investigations:
          "Routine complete blood counts and stool microscopy are completely normal; thyroid function tests normal.",
      },
      symptomsList: [
        "MIND - ANXIETY - anticipation, from (examinations, engagements)",
        "RECTUM - DIARRHEA - anticipation, excitement, from",
        "HEAD - PAIN - occipital - urination; after profuse - amel.",
        "EYE - HEAVINESS - lids; of (drowsiness)",
        "STOMACH - THIRSTLESSNESS",
        "GENERALITIES - WEAKNESS - trembling; with",
      ],
      difficulty: "INTERMEDIATE",
      actualRemedyHidden: "Gelsemium Sempervirens 200C",
      actualRationale:
        "The complete triad of Drowsiness, Dizziness, and Dullness, accompanied by motor paralysis, anticipatory diarrhea, ptosis of eyelids, thirstlessness, and relief of occipital cephalalgia after profuse urination constitutes the unmistakable constitutional totality of Gelsemium Sempervirens.",
      activeUntil: "2026-09-15T00:00:00.000Z",
    },
    {
      id: "mystery-case-2",
      caseNumber: 2,
      title: "The Case of Midnight Asthma and Midnight Thirst",
      weekLabel: "Week 2 Challenge",
      chiefComplaint: "Severe suffocative paroxysms of nocturnal dyspnea with burning epigastric pain and agonizing restlessness.",
      patientProfile: {
        age: 48,
        gender: "Female",
        occupation: "School Teacher",
      },
      caseNarrative: {
        presentIllness:
          "Patient presents with chronic bronchial asthma aggravated during late winter. Every night between 1:00 a.m. and 2:30 a.m., she awakens with violent chest constriction, gasping for air, unable to lie down, forcing her to sit bent forward at the edge of the bed.",
        modalitiesAndSensations:
          "Burning heat in chest and epigastrium like glowing coals, paradoxically relieved by sipping warm liquids and warm applications. Cannot bear cold drinks. Extreme restlessness; she gets out of bed and paces the room despite profound weakness and exhaustion.",
        generalsAndThermal:
          "Intensely chilly patient, wraps head in woolens even in warm weather. Thirst for water in tiny sips at frequent 5-minute intervals. Rapid emaciation.",
        mentalCharacteristics:
          "Overwhelming fear of death; believes her disease is incurable. Highly fastidious and anxious; distressed if picture frames on the wall are tilted or desk items displaced.",
        investigations:
          "Chest X-ray shows hyperinflated lung fields; IgE elevated; spirometry shows reversible airway obstruction.",
      },
      symptomsList: [
        "RESPIRATION - ASTHMATIC - night - midnight, after (1 to 2 a.m.)",
        "MIND - FEAR - death, of (hopelessness)",
        "MIND - FASTIDIOUS - order, cleanliness",
        "STOMACH - THIRST - small quantities, for - often",
        "GENERALITIES - HEAT - amel. (burning relieved by warmth)",
        "GENERALITIES - RESTLESSNESS - weakness; with",
      ],
      difficulty: "INTERMEDIATE",
      actualRemedyHidden: "Arsenicum Album 200C",
      actualRationale:
        "1 to 2 a.m. nocturnal aggravation, burning relieved by heat, thirst for frequent small sips, extreme prostration with pacing restlessness, fastidiousness, and fear of death reflect the pristine totality of Arsenicum Album.",
      activeUntil: "2026-09-22T00:00:00.000Z",
    },
  ];

  public static getInstance(): MysteryCaseService {
    if (!MysteryCaseService.instance) {
      MysteryCaseService.instance = new MysteryCaseService();
    }
    return MysteryCaseService.instance;
  }

  public getAllCases(): MysteryCaseDTO[] {
    return MysteryCaseService.CASES;
  }

  public getCaseById(id: string): MysteryCaseDTO | undefined {
    return MysteryCaseService.CASES.find((c) => c.id === id);
  }
}

export const mysteryCaseService = MysteryCaseService.getInstance();
