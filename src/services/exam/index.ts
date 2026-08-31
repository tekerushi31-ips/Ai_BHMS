export interface ExamQuestionDTO {
  id: string;
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "AIAPGET";
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
  referenceBook: string;
}

export interface UserExamResponse {
  questionId: string;
  selectedOption: string | null; // "A" | "B" | "C" | "D" | null
  isMarkedForReview: boolean;
}

export interface ExamEvaluationResult {
  totalQuestions: number;
  attemptedCount: number;
  unattemptedCount: number;
  correctCount: number;
  wrongCount: number;
  totalScore: number; // Correct * 4 - Wrong * 1
  maxPossibleScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  subjectBreakdown: Array<{
    subject: string;
    total: number;
    correct: number;
    wrong: number;
    unattempted: number;
    score: number;
    percentage: number;
    status: "STRONG" | "AVERAGE" | "NEEDS_IMPROVEMENT";
  }>;
  weakSubjects: string[];
  detailedQuestionResults: Array<{
    id: string;
    subject: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    userSelected: string | null;
    isCorrect: boolean;
    explanation: string;
    referenceBook: string;
  }>;
}

export class ExamService {
  private static instance: ExamService;

  public static readonly QUESTION_BANK: ExamQuestionDTO[] = [
    {
      id: "q-1",
      subject: "Materia Medica",
      topic: "Keynotes & Modalities",
      difficulty: "AIAPGET",
      question: "Which of the following remedies has the characteristic keynote: 'Headache begins in morning with the sun, reaches maximum at noon, and decreases towards sunset'?",
      optionA: "Belladonna",
      optionB: "Natrum Muriaticum",
      optionC: "Glonoinum",
      optionD: "Spigelia",
      correctOption: "B",
      explanation: "Natrum Muriaticum has severe sun headache starting with sunrise, reaching its acme at midday (10 a.m. - 3 p.m.) and declining with the setting sun. Glonoin and Spigelia also follow the sun but Natrum Mur is classic for schoolgirls with mapping tongue and salt craving.",
      referenceBook: "Allen's Keynotes, p. 210",
    },
    {
      id: "q-2",
      subject: "Materia Medica",
      topic: "Comparative Modalities",
      difficulty: "AIAPGET",
      question: "Restlessness with intense desire to move about constantly, but the first beginning of motion causes severe pain which eases upon continuous motion is characteristic of:",
      optionA: "Bryonia Alba",
      optionB: "Arsenicum Album",
      optionC: "Rhus Toxicodendron",
      optionD: "Ruta Graveolens",
      correctOption: "C",
      explanation: "Rhus Toxicodendron exhibits aggravation on first beginning motion and marked amelioration from continued gentle movement. Bryonia is aggravated by any motion; Arsenicum is restless from mental anxiety and exhaustion.",
      referenceBook: "Boericke's Materia Medica, p. 544",
    },
    {
      id: "q-3",
      subject: "Organon of Medicine",
      topic: "Aphorisms & Principles",
      difficulty: "AIAPGET",
      question: "According to §26 of the Organon of Medicine (6th Edition), the Therapeutic Law of Nature states that:",
      optionA: "Dissimilar diseases repel each other in the living organism.",
      optionB: "A weaker dynamic affection is permanently extinguished by a stronger one if the latter is very similar in its manifestations.",
      optionC: "Chronic diseases must be treated solely with anti-psoric remedies.",
      optionD: "The vital force always cures through secondary action.",
      correctOption: "B",
      explanation: "§26 lays down the fundamental law: 'A weaker dynamic affection is permanently extinguished in the living organism by a stronger one, if the latter (whilst differing in kind) is very similar to the former in its manifestations.'",
      referenceBook: "Organon of Medicine, §26, Samuel Hahnemann",
    },
    {
      id: "q-4",
      subject: "Organon of Medicine",
      topic: "Posology & Preparation",
      difficulty: "AIAPGET",
      question: "The 50-Millesimal (LM) potency scale introduced in the 6th Edition of Organon has a medicinal dilution ratio of:",
      optionA: "1 : 100",
      optionB: "1 : 10",
      optionC: "1 : 50,000",
      optionD: "1 : 1,000",
      correctOption: "C",
      explanation: "In §270 of the 6th edition, Hahnemann introduced the 50-Millesimal (LM/Q) scale with a mathematical dilution ratio of 1 to 50,000 (1:50,000) and 100 succussions at each potency stage.",
      referenceBook: "Organon of Medicine, §270, Samuel Hahnemann",
    },
    {
      id: "q-5",
      subject: "Repertory",
      topic: "Kent's Repertory Structure",
      difficulty: "AIAPGET",
      question: "How many chapters are present in Kent's Repertory of the Homoeopathic Materia Medica?",
      optionA: "37",
      optionB: "31",
      optionC: "42",
      optionD: "28",
      correctOption: "A",
      explanation: "Kent's Repertory contains exactly 37 chapters, starting with 'MIND' as the first chapter and ending with 'GENERALITIES' as the 37th chapter.",
      referenceBook: "Essentials of Repertorization, S.K. Tiwari",
    },
    {
      id: "q-6",
      subject: "Repertory",
      topic: "Gradation of Remedies",
      difficulty: "AIAPGET",
      question: "In Kent's Repertory, a remedy printed in 'Bold' typography represents which grade?",
      optionA: "Grade 1 (First Grade / 1 mark)",
      optionB: "Grade 2 (Second Grade / 2 marks)",
      optionC: "Grade 3 (Third Grade / 3 marks)",
      optionD: "Grade 4 (Highest Grade / 4 marks)",
      correctOption: "C",
      explanation: "In Kent's Repertory: BOLD = 3 marks (Third grade / highest prominence), ITALICS = 2 marks (Second grade), ROMAN = 1 mark (First grade). Note: Boenninghausen used a 4/5-grade system, but Kent has 3 grades.",
      referenceBook: "Kent's Repertory, Preface & Plan",
    },
    {
      id: "q-7",
      subject: "Homoeopathic Pharmacy",
      topic: "Pharmacopoeia & Vehicles",
      difficulty: "AIAPGET",
      question: "According to the Homoeopathic Pharmacopoeia of India (HPI), Class III of Old Hahnemannian methods is used for preparing mother tinctures from:",
      optionA: "Most juicy European plants (equal parts juice and alcohol).",
      optionB: "Medium juicy plants (three parts juice and two parts alcohol).",
      optionC: "Least juicy and dry plants (one part drug substance to two parts alcohol).",
      optionD: "Animal substances and venoms.",
      correctOption: "C",
      explanation: "Class I = Most juicy plants; Class II = Medium juicy plants; Class III = Least juicy plants requiring double quantity of alcohol; Class IV = Dry vegetable and animal substances.",
      referenceBook: "Homoeopathic Pharmacy, D.D. Banerjee",
    },
    {
      id: "q-8",
      subject: "Practice of Medicine",
      topic: "Clinical Therapeutics",
      difficulty: "AIAPGET",
      question: "A patient presents with acute right-sided lobar pneumonia, rust-colored tenacious sputum, intense pleuritic stitching pain aggravated by least motion, and extreme thirst for large draughts of cold water. The most indicated remedy is:",
      optionA: "Phosphorus",
      optionB: "Bryonia Alba",
      optionC: "Antimonium Tartaricum",
      optionD: "Aconitum Napellus",
      correctOption: "B",
      explanation: "Bryonia Alba is the sovereign remedy for fibrinous hepatization stage with right-sided lung involvement, stitching pain worse on any motion and better lying on the affected side, with intense thirst for large quantities.",
      referenceBook: "Boericke's Materia Medica, p. 115",
    },
    {
      id: "q-9",
      subject: "Pathology",
      topic: "Inflammation & Immunity",
      difficulty: "AIAPGET",
      question: "Aschoff bodies in the myocardium are pathognomonic histological lesions of:",
      optionA: "Infective Endocarditis",
      optionB: "Rheumatic Heart Disease",
      optionC: "Myocardial Infarction",
      optionD: "Tuberculous Pericarditis",
      correctOption: "B",
      explanation: "Aschoff bodies (nodules containing Anitschkow cells and multinucleated giant cells) are classical pathognomonic granulomatous lesions found in Rheumatic Carditis.",
      referenceBook: "Robbins & Cotran Pathologic Basis of Disease",
    },
    {
      id: "q-10",
      subject: "Obstetrics & Gynaecology",
      topic: "Clinical Homoeopathy in Obstetrics",
      difficulty: "AIAPGET",
      question: "Spasmodic, rigid, unyielding os uteri during labour with severe pains shooting in all directions and extreme exhaustion in a patient who previously suffered from severe dysmenorrhea indicates:",
      optionA: "Caulophyllum Thalictroides",
      optionB: "Secale Cornutum",
      optionC: "Pulsatilla Pratensis",
      optionD: "Cimicifuga Racemosa",
      correctOption: "A",
      explanation: "Caulophyllum produces intermittent, spasmodic, paroxysmal labour pains with rigidity of the os uteri; pains fly in all directions without progressive dilatation.",
      referenceBook: "Allen's Keynotes, p. 102",
    },
  ];

  public static getInstance(): ExamService {
    if (!ExamService.instance) {
      ExamService.instance = new ExamService();
    }
    return ExamService.instance;
  }

  public getQuestionsForExam(mode: string, subjectFilter?: string): ExamQuestionDTO[] {
    if (mode === "UNIVERSITY" && subjectFilter && subjectFilter !== "ALL") {
      const filtered = ExamService.QUESTION_BANK.filter(
        (q) => q.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
      return filtered.length > 0 ? filtered : ExamService.QUESTION_BANK;
    }
    return ExamService.QUESTION_BANK;
  }

  public evaluateExam(
    responses: UserExamResponse[],
    timeSpentSeconds: number
  ): ExamEvaluationResult {
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    const detailedQuestionResults = ExamService.QUESTION_BANK.map((q) => {
      const resp = responses.find((r) => r.questionId === q.id);
      const userSelected = resp?.selectedOption || null;

      let isCorrect = false;
      if (userSelected === null) {
        unattemptedCount++;
      } else if (userSelected === q.correctOption) {
        correctCount++;
        isCorrect = true;
      } else {
        wrongCount++;
      }

      return {
        id: q.id,
        subject: q.subject,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        userSelected,
        isCorrect,
        explanation: q.explanation,
        referenceBook: q.referenceBook,
      };
    });

    const totalQuestions = ExamService.QUESTION_BANK.length;
    // AIAPGET Scoring Model: +4 for Correct, -1 for Wrong, 0 for Unattempted
    const totalScore = correctCount * 4 - wrongCount * 1;
    const maxPossibleScore = totalQuestions * 4;
    const attemptedCount = correctCount + wrongCount;
    const accuracyPercentage =
      attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Group by Subject
    const subjectMap = new Map<
      string,
      { total: number; correct: number; wrong: number; unattempted: number }
    >();

    for (const res of detailedQuestionResults) {
      if (!subjectMap.has(res.subject)) {
        subjectMap.set(res.subject, { total: 0, correct: 0, wrong: 0, unattempted: 0 });
      }
      const s = subjectMap.get(res.subject)!;
      s.total++;
      if (res.userSelected === null) s.unattempted++;
      else if (res.isCorrect) s.correct++;
      else s.wrong++;
    }

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, counts]) => {
      const score = counts.correct * 4 - counts.wrong * 1;
      const pct = counts.total > 0 ? Math.round((counts.correct / counts.total) * 100) : 0;
      let status: "STRONG" | "AVERAGE" | "NEEDS_IMPROVEMENT" = "AVERAGE";
      if (pct >= 75) status = "STRONG";
      else if (pct < 60) status = "NEEDS_IMPROVEMENT";

      return {
        subject,
        total: counts.total,
        correct: counts.correct,
        wrong: counts.wrong,
        unattempted: counts.unattempted,
        score,
        percentage: pct,
        status,
      };
    });

    const weakSubjects = subjectBreakdown
      .filter((s) => s.percentage < 60 || s.status === "NEEDS_IMPROVEMENT")
      .map((s) => s.subject);

    return {
      totalQuestions,
      attemptedCount,
      unattemptedCount,
      correctCount,
      wrongCount,
      totalScore,
      maxPossibleScore,
      accuracyPercentage,
      timeSpentSeconds,
      subjectBreakdown,
      weakSubjects,
      detailedQuestionResults,
    };
  }
}

export const examService = ExamService.getInstance();
