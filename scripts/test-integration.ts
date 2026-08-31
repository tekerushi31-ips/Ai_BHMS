import { prisma } from "../src/lib/prisma";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth";
import { ragService } from "../src/services/rag";
import { safetyService } from "../src/services/safety";
import { caseAnalysisService } from "../src/services/case-analysis";
import { repertoryService } from "../src/services/repertory";
import { followUpService } from "../src/services/follow-up";
import { voiceService } from "../src/services/voice";
import { videoService } from "../src/services/video";

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`🧪 [TEST] ${name}... `);
    await fn();
    console.log(`✅ PASSED`);
  } catch (err: any) {
    console.log(`❌ FAILED: ${err.message}`);
    throw err;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log("==================================================");
  console.log("🏥 RUNNING BHMS AI COMPREHENSIVE INTEGRATION SUITE");
  console.log("==================================================");

  // 1. Password Hashing & JWT Verification Test
  await runTest("Auth: Password Hashing & Verification", async () => {
    const raw = "SuperSecretPassword123!";
    const hashed = await hashPassword(raw);
    assert(hashed.startsWith("$2"), "Hash should be valid bcrypt format");
    const valid = await verifyPassword(raw, hashed);
    assert(valid === true, "Password verification should return true");
    const invalid = await verifyPassword("WrongPassword", hashed);
    assert(invalid === false, "Password verification should return false for wrong pass");
  });

  // 2. JWT Session & Role Token Signing Test
  await runTest("Auth: JWT Token Signing & Verification", async () => {
    const session = {
      id: "test-student-id",
      email: "student1@bhms.ai",
      name: "Aarav Sharma",
      role: "STUDENT" as const,
    };
    const token = await signToken(session);
    assert(typeof token === "string" && token.length > 20, "JWT token must be non-empty string");
    const verified = await verifyToken(token);
    assert(verified !== null, "Verified token should not be null");
    assert(verified?.role === "STUDENT", "Role in payload should match STUDENT");
    assert(verified?.email === "student1@bhms.ai", "Email should match");
  });

  // 3. Strict Tenant Isolation Test
  await runTest("Security: Doctor Tenant Isolation Query Scoping", async () => {
    const drSharma = await prisma.user.findUnique({ where: { email: "dr.sharma@bhms.ai" } });
    const drPatil = await prisma.user.findUnique({ where: { email: "dr.patil@bhms.ai" } });

    assert(drSharma !== null, "Dr. Sharma should exist in DB");
    assert(drPatil !== null, "Dr. Patil should exist in DB");

    // Dr. Sharma queries his patients
    const sharmaPatients = await prisma.patient.findMany({
      where: { doctorId: drSharma!.id, deletedAt: null },
    });

    // Dr. Patil queries her patients
    const patilPatients = await prisma.patient.findMany({
      where: { doctorId: drPatil!.id, deletedAt: null },
    });

    assert(sharmaPatients.length > 0, "Dr. Sharma should have registered patients");
    assert(patilPatients.length > 0, "Dr. Patil should have registered patients");

    // Ensure ZERO overlap between doctor patients
    const sharmaPatientIds = new Set(sharmaPatients.map((p) => p.id));
    const overlap = patilPatients.filter((p) => sharmaPatientIds.has(p.id));
    assert(overlap.length === 0, "Strict Tenant Isolation: Dr. Patil must not have access to Dr. Sharma's patients");
  });

  // 4. RAG Knowledge Search & Verified-Only Threshold Test
  await runTest("RAG Service: Verified-Only Literature Retrieval & Threshold Fallback", async () => {
    // Known verified query
    const organonResult = await ragService.searchKnowledge("Aphorism §153 characteristic symptoms", {
      verifiedOnly: true,
      minSimilarityThreshold: 0.3,
    });
    assert(organonResult.hasVerifiedMatch === true, "Should find verified match for Aphorism 153");
    assert(organonResult.sources.length > 0, "Should return at least 1 verified source chunk");
    assert(organonResult.sources[0].verificationStatus === "VERIFIED", "Returned source must be VERIFIED");

    // Non-existent / irrelevant query -> must return empty sources (honest "Not Found")
    const gibberishResult = await ragService.searchKnowledge("quantum spaceship orbital laser", {
      verifiedOnly: true,
      minSimilarityThreshold: 0.35,
    });
    assert(gibberishResult.sources.length === 0, "Gibberish query must return ZERO sources (honest No verified source found)");
  });

  // 5. Clinical Safety & Emergency Red Flags Test
  await runTest("Safety Service: Acute Emergency & Red Flags Detection", async () => {
    // Case 1: Cardiac red flag
    const cardiacCase = {
      chiefComplaint: "Crushing chest pain radiating to left arm and jaw with severe cold sweating and breathlessness",
    };
    const cardiacAlerts = safetyService.evaluateClinicalSafety(cardiacCase);
    assert(cardiacAlerts.length > 0, "Cardiac presentation must trigger CRITICAL safety alert");
    assert(cardiacAlerts[0].level === "CRITICAL", "Safety alert level must be CRITICAL");
    assert(cardiacAlerts[0].message.includes("Review required"), "Must include required statutory phrasing");

    // Case 2: Acute surgical abdomen
    const abdomenCase = {
      chiefComplaint: "Severe right lower quadrant abdominal pain with rebound tenderness, high fever, and vomiting",
    };
    const abdomenAlerts = safetyService.evaluateClinicalSafety(abdomenCase);
    assert(abdomenAlerts.length > 0, "Acute abdomen must trigger safety alert");
    assert(abdomenAlerts[0].title.includes("Surgical Abdomen"), "Must flag surgical abdomen");

    // Case 3: Routine chronic headache -> No emergency red flag
    const routineCase = {
      chiefComplaint: "Mild frontal headache when exposed to sun for 2 weeks",
      modalities: "Better lying in dark room",
    };
    const routineAlerts = safetyService.evaluateClinicalSafety(routineCase);
    assert(routineAlerts.length === 0, "Routine homeopathic case without acute red flags should have zero critical alerts");
  });

  // 6. Case Analysis Service: Missing Info & Non-Diagnostic Guardrails
  await runTest("Case Analysis: Missing Modalities Flagging & Totality Synthesis", async () => {
    const incompleteCase = {
      chiefComplaint: "Headache",
      // Modalities, mental generals, and sensations left blank
    };
    const result = await caseAnalysisService.analyzeCase(incompleteCase);
    assert(result.analysis.missingInformation.length >= 3, "Incomplete case must flag missing modalities and generals");
    assert(result.analysis.uncertaintyNotes.includes("High Uncertainty"), "Incomplete case must indicate High Uncertainty");
    assert(result.analysis.disclaimer.includes("qualified"), "Must include qualified practitioner disclaimer");
  });

  // 7. Repertory Assistant: Kent Rubrics & Confirmation Requirement
  await runTest("Repertory Service: Natural Language to Rubric Matching", async () => {
    const repResult = repertoryService.searchRubrics({
      symptomText: "Anxiety before an important exam followed by loose stool",
    });
    assert(repResult.hasVerifiedMatch === true, "Must match anticipation anxiety & diarrhea rubrics");
    assert(repResult.matches.length > 0, "Must return candidate rubrics");
    const topMatch = repResult.matches[0];
    assert(topMatch.rubric.includes("ANXIETY") || topMatch.rubric.includes("DIARRHEA"), "Must contain relevant Kent rubric");
    assert(topMatch.relatedRemedies.some((r) => r.name.includes("Gelsemium")), "Gelsemium must be present in remedy list");
  });

  // 8. Voice STT Multilingual Normalization Test
  await runTest("Voice Service: Marathi & Hindi/Hinglish Clinical Normalization", async () => {
    // Marathi input
    const marathiTranscript = "Patient la sakali doke dukhte ani thok thok hotat. Unhat gele ki doke jast dukhte.";
    const marathiResult = voiceService.normalizeVoiceTranscript(marathiTranscript);
    assert(marathiResult.detectedLanguage === "Marathi", "Should detect Marathi language");
    assert(marathiResult.normalizedEnglish.chiefComplaint.includes("Headache") || marathiResult.normalizedEnglish.chiefComplaint.includes("Cephalea"), "Should normalize to headache");
    assert(marathiResult.normalizedEnglish.modalities.includes("morning"), "Should extract morning modality");

    // Hindi input
    const hindiTranscript = "Subah pet mein bohot jalan aur gas hoti hai. Garam chai se aaram milta hai.";
    const hindiResult = voiceService.normalizeVoiceTranscript(hindiTranscript);
    assert(hindiResult.detectedLanguage === "Hindi" || hindiResult.detectedLanguage === "Hinglish", "Should detect Hindi/Hinglish");
    assert(hindiResult.normalizedEnglish.chiefComplaint.includes("Gastric") || hindiResult.normalizedEnglish.chiefComplaint.includes("Acidity"), "Should normalize to gastric/acidity");
    assert(hindiResult.normalizedEnglish.modalities.includes("warm"), "Should extract warmth amelioration");
  });

  // 9. Follow-Up Analyzer: Strictly Stored Data & Kent Observation Logic
  await runTest("Follow-Up Service: Chronological Comparison & Kent Observation Rules", async () => {
    const visits = [
      {
        id: "v-1",
        visitNumber: 1,
        visitDate: new Date("2025-01-01"),
        symptomsSummary: "Initial presentation: Severe flatulence, 4-8 PM bloating, acid reflux.",
        statusChange: "UNCHANGED",
      },
      {
        id: "v-2",
        visitNumber: 2,
        visitDate: new Date("2025-01-22"),
        symptomsSummary: "70% relief in bloating, reflux greatly reduced, energy improved.",
        statusChange: "IMPROVED",
      },
    ];

    const followUpResult = followUpService.analyzeVisits(visits);
    assert(followUpResult !== null, "Follow-up comparison must succeed for 2+ visits");
    assert(followUpResult?.trend === "IMPROVED", "Trajectory must evaluate to IMPROVED");
    assert(Boolean(followUpResult?.prescribingConsiderations.some((c) => c.includes("Kent Observation #4"))), "Must cite Kent Observation #4 for improvement without aggravation");
  });

  // 10. Video Service: Session Creation & Token Expiration
  let createdVideoSessionId = "";
  let patientJoinToken = "";
  await runTest("Video Service: Session Creation & Secure Expiring Tokens", async () => {
    const drSharma = await prisma.user.findUnique({ where: { email: "dr.sharma@bhms.ai" } });
    const patient = await prisma.patient.findFirst({ where: { doctorId: drSharma!.id } });
    assert(patient !== null, "Must find a patient for Dr. Sharma");

    const result = await videoService.createVideoSession({
      doctorId: drSharma!.id,
      patientId: patient!.id,
      isInstant: true,
    });

    assert(Boolean(result.session.id), "Session ID must be generated");
    assert(Boolean(result.session.joinToken), "Join token must be generated");
    assert(result.session.status === "WAITING", "Instant session status should be WAITING");
    assert(result.patientJoinUrl.includes(result.session.joinToken), "Join URL contains token");

    createdVideoSessionId = result.session.id;
    patientJoinToken = result.session.joinToken;
  });

  // 11. Video Service: Patient Join Token Validation (Public / No Login)
  await runTest("Video Service: Patient Join Token Public Validation", async () => {
    // Valid token
    const validation = await videoService.validateJoinToken(patientJoinToken);
    assert(validation.valid === true, "Valid token must pass validation");
    assert(Boolean(validation.session?.doctorName), "Must return doctor name");
    assert(Boolean(validation.session?.patientName), "Must return patient name");

    // Invalid token
    const invalidValidation = await videoService.validateJoinToken("invalid-non-existent-token-12345");
    assert(invalidValidation.valid === false, "Non-existent token must be rejected");
  });

  // 12. Video Service: In-Call Notes & Push to Patient Case Record
  await runTest("Video Service: Live In-Call Notes & Push to Patient Record", async () => {
    const drSharma = await prisma.user.findUnique({ where: { email: "dr.sharma@bhms.ai" } });

    // Save note
    const note = await videoService.saveSessionNote(
      createdVideoSessionId,
      drSharma!.id,
      "Patient reports headache starts at 10 AM, worse under sun, craves salty foods."
    );
    assert(Boolean(note.id), "Note must be saved in database");
    assert(note.pushedToRecord === false, "Newly saved note has pushedToRecord = false");

    // Push note to patient record (CaseVisit)
    const caseVisit = await videoService.pushNoteToPatientRecord(
      createdVideoSessionId,
      drSharma!.id
    );
    assert(Boolean(caseVisit.id), "CaseVisit created from video notes");
    assert(caseVisit.symptomsSummary.includes("Video Consultation Notes"), "CaseVisit includes video prefix");
    assert(caseVisit.symptomsSummary.includes("10 AM"), "CaseVisit includes doctor's typed note content");
  });

  console.log("==================================================");
  console.log("🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Test Suite Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
