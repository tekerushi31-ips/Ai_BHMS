async function runStep(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`🔹 [E2E FLOW] ${name}... `);
    await fn();
    console.log(`✅ OK`);
  } catch (e: any) {
    console.log(`❌ ERROR: ${e.message}`);
    throw e;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

const BASE_URL = "http://localhost:3005";

async function main() {
  console.log("==================================================");
  console.log("🚀 VERIFYING LIVE HTTP FLOWS ON http://localhost:3005");
  console.log("==================================================");

  let studentCookie = "";
  let doctorCookie = "";

  // 1. Home Page Verification
  await runStep("GET / — Home Page & Demo Banner", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Home page returned status ${res.status}`);
    const html = await res.text();
    assert(html.includes("BHMS AI"), "HTML should contain BHMS AI title");
    assert(html.includes("DEMO MODE ACTIVE"), "HTML should contain Demo Mode banner");
    assert(html.includes("Student"), "HTML should contain Student role card");
    assert(html.includes("Doctor"), "HTML should contain Doctor role card");
  });

  // 2. Demo 1-Click Student Login
  await runStep("POST /api/auth/demo-login — Student 1-Click Auth", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: "student1" }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    assert(Boolean(setCookie), "Response must set session cookie");
    studentCookie = setCookie!.split(";")[0];
    const data = await res.json();
    assert(data.user.name === "Aarav Sharma", "Authenticated as Aarav Sharma");
    assert(data.user.role === "STUDENT", "Role is STUDENT");
    assert(data.redirectUrl === "/student/dashboard", "Redirects to /student/dashboard");
  });

  // 3. Student Dashboard API
  await runStep("GET /api/student/dashboard — Real Computed Metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: { Cookie: studentCookie },
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.user.name === "Aarav Sharma", "User name matches");
    assert(data.metrics.totalQuizzes >= 1, "Has stored quiz attempts");
    assert(data.recommendations.length > 0, "Has real computed recommendations");
  });

  // 4. Student AI Tutor
  await runStep("POST /api/student/ai-tutor — RAG Literature Chat", async () => {
    const res = await fetch(`${BASE_URL}/api/student/ai-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        message: "Explain Aphorism §153 (Characteristic vs Common Symptoms)",
      }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.content.includes("Aphorism §153") || data.content.includes("Characteristic"), "AI response includes Organon reasoning");
    assert(data.sources && data.sources.length > 0, "Response attaches RAG source citations");
  });

  // 5. Virtual Patient Simulation
  let vpSessionId = "";
  await runStep("GET /api/student/virtual-patient/cases & Start Session", async () => {
    const casesRes = await fetch(`${BASE_URL}/api/student/virtual-patient/cases`, {
      headers: { Cookie: studentCookie },
    });
    const casesData = await casesRes.json();
    assert(casesData.cases.length > 0, "Must return available virtual patient cases");
    const firstCase = casesData.cases[0];

    // Start session
    const sessRes = await fetch(`${BASE_URL}/api/student/virtual-patient/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
      body: JSON.stringify({ caseId: firstCase.id }),
    });
    const sessData = await sessRes.json();
    vpSessionId = sessData.session.id;
    assert(Boolean(vpSessionId), "Session ID created");
  });

  await runStep("POST /api/student/virtual-patient/chat — History Taking Turn", async () => {
    const chatRes = await fetch(`${BASE_URL}/api/student/virtual-patient/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        sessionId: vpSessionId,
        message: "What time of the day is your headache worse and what makes it feel better?",
      }),
    });
    assert(chatRes.status === 200, `Chat status ${chatRes.status}`);
    const chatData = await chatRes.json();
    assert(Boolean(chatData.reply), "Patient replied to question");
    assert(chatData.factsDiscovered.length > 0, "Discovered symptom facts tracked");
  });

  await runStep("POST /api/student/virtual-patient/end-case — Performance Report", async () => {
    const endRes = await fetch(`${BASE_URL}/api/student/virtual-patient/end-case`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
      body: JSON.stringify({ sessionId: vpSessionId }),
    });
    assert(endRes.status === 200, `End case status ${endRes.status}`);
    const reportData = await endRes.json();
    assert(reportData.overallScore > 0, "Overall score calculated");
    assert(reportData.report.completenessScore > 0, "Completeness score calculated");
    assert(Boolean(reportData.targetRemedy), "Identifies target remedy");
  });

  // 6. Practice Quiz Submission
  await runStep("POST /api/student/quiz/submit — Evaluation & Scoring", async () => {
    // Get questions
    const qRes = await fetch(`${BASE_URL}/api/student/quiz/questions?subject=Materia+Medica&count=3`, {
      headers: { Cookie: studentCookie },
    });
    const qData = await qRes.json();
    assert(qData.questions.length > 0, "Questions returned");

    const answers: Record<string, string> = {};
    qData.questions.forEach((q: any) => {
      answers[q.id] = q.correctOption;
    });

    // Submit
    const submitRes = await fetch(`${BASE_URL}/api/student/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        subject: "Materia Medica",
        answers,
        timeSpentSec: 65,
      }),
    });
    const submitData = await submitRes.json();
    assert(submitData.percentage === 100, "Score evaluated correctly (100%)");
    assert(submitData.questionReview.length === 3, "Detailed review generated for 3 questions");
  });

  // 7. Doctor 1-Click Auth
  await runStep("POST /api/auth/demo-login — Doctor 1-Click Auth", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: "doctor1" }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    doctorCookie = setCookie!.split(";")[0];
    const data = await res.json();
    assert(data.user.name.includes("Dr. Vikram Sharma"), "Authenticated as Dr. Vikram Sharma");
    assert(data.user.role === "DOCTOR", "Role is DOCTOR");
    assert(data.redirectUrl === "/doctor/dashboard", "Redirects to /doctor/dashboard");
  });

  // 8. Doctor Dashboard API
  await runStep("GET /api/doctor/dashboard — Tenant Scoped Metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/doctor/dashboard`, {
      headers: { Cookie: doctorCookie },
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.doctor.name.includes("Vikram Sharma"), "Doctor name matches");
    assert(data.metrics.totalPatients > 0, "Has registered patients");
    assert(data.recentPatients.length > 0, "Returns scoped recent patients");
  });

  // 9. AI Case Analysis
  await runStep("POST /api/doctor/cases/analyze — Case Analysis & Safety Flags", async () => {
    const res = await fetch(`${BASE_URL}/api/doctor/cases/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        chiefComplaint: "Pounding frontal headache with nausea triggered by sun exposure",
        location: "Frontal supraorbital",
        sensation: "Throbbing like little hammers",
        modalities: "Worse 10 AM to 3 PM, sun heat; better lying in dark room",
        mentalGenerals: "Reserved, dwells on past grief, consolation aggravates",
        physicalGenerals: "Intolerant of sun, craves extra salt",
      }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.analysis.totalityOfSymptoms.length > 0, "Synthesizes totality of symptoms");
    assert(data.analysis.suggestedRubrics.length > 0, "Suggests Kent rubrics");
    assert(data.ragSources.length > 0, "Attaches verified literature references");
  });

  // 10. Voice STT Normalization
  await runStep("POST /api/doctor/voice/normalize — Multilingual Marathi Parsing", async () => {
    const res = await fetch(`${BASE_URL}/api/doctor/voice/normalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        rawText: "Patient la sakali doke dukhte ani thok thok hotat. Unhat gele ki doke jast dukhte.",
      }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.result.detectedLanguage === "Marathi", "Detected Marathi language");
    assert(data.result.normalizedEnglish.chiefComplaint.length > 0, "Extracted normalized English chief complaint");
    assert(data.result.normalizedEnglish.modalities.length > 0, "Extracted modalities");
  });

  // 11. Verified Knowledge Search
  await runStep("POST /api/doctor/knowledge/search — Verified Knowledge Retrieval", async () => {
    const res = await fetch(`${BASE_URL}/api/doctor/knowledge/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        query: "Aphorism §153 Characteristic Symptoms",
        category: "ORGANON",
      }),
    });
    assert(res.status === 200, `Status was ${res.status}`);
    const data = await res.json();
    assert(data.sources.length > 0, "Retrieved verified Organon citation");
    assert(data.sources[0].verificationStatus === "VERIFIED", "Source is VERIFIED");
  });

  // 12. Follow-Up Analyzer
  await runStep("POST /api/doctor/follow-up/analyze — Visit History Trajectory", async () => {
    // Get patient 1 (Rajesh Verma has 2 visits)
    const ptsRes = await fetch(`${BASE_URL}/api/doctor/patients`, {
      headers: { Cookie: doctorCookie },
    });
    const ptsData = await ptsRes.json();
    const rajesh = ptsData.patients.find((p: any) => p.name.includes("Rajesh"));
    assert(Boolean(rajesh), "Found patient Rajesh Verma");

    const fuRes = await fetch(`${BASE_URL}/api/doctor/follow-up/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({ patientId: rajesh.id }),
    });
    assert(fuRes.status === 200, `Follow-up status ${fuRes.status}`);
    const fuData = await fuRes.json();
    assert(fuData.canAnalyze === true, "Can analyze 2-visit patient");
    assert(typeof fuData.analysis.trend === "string", "Trajectory evaluated");
    assert(fuData.analysis.prescribingConsiderations.length > 0, "Generated Kent observations");
  });

  // 13. Video Consultation: Create Instant Session
  let createdVideoId = "";
  let patientJoinToken = "";
  await runStep("POST /api/doctor/video-sessions — Create Instant Consultation", async () => {
    const ptsRes = await fetch(`${BASE_URL}/api/doctor/patients`, {
      headers: { Cookie: doctorCookie },
    });
    const ptsData = await ptsRes.json();
    const patient = ptsData.patients[0];
    assert(Boolean(patient), "Patient exists");

    const createRes = await fetch(`${BASE_URL}/api/doctor/video-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        patientId: patient.id,
        isInstant: true,
      }),
    });
    assert(createRes.status === 200, `Create video status ${createRes.status}`);
    const createData = await createRes.json();
    assert(Boolean(createData.session.id), "Video session ID returned");
    assert(Boolean(createData.session.joinToken), "Expiring join token returned");
    assert(createData.patientJoinUrl.includes(createData.session.joinToken), "Join link contains token");

    createdVideoId = createData.session.id;
    patientJoinToken = createData.session.joinToken;
  });

  // 14. Public Patient Join Link Validation
  await runStep("GET /api/video-call/join/[token] — Public Token Validation", async () => {
    const joinRes = await fetch(`${BASE_URL}/api/video-call/join/${patientJoinToken}`);
    assert(joinRes.status === 200, `Join validation status ${joinRes.status}`);
    const joinData = await joinRes.json();
    assert(joinData.valid === true, "Token valid for patient");
    assert(Boolean(joinData.session.doctorName), "Returns doctor name without doctor auth");
    assert(Boolean(joinData.session.patientName), "Returns patient name");
  });

  // 15. Doctor Live In-Call Notes & Post-Call Status Update
  await runStep("POST /api/doctor/video-sessions/[id]/notes — Live Clinical Notes", async () => {
    const noteRes = await fetch(`${BASE_URL}/api/doctor/video-sessions/${createdVideoId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        noteText: "Video Call observation: Patient is anxious, restless, relieved by sipping warm water.",
      }),
    });
    assert(noteRes.status === 200, `Save note status ${noteRes.status}`);
    const noteData = await noteRes.json();
    assert(Boolean(noteData.note.id), "Note saved successfully");

    // Complete session
    const updateRes = await fetch(`${BASE_URL}/api/doctor/video-sessions/${createdVideoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
      body: JSON.stringify({
        status: "COMPLETED",
        durationSeconds: 380,
      }),
    });
    assert(updateRes.status === 200, "Marked session completed");
  });

  // 16. Push Notes to Patient Case Visit Record
  await runStep("POST /api/doctor/video-sessions/[id]/push-to-record — Push to Case Record", async () => {
    const pushRes = await fetch(`${BASE_URL}/api/doctor/video-sessions/${createdVideoId}/push-to-record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorCookie,
      },
    });
    assert(pushRes.status === 200, `Push note status ${pushRes.status}`);
    const pushData = await pushRes.json();
    assert(Boolean(pushData.caseVisit.id), "Created new CaseVisit record");
    assert(pushData.caseVisit.symptomsSummary.includes("Video Consultation Notes"), "Includes video consultation tag");
  });

  console.log("==================================================");
  console.log("🎉 ALL 16 LIVE HTTP E2E FLOWS TESTED & PASSED (100%)!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("E2E Test Failed:", e);
    process.exit(1);
  });
