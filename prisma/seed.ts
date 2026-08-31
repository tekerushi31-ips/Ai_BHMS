import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BHMS AI Database Seeding...");

  // Clean existing records in correct foreign-key order
  await prisma.auditLog.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.learningProgress.deleteMany({});
  await prisma.vivaAnswer.deleteMany({});
  await prisma.vivaSession.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.studentCase.deleteMany({});
  await prisma.virtualPatientSession.deleteMany({});
  await prisma.virtualPatientCase.deleteMany({});
  await prisma.aiMessage.deleteMany({});
  await prisma.aiConversation.deleteMany({});
  await prisma.knowledgeChunk.deleteMany({});
  await prisma.knowledgeDocument.deleteMany({});
  await prisma.caseNote.deleteMany({});
  await prisma.caseVisit.deleteMany({});
  await prisma.clinicalCase.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users & Profiles
  console.log("👤 Seeding Users & Profiles...");
  
  // Student 1: Aarav Sharma
  const student1 = await prisma.user.create({
    data: {
      email: "student1@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Aarav Sharma",
      role: "STUDENT",
      studentProfile: {
        create: {
          yearOfStudy: 4,
          college: "National Homoeopathic Medical College, Lucknow",
          targetExam: "AIAPGET 2025 & Final BHMS",
          streakDays: 7,
          totalStudyHours: 48.5,
        },
      },
    },
  });

  // Student 2: Pooja Deshmukh
  const student2 = await prisma.user.create({
    data: {
      email: "student2@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Pooja Deshmukh",
      role: "STUDENT",
      studentProfile: {
        create: {
          yearOfStudy: 3,
          college: "Dr. D.Y. Patil Homoeopathic Medical College, Pune",
          targetExam: "3rd BHMS University Exams",
          streakDays: 4,
          totalStudyHours: 28.0,
        },
      },
    },
  });

  // Student 3: Rohan Kulkarni
  const student3 = await prisma.user.create({
    data: {
      email: "student3@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Rohan Kulkarni",
      role: "STUDENT",
      studentProfile: {
        create: {
          yearOfStudy: 5,
          college: "Government Homoeopathic Medical College, Mumbai",
          targetExam: "Internship Case Studies & Clinical Practice",
          streakDays: 12,
          totalStudyHours: 85.0,
        },
      },
    },
  });

  // Doctor 1: Dr. Vikram Sharma
  const doctor1 = await prisma.user.create({
    data: {
      email: "dr.sharma@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Dr. Vikram Sharma",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          clinicName: "Aura Classical Homoeopathy Clinic, Pune",
          registrationNumber: "CCH-MH-2016-8492",
          specialization: "Chronic Diseases & Organon Methodology",
          yearsOfPractice: 9,
        },
      },
    },
  });

  // Doctor 2: Dr. Ananya Patil
  const doctor2 = await prisma.user.create({
    data: {
      email: "dr.patil@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Dr. Ananya Patil",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          clinicName: "Sanjeevani Homoeopathic Care, New Delhi",
          registrationNumber: "CCH-DL-2018-1934",
          specialization: "Pediatric & Dermatological Homoeopathy",
          yearsOfPractice: 6,
        },
      },
    },
  });

  // Admin
  await prisma.user.create({
    data: {
      email: "admin@bhms.ai",
      passwordHash: defaultPasswordHash,
      name: "Admin Officer",
      role: "ADMIN",
    },
  });

  // 2. Seed Fictional Patients & Clinical Cases for Doctor 1
  console.log("🏥 Seeding Fictional Patients & Case Sheets...");

  // Patient 1
  const p1 = await prisma.patient.create({
    data: {
      doctorId: doctor1.id,
      patientCode: "P-1001",
      name: "Rajesh Verma",
      age: 42,
      gender: "Male",
      contact: "+91 98231 44521",
      occupation: "Software Project Manager",
      address: "Kothrud, Pune, Maharashtra",
      medicalHistorySummary: "Chronic dyspepsia, acid reflux, flatulence with anxiety under work deadlines.",
    },
  });

  const case1 = await prisma.clinicalCase.create({
    data: {
      patientId: p1.id,
      doctorId: doctor1.id,
      chiefComplaint: "Severe epigastric fullness, acidity, and flatulent distension after meals.",
      location: "Epigastrium and lower abdomen",
      sensation: "Sense of painful fermentation and constriction",
      modalities: "Aggravation 4:00 PM to 8:00 PM; worse after eating even small quantities; ameliorated by warm tea and passing flatus.",
      concomitants: "Dry throat on waking, unrefreshing sleep",
      mentalGenerals: "Apprehensive about professional presentations yet performs brilliantly; irritable on waking; dictatorial at home.",
      physicalGenerals: "Chilly patient; desires warm food and drinks; strong craving for sweets and warm pastries.",
      pastHistory: "Recurrent tonsillitis in childhood treated with antibiotics.",
      familyHistory: "Father had hypertension; Mother has diabetes.",
      personalHistory: "Sedentary software professional, irregular meal timings.",
      investigations: "Upper GI Endoscopy (2024): Mild antral gastritis, H. pylori negative.",
      currentMedications: "Antacid OTC occasionally",
      rawNotes: "Patient presents with classical 4-8 PM aggravation, immediate repletion after few mouthfuls, craving for warm food.",
      rubricTags: "ABDOMEN - DISTENSION - eating; STOMACH - DESIRES - sweets; GENERALITIES - TIME - 4 to 8 p.m.",
      remedyConsidered: "Lycopodium Clavatum",
      potencyPrescribed: "Lycopodium 200C single dose",
      status: "ANALYZED",
    },
  });

  // Add 2 visits for Patient 1 to demonstrate Follow-up Engine
  await prisma.caseVisit.create({
    data: {
      patientId: p1.id,
      caseId: case1.id,
      doctorId: doctor1.id,
      visitNumber: 1,
      visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      symptomsSummary: "Initial presentation: Severe flatulence, 4-8 PM aggravation, acid reflux.",
      statusChange: "UNCHANGED",
      observations: "Prescribed Lycopodium 200C, 1 dose followed by SL for 3 weeks.",
      prescriptionNotes: "Lycopodium 200C (1 dose) on empty stomach, Sac Lac bd x 21 days.",
      nextFollowUpDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.caseVisit.create({
    data: {
      patientId: p1.id,
      caseId: case1.id,
      doctorId: doctor1.id,
      visitNumber: 2,
      visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      symptomsSummary: "70% relief in 4-8 PM bloating; appetite improved; reflux substantially diminished; general energy higher.",
      statusChange: "IMPROVED",
      observations: "Clear positive response conforming to Kent Observation #4. Do not repeat remedy.",
      prescriptionNotes: "Placebo (Sac Lac) pills twice daily for 4 weeks.",
      nextFollowUpDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  // Patient 2
  const p2 = await prisma.patient.create({
    data: {
      doctorId: doctor1.id,
      patientCode: "P-1002",
      name: "Sunita Patil",
      age: 36,
      gender: "Female",
      contact: "+91 94220 88123",
      occupation: "High School Teacher",
      address: "Aundh, Pune, Maharashtra",
      medicalHistorySummary: "Chronic migraine with throbbing frontal headache triggered by sun exposure.",
    },
  });

  await prisma.clinicalCase.create({
    data: {
      patientId: p2.id,
      doctorId: doctor1.id,
      chiefComplaint: "Pounding frontal headache with nausea, triggered by sun exposure and mental fatigue.",
      location: "Frontal, supra-orbital, and temporal regions",
      sensation: "Bursting, throbbing as if thousands of little hammers were knocking inside",
      modalities: "Aggravation: 10:00 AM to 3:00 PM; exposure to sun; bright light; noise. Amelioration: Lying in a dark room; cold wet compress.",
      concomitants: "Nausea, zigzag flashing lights before vision (scintillating scotoma).",
      mentalGenerals: "Reserved, introverted, dwelled on past unpleasant experiences, aggravated by consolation.",
      physicalGenerals: "Thermal: Intolerant of direct sun heat; great craving for extra salt on food; mapped tongue.",
      pastHistory: "Suffered deep grief after loss of parent 3 years ago.",
      familyHistory: "Maternal migraine history.",
      personalHistory: "Non-smoker, vegetarian.",
      rawNotes: "Classical Natrum Mur keynote presentation: Sun headache + salt craving + grief history + aggravation from consolation.",
      rubricTags: "HEAD - PAIN - sun, from; MIND - CONSOLATION - agg.; STOMACH - DESIRES - salt",
      remedyConsidered: "Natrum Muriaticum",
      potencyPrescribed: "Natrum Mur 1M 1 dose",
      status: "ANALYZED",
    },
  });

  // Patient 3
  const p3 = await prisma.patient.create({
    data: {
      doctorId: doctor1.id,
      patientCode: "P-1003",
      name: "Amit Kulkarni",
      age: 28,
      gender: "Male",
      contact: "+91 99701 33412",
      occupation: "Chartered Accountant",
      address: "Baner, Pune",
      medicalHistorySummary: "Allergic rhinitis and morning sneezing bouts.",
    },
  });

  await prisma.clinicalCase.create({
    data: {
      patientId: p3.id,
      doctorId: doctor1.id,
      chiefComplaint: "Paroxysmal sneezing on waking, acrid watery nasal discharge, burning eyes.",
      location: "Nose, eyes, frontal sinuses",
      sensation: "Burning, excoriating irritation in nostrils",
      modalities: "Aggravation: Early morning on putting feet out of bed, cold air, draft. Amelioration: Warm room, wrapping head.",
      concomitants: "Dry tickling cough in larynx",
      mentalGenerals: "Fastidious, neat, tidy, over-sensitive to noise and drafts, highly ambitious.",
      physicalGenerals: "Chilly patient; cannot tolerate drafts; desires hot spicy food and coffee.",
      status: "SAVED",
    },
  });

  // Patient 4 & 5 (for Doctor 2 to verify tenant isolation)
  const p4 = await prisma.patient.create({
    data: {
      doctorId: doctor2.id,
      patientCode: "P-2001",
      name: "Meera Joshi",
      age: 54,
      gender: "Female",
      contact: "+91 98100 55432",
      occupation: "Homemaker",
      address: "Vasant Kunj, New Delhi",
      medicalHistorySummary: "Bilateral knee osteoarthritis, morning stiffness, worse damp weather.",
    },
  });

  await prisma.clinicalCase.create({
    data: {
      patientId: p4.id,
      doctorId: doctor2.id,
      chiefComplaint: "Severe joint pain and stiffness in bilateral knees.",
      location: "Both knees and lumbar spine",
      sensation: "Stiff, bruised, tearing pain",
      modalities: "Aggravation: Beginning of motion, sitting long, damp cold weather. Amelioration: Continued gentle walking, dry warmth, hot fomentation.",
      concomitants: "Restlessness at night, tossing in bed to find a comfortable position",
      mentalGenerals: "Mild, gentle, weeps easily, anxious about health",
      physicalGenerals: "Chilly, desires warm dry climate",
      status: "ANALYZED",
    },
  });

  const p5 = await prisma.patient.create({
    data: {
      doctorId: doctor2.id,
      patientCode: "P-2002",
      name: "Deepak Rao",
      age: 19,
      gender: "Male",
      contact: "+91 98111 67234",
      occupation: "College Student",
      address: "Saket, New Delhi",
      medicalHistorySummary: "Anticipatory anxiety and nervous tremors before college viva.",
    },
  });

  // 3. Seed Verified Homoeopathic Knowledge Documents & Chunks
  console.log("📚 Seeding Verified Knowledge Base (Organon, Boericke, Kent)...");

  // Document 1: Organon of Medicine
  const organonDoc = await prisma.knowledgeDocument.create({
    data: {
      title: "Organon of Medicine",
      category: "ORGANON",
      author: "Dr. Samuel Hahnemann",
      sourceBook: "Organon of Medicine (6th Edition with commentary by Dr. B.K. Sarkar)",
      edition: "6th Edition",
      verificationStatus: "VERIFIED",
      createdBy: "Admin Homoeopathy Faculty",
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        documentId: organonDoc.id,
        chapterOrAphorism: "Aphorism §1 & §2",
        sectionTitle: "The Highest Ideal of Cure",
        content: "The physician's high and only mission is to restore the sick to health, to cure, as it is termed. The highest ideal of cure is rapid, gentle and permanent restoration of the health, or removal and annihilation of the disease in its whole extent, in the shortest, most reliable, and most harmless way, on easily comprehensible principles.",
        keywords: "mission, ideal of cure, rapid gentle permanent, principles",
        verifiedOnly: true,
      },
      {
        documentId: organonDoc.id,
        chapterOrAphorism: "Aphorism §9",
        sectionTitle: "The Spiritual Vital Force (Dynamis)",
        content: "In the healthy condition of man, the spiritual vital force (autocracy), the dynamis that animates the material body (organism), rules with unbounded sway, and retains all the parts of the organism in admirable, harmonious, vital operation, as regards both sensations and functions, so that our indwelling, reason-gifted mind can freely employ this living, healthy instrument for the higher purposes of our existence.",
        keywords: "vital force, dynamis, health, harmony, sensations, functions",
        verifiedOnly: true,
      },
      {
        documentId: organonDoc.id,
        chapterOrAphorism: "Aphorism §26",
        sectionTitle: "The Therapeutic Law of Nature",
        content: "A weaker dynamic affection is permanently extinguished in the living organism by a stronger one, if the latter (whilst differing in kind) is very similar to the former in its manifestations. (Similia Similibus Curentur).",
        keywords: "law of cure, similia similibus curentur, dynamic affection",
        verifiedOnly: true,
      },
      {
        documentId: organonDoc.id,
        chapterOrAphorism: "Aphorism §153",
        sectionTitle: "Characteristic vs Common Symptoms",
        content: "In this search for a homoeopathic specific remedy, the more striking, singular, uncommon and peculiar (characteristic) signs and symptoms of the case of disease are chiefly and almost solely to be kept in view; for it is more particularly these that very similar ones in the list of symptoms of the selected medicine must correspond to. The more general and undefined symptoms demand but little attention.",
        keywords: "characteristic symptoms, uncommon, peculiar, striking, totality, selection",
        verifiedOnly: true,
      },
      {
        documentId: organonDoc.id,
        chapterOrAphorism: "Aphorism §210 - §213",
        sectionTitle: "Mental Diseases & Disposition",
        content: "In all cases of disease which we are called upon to cure, the state of the disposition of the patient ought to be particularly noted along with the totality of symptoms, if we would trace an accurate picture of the disease in order to be able to treat it homoeopathically with success.",
        keywords: "mental diseases, disposition, state of mind, totality",
        verifiedOnly: true,
      },
    ],
  });

  // Document 2: Boericke's Materia Medica
  const boerickeDoc = await prisma.knowledgeDocument.create({
    data: {
      title: "Pocket Manual of Homoeopathic Materia Medica",
      category: "MATERIA_MEDICA",
      author: "Dr. William Boericke",
      sourceBook: "Pocket Manual of Homoeopathic Materia Medica and Repertory",
      edition: "9th Edition",
      verificationStatus: "VERIFIED",
      createdBy: "Admin Homoeopathy Faculty",
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Arsenicum Album",
        sectionTitle: "Arsenicum Album — Keynotes, Modalities, and Totality",
        content: "Keynotes: A profound prostration, rapid sinking of the vital forces, and intense restlessness. Burning pains relieved by heat. Great mental anguish and fear of death; believes it is useless to take medicine. Nocturnal periodicity (1 to 3 AM). Modalities: Worse after midnight, from cold, cold drinks, wet weather. Better by heat in general, warm drinks, head elevated.",
        keywords: "arsenicum album, burning, restlessness, fear of death, 1-3 AM, thirst for small sips, better heat",
        verifiedOnly: true,
      },
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Lycopodium Clavatum",
        sectionTitle: "Lycopodium Clavatum — Keynotes & Digestive Picture",
        content: "Keynotes: Direction of symptoms from Right to Left. Excessive flatulence and abdominal distension, feeling full immediately after a few mouthfuls. Modalities: Worse 4 to 8 PM, right side, cold drinks. Better from warm food and warm drinks, motion, passing flatus. Mind: Apprehensive, anticipatory anxiety, irritable on waking, dictatorial.",
        keywords: "lycopodium, 4-8 PM, right to left, flatulence, fullness, desires warm drinks, sweets",
        verifiedOnly: true,
      },
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Pulsatilla Pratensis",
        sectionTitle: "Pulsatilla Pratensis — Keynotes & Dispositions",
        content: "Keynotes: Mild, gentle, yielding disposition, weeps easily, seeks consolation and sympathy. Pains wander and shift rapidly. Extreme thirstlessness with all complaints. Modalities: Worse in a warm closed room, evening, rich fatty foods. Better in open fresh cool air, gentle motion, cold applications.",
        keywords: "pulsatilla, weeping disposition, thirstless, open air, wandering pains, worse rich food",
        verifiedOnly: true,
      },
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Natrum Muriaticum",
        sectionTitle: "Natrum Muriaticum — Keynotes & Chronic Cephalea",
        content: "Keynotes: Great emaciation losing flesh while eating well; unrefreshing sleep; mapped tongue. Headache from sunrise to sunset (sun headache), throbbing as if thousands of little hammers knocking in head. Mind: Depressed, introverted, dwells on past disagreeable events, consolation aggravates. Desires extra salt. Modalities: Worse 10-11 AM, sun heat, mental exertion. Better in open air, lying on right side, dark room.",
        keywords: "natrum mur, sun headache, salt craving, consolation agg, grief, mapped tongue",
        verifiedOnly: true,
      },
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Nux Vomica",
        sectionTitle: "Nux Vomica — Gastrointestinal & Mental Profile",
        content: "Keynotes: The great polychrest for sedentary, high-strung, irritable individuals who abuse stimulants (coffee, alcohol, spices). Ineffectual urging to stool. Extremely chilly, cannot uncover. Modalities: Worse early morning (3-4 AM), cold air, mental work, after eating. Better after an unbroken short nap, warmth, damp weather.",
        keywords: "nux vomica, ineffectual urging, irritable, chilly, sedentary, coffee, alcohol",
        verifiedOnly: true,
      },
      {
        documentId: boerickeDoc.id,
        chapterOrAphorism: "Gelsemium Sempervirens",
        sectionTitle: "Gelsemium Sempervirens — Paralytic Weakness & Anticipation",
        content: "Keynotes: Complete motor paralysis, deep drowsiness, dullness, dizziness, and trembling. Anticipatory nervous diarrhea and trembling before public appearances or examinations. Thirstless. Modalities: Worse from emotion, excitement, bad news, damp weather. Better from profuse urination, open air, continuous motion.",
        keywords: "gelsemium, anticipation, diarrhea, trembling, drowsiness, dullness, dizziness, profuse urination",
        verifiedOnly: true,
      },
    ],
  });

  // Document 3: Kent's Repertory
  const kentDoc = await prisma.knowledgeDocument.create({
    data: {
      title: "Repertory of the Homoeopathic Materia Medica",
      category: "REPERTORY",
      author: "Dr. James Tyler Kent",
      sourceBook: "Kent's Repertory of the Homoeopathic Materia Medica",
      edition: "6th American Edition",
      verificationStatus: "VERIFIED",
      createdBy: "Admin Homoeopathy Faculty",
    },
  });

  await prisma.knowledgeChunk.createMany({
    data: [
      {
        documentId: kentDoc.id,
        chapterOrAphorism: "Mind & Emotions",
        sectionTitle: "Kent Repertory Mind Rubrics & Grading",
        content: "MIND - ANXIETY - anticipation, from: Arg-n, GELS, Lyc, Med, Phos, Sil.\nMIND - CONSOLATION - agg.: NAT-M, Ign, Sep, Sil, Lil-t.\nMIND - FEAR - death, of: ACON, ARS, Calc, Nit-ac, Phos, Plat.\nMIND - RESTLESSNESS - night: ACON, ARS, Rhus-t, Cham, Merc.",
        keywords: "kent repertory, mind, anxiety, anticipation, fear of death, consolation, restlessness",
        verifiedOnly: true,
      },
      {
        documentId: kentDoc.id,
        chapterOrAphorism: "Generalities & Modalities",
        sectionTitle: "Kent Repertory Generalities & Thermal Modalities",
        content: "GENERALITIES - WARM - room - agg.: PULS, Apis, Iod, Kali-s, Sec, Sulph.\nGENERALITIES - MOTION - beginning of - agg.: RHUS-T, Con, Lyc, Ruta.\nGENERALITIES - MOTION - continued - amel.: RHUS-T, Con, Puls, Rhod.\nGENERALITIES - AIR - open - amel.: PULS, All-c, Kali-s, Sabin.",
        keywords: "generalities, modalities, motion, warm room, open air, cold air",
        verifiedOnly: true,
      },
    ],
  });

  // 4. Seed Quiz Questions across 8 Subjects
  console.log("📝 Seeding Quiz Question Bank (8 Subjects)...");

  const quizQuestions = [
    {
      subject: "Organon of Medicine & Philosophy",
      topic: "Cardinal Principles",
      difficulty: "MEDIUM",
      question: "Which aphorism in the 6th edition of the Organon of Medicine defines the highest ideal of cure as rapid, gentle, and permanent?",
      optionA: "Aphorism §1",
      optionB: "Aphorism §2",
      optionC: "Aphorism §9",
      optionD: "Aphorism §26",
      correctOption: "B",
      explanation: "Aphorism §2 states: 'The highest ideal of cure is rapid, gentle and permanent restoration of the health, or removal and annihilation of the disease in its whole extent... on easily comprehensible principles.'",
      referenceBook: "Organon of Medicine, Dr. Samuel Hahnemann",
    },
    {
      subject: "Organon of Medicine & Philosophy",
      topic: "Vital Force",
      difficulty: "EASY",
      question: "What term does Dr. Hahnemann use in Aphorism §9 to describe the spirit-like vital force animating the organism?",
      optionA: "Vis Medicatrix Naturae",
      optionB: "Dynamis / Autocracy",
      optionC: "Archeus",
      optionD: "Miasma",
      correctOption: "B",
      explanation: "In §9, Hahnemann defines the spiritual vital force as the 'dynamis' or 'autocracy' that animates the material body.",
      referenceBook: "Organon of Medicine, Aphorism §9",
    },
    {
      subject: "Organon of Medicine & Philosophy",
      topic: "Miasms",
      difficulty: "HARD",
      question: "According to Hahnemann's Chronic Diseases, which miasm is regarded as the mother of all true chronic non-venereal diseases?",
      optionA: "Sycosis",
      optionB: "Syphilis",
      optionC: "Psora",
      optionD: "Tubercular",
      correctOption: "C",
      explanation: "Hahnemann established that Psora is the fundamental, most ancient, and hydra-headed miasm underlying over 80% of all chronic diseases.",
      referenceBook: "The Chronic Diseases, Dr. Samuel Hahnemann",
    },
    {
      subject: "Materia Medica",
      topic: "Polychrest Remedies",
      difficulty: "EASY",
      question: "Which remedy is characterized by burning pains paradoxically relieved by hot applications and warm drinks?",
      optionA: "Sulphur",
      optionB: "Arsenicum Album",
      optionC: "Apis Mellifica",
      optionD: "Phosphorus",
      correctOption: "B",
      explanation: "Arsenicum Album has burning pains relieved by heat, whereas Sulphur and Apis have burning pains aggravated by heat.",
      referenceBook: "Boericke's Materia Medica",
    },
    {
      subject: "Materia Medica",
      topic: "Keynotes & Modalities",
      difficulty: "MEDIUM",
      question: "A patient complains of right-sided complaints travelling to the left, severe flatulence, and aggravation between 4 PM and 8 PM. Which is the leading simillimum?",
      optionA: "Lycopodium Clavatum",
      optionB: "Nux Vomica",
      optionC: "China Officinalis",
      optionD: "Carbo Vegetabilis",
      correctOption: "A",
      explanation: "Lycopodium Clavatum has the hallmark keynote triad: 4 to 8 PM aggravation, right-to-left directionality, and flatulent distension immediately after eating.",
      referenceBook: "Allen's Keynotes & Boericke",
    },
    {
      subject: "Materia Medica",
      topic: "Remedy Differentiation",
      difficulty: "HARD",
      question: "Which remedy exhibits severe anticipatory anxiety with trembling, drowsiness, and diarrhea before public speaking or exams?",
      optionA: "Argentum Nitricum",
      optionB: "Gelsemium Sempervirens",
      optionC: "Silicea",
      optionD: "Anacardium Orientale",
      correctOption: "B",
      explanation: "Gelsemium is characterized by the '4 D's': Drowsiness, Dullness, Dizziness, and Diarrhea/trembling from anticipation. Argentum Nitricum has anticipation with hurriedness and impetuousness.",
      referenceBook: "Nash's Leaders in Homoeopathic Therapeutics",
    },
    {
      subject: "Repertory & Case Taking",
      topic: "Kent's Repertory",
      difficulty: "MEDIUM",
      question: "In Kent's Repertory, what typography is used to designate a Grade 3 (3-mark) remedy in a rubric?",
      optionA: "Roman type",
      optionB: "Italics",
      optionC: "BOLD CAPITALS",
      optionD: "Underlined text",
      correctOption: "C",
      explanation: "Kent assigns 3 marks to remedies printed in BOLD CAPITALS, 2 marks to Italics, and 1 mark to plain Roman type.",
      referenceBook: "How to Use the Repertory, Dr. Glen Irving Bidwell",
    },
    {
      subject: "Repertory & Case Taking",
      topic: "Case Taking Principles",
      difficulty: "EASY",
      question: "According to Boenninghausen, which four components constitute a complete symptom?",
      optionA: "Onset, Course, Duration, Outcome",
      optionB: "Location, Sensation, Modality, Concomitant",
      optionC: "Mind, Body, Spirit, Environment",
      optionD: "General, Common, Pathological, Diagnostic",
      correctOption: "B",
      explanation: "Boenninghausen's Complete Symptom Doctrine requires: Location, Sensation, Modality (aggravation/amelioration), and Concomitant.",
      referenceBook: "Therapeutic Pocket Book, Dr. Boenninghausen",
    },
    {
      subject: "Homoeopathic Pharmacy",
      topic: "Scales of Potentization",
      difficulty: "MEDIUM",
      question: "The 50 Millesimal (LM) potency scale introduced in the 6th edition of Organon uses what dilution ratio?",
      optionA: "1 : 10",
      optionB: "1 : 100",
      optionC: "1 : 50,000",
      optionD: "1 : 10,000",
      correctOption: "C",
      explanation: "The LM (50 Millesimal) scale uses a dilution ratio of 1 in 50,000, preparing gentle, deeply acting potencies without severe primary aggravations.",
      referenceBook: "Organon of Medicine, Aphorism §270",
    },
    {
      subject: "Practice of Medicine",
      topic: "Clinical Therapeutics",
      difficulty: "HARD",
      question: "In an acute case of sudden high fever, red flushed face, dilated pupils, throbbing carotids, and delirium after dry cold wind, what is the prime indicated remedy?",
      optionA: "Aconitum Napellus",
      optionB: "Belladonna",
      optionC: "Bryonia Alba",
      optionD: "Ferrum Phosphoricum",
      correctOption: "B",
      explanation: "Belladonna is indicated for acute sudden inflammatory fever with intense vascular throbbing, red face, dilated pupils, and delirium. Aconite is characterized by immense panic, anxiety, and restlessness at the initial onset.",
      referenceBook: "Practice of Medicine & Homoeopathic Therapeutics",
    },
  ];

  for (const q of quizQuestions) {
    await prisma.quizQuestion.create({ data: q });
  }

  // 5. Seed Interactive Virtual Patient Cases
  console.log("🩺 Seeding Virtual Patient Cases (Ground Truth Fictional Profiles)...");

  await prisma.virtualPatientCase.create({
    data: {
      codeName: "vp-sunita-natrum",
      title: "Sunita Kadam (Age 34) — Recurrent Frontal Sun Headache",
      age: 34,
      gender: "Female",
      occupation: "Accountant",
      difficulty: "INTERMEDIATE",
      educationalNotes: "Target simillimum is Natrum Muriaticum. Key points to uncover: Sun aggravation (10 AM - 3 PM), pulsation as of little hammers, extreme craving for extra salt on food, unrefreshing sleep, and past history of unresolved grief following family bereavement.",
      groundTruthJson: JSON.stringify({
        chiefComplaint: "Pounding headache on the forehead and over the eyes for 6 months.",
        revealedOnAsking: {
          sensation: "Throbbing and hammering like little hammers inside my forehead.",
          timeModality: "Starts around 10:00 AM, peaks around midday, and decreases by sunset.",
          sunModality: "Direct sunlight or stepping outside in the afternoon severely triggers the pain.",
          foodCravings: "I crave salty foods a lot. I always add extra salt to my salad and meals.",
          thirst: "Moderate thirst for cold water.",
          emotionalTrigger: "I went through deep grief 2 years ago after losing my elder sister. I prefer to keep my feelings to myself; I hate when people try to console me or pity me.",
          sleep: "Sleep is light and unrefreshing.",
        },
        keyFactsToElicit: [
          "Hammering / throbbing sensation in head",
          "Sun / 10 AM to midday aggravation",
          "Strong craving for extra salt",
          "Aversion to consolation / suppressed grief",
          "Relief in quiet dark room",
        ],
        targetRemedy: "Natrum Muriaticum",
      }),
    },
  });

  await prisma.virtualPatientCase.create({
    data: {
      codeName: "vp-suresh-lyco",
      title: "Suresh Mahajan (Age 48) — Chronic Flatulent Dyspepsia",
      age: 48,
      gender: "Male",
      occupation: "Bank Manager",
      difficulty: "BEGINNER",
      educationalNotes: "Target simillimum is Lycopodium Clavatum. Key points: 4 PM to 8 PM bloating, immediate fullness after 2-3 bites of meal, craving for hot drinks and warm sweets, dictatorial nature at home but stage fright before public talks.",
      groundTruthJson: JSON.stringify({
        chiefComplaint: "Severe gas, abdominal bloating, and acidity every evening.",
        revealedOnAsking: {
          timeModality: "Worst every day strictly between 4:00 PM and 8:00 PM.",
          appetite: "I sit down feeling very hungry, but after eating just two or three mouthfuls, my abdomen feels completely bloated and tight as a drum.",
          foodPreference: "I love hot tea, warm soup, and warm sweets (jalebi/gulab jamun). Cold water makes my stomach cramp.",
          temperament: "I get very anxious before public meetings and presentations, though once I start speaking I manage fine. At home, I tend to be quick-tempered and demanding.",
        },
        keyFactsToElicit: [
          "4 PM to 8 PM specific time aggravation",
          "Fullness after a few mouthfuls",
          "Desire for warm food and sweets",
          "Anticipatory anxiety before presentations",
          "Right-sided abdominal distress moving left",
        ],
        targetRemedy: "Lycopodium Clavatum",
      }),
    },
  });

  // 6. Seed Student Attempts for Student 1 so Dashboard has real, calculated analytics
  console.log("📊 Seeding Student 1 Quiz & Viva History for Real Dashboard Analytics...");

  await prisma.quizAttempt.create({
    data: {
      userId: student1.id,
      subject: "Materia Medica",
      totalQuestions: 5,
      correctCount: 4,
      timeSpentSec: 180,
      answersJson: JSON.stringify({ q1: "B", q2: "A", q3: "B", q4: "A", q5: "C" }),
      topicBreakdownJson: JSON.stringify({
        "Polychrest Remedies": { total: 3, correct: 3 },
        "Keynotes & Modalities": { total: 2, correct: 1 },
      }),
    },
  });

  await prisma.quizAttempt.create({
    data: {
      userId: student1.id,
      subject: "Organon of Medicine & Philosophy",
      totalQuestions: 5,
      correctCount: 3,
      timeSpentSec: 210,
      answersJson: JSON.stringify({ q1: "B", q2: "B", q3: "A", q4: "C", q5: "D" }),
      topicBreakdownJson: JSON.stringify({
        "Cardinal Principles": { total: 3, correct: 2 },
        "Vital Force & Miasms": { total: 2, correct: 1 },
      }),
    },
  });

  // Seed Learning Progress for Student 1
  await prisma.learningProgress.createMany({
    data: [
      {
        userId: student1.id,
        subject: "Materia Medica",
        masteryLevel: 80.0,
        quizzesTaken: 4,
        vivaCount: 2,
        casesSolved: 3,
        weakTopicsJson: JSON.stringify(["Nosodes", "Ophidia group differentiation"]),
        strongTopicsJson: JSON.stringify(["Arsenicum Album", "Lycopodium", "Pulsatilla", "Natrum Mur"]),
      },
      {
        userId: student1.id,
        subject: "Organon of Medicine & Philosophy",
        masteryLevel: 65.0,
        quizzesTaken: 3,
        vivaCount: 1,
        casesSolved: 2,
        weakTopicsJson: JSON.stringify(["50 Millesimal scale posology (§270)", "Second prescription rules"]),
        strongTopicsJson: JSON.stringify(["Aphorism §1-§9 (Vital Force)", "Similia Principle"]),
      },
      {
        userId: student1.id,
        subject: "Repertory & Case Taking",
        masteryLevel: 50.0,
        quizzesTaken: 2,
        vivaCount: 1,
        casesSolved: 1,
        weakTopicsJson: JSON.stringify(["Cross-repertorization", "Card repertories", "Synthesis"]),
        strongTopicsJson: JSON.stringify(["Kent's Mind section"]),
      },
    ],
  });

  console.log("✅ Seed database setup completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
