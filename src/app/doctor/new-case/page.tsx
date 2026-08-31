"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FilePlus,
  Sparkles,
  Save,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Layers,
  CheckCircle,
  Clock,
  Mic,
  ArrowRight,
} from "lucide-react";
import { CaseAnalysisResult, AISource } from "@/types";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

function DigitalCaseSheetContent() {
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId") || "";

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 15 Comprehensive Homeopathic Sections
  const [caseForm, setCaseForm] = useState({
    chiefComplaint: "",
    duration: "",
    location: "",
    sensation: "",
    modalities: "",
    concomitants: "",
    mentalGenerals: "",
    physicalGenerals: "",
    pastHistory: "",
    familyHistory: "",
    personalHistory: "",
    investigations: "",
    currentMedications: "",
    rawNotes: "",
    remedyConsidered: "",
    potencyPrescribed: "",
  });

  const [analysisResult, setAnalysisResult] = useState<CaseAnalysisResult | null>(null);
  const [ragSources, setRagSources] = useState<AISource[]>([]);

  // Fetch doctor's patients
  useEffect(() => {
    fetch("/api/doctor/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        if (!selectedPatientId && data.patients && data.patients.length > 0) {
          setSelectedPatientId(data.patients[0].id);
        }
      });
  }, [selectedPatientId]);

  // Autosave Draft interval (~30s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedPatientId && caseForm.chiefComplaint.trim().length > 3) {
        handleSaveCase("DRAFT", true);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [selectedPatientId, caseForm]);

  const handleSaveCase = async (status = "SAVED", isAutosave = false) => {
    if (!selectedPatientId || !caseForm.chiefComplaint.trim()) {
      if (!isAutosave) alert("Please select a patient and provide the Chief Complaint.");
      return;
    }

    if (!isAutosave) setSaving(true);

    try {
      const res = await fetch("/api/doctor/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          ...caseForm,
          status,
        }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (e) {
      console.error("Save case failed:", e);
    } finally {
      if (!isAutosave) setSaving(false);
    }
  };

  const handleAnalyzeCase = async () => {
    if (!caseForm.chiefComplaint.trim()) {
      alert("Please enter at least the Chief Complaint to run AI Anamnesis Analysis.");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch("/api/doctor/cases/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseForm),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setRagSources(data.ragSources || []);
      }
    } catch (e) {
      console.error("AI Analysis failed:", e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-clinical-600 dark:text-clinical-400" />
            Digital Homoeopathic Case Sheet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete Boenninghausen & Kentian case anamnesis with automatic draft autosave and AI decision support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Autosaved {lastSaved}
            </span>
          )}

          <button
            onClick={() => handleSaveCase("SAVED")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {saving ? "Saving..." : "Save Case Sheet"}
          </button>

          <button
            onClick={handleAnalyzeCase}
            disabled={analyzing || !caseForm.chiefComplaint.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? "Structuring Case..." : "Analyze Case (AI)"}
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Select Patient Record *
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full max-w-md px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode}) — {p.age} yrs, {p.gender}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/doctor/voice-case"
            className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Use Multilingual Voice Input
          </a>
        </div>
      </div>

      {/* 2-Column Grid: Form on Left, AI Case Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 15-Section Case Sheet */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section 1: Chief Complaint & Onset */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-clinical-700 dark:text-clinical-400">
              1. Chief Complaint & Chronological Onset
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chief Complaint *
              </label>
              <textarea
                rows={2}
                required
                value={caseForm.chiefComplaint}
                onChange={(e) => setCaseForm({ ...caseForm, chiefComplaint: e.target.value })}
                placeholder="Describe presenting symptoms in patient's own words..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration & Timeline
                </label>
                <input
                  type="text"
                  value={caseForm.duration}
                  onChange={(e) => setCaseForm({ ...caseForm, duration: e.target.value })}
                  placeholder="e.g. 6 months, sudden onset after cold bath"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location & Radiation
                </label>
                <input
                  type="text"
                  value={caseForm.location}
                  onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                  placeholder="e.g. Frontal region radiating to occiput, right-sided"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sensations, Modalities & Concomitants */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-clinical-700 dark:text-clinical-400">
              2. Sensations, Modalities & Concomitants
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sensation & Character of Pain
              </label>
              <input
                type="text"
                value={caseForm.sensation}
                onChange={(e) => setCaseForm({ ...caseForm, sensation: e.target.value })}
                placeholder="e.g. Throbbing like little hammers, burning, stitching, bruised heaviness"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Modalities (Aggravations & Ameliorations)
              </label>
              <textarea
                rows={2}
                value={caseForm.modalities}
                onChange={(e) => setCaseForm({ ...caseForm, modalities: e.target.value })}
                placeholder="Aggravation (<): 10 AM, direct sun, cold drafts, motion. Amelioration (>): Open air, warm drinks, dark room."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Concomitant Symptoms
              </label>
              <input
                type="text"
                value={caseForm.concomitants}
                onChange={(e) => setCaseForm({ ...caseForm, concomitants: e.target.value })}
                placeholder="e.g. Flashing zigzag lights before vision, nausea during headache"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>
          </div>

          {/* Section 3: Generals (Mental & Physical) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-clinical-700 dark:text-clinical-400">
              3. Constitutional Generals
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mental Generals & Emotional Causation
              </label>
              <textarea
                rows={2}
                value={caseForm.mentalGenerals}
                onChange={(e) => setCaseForm({ ...caseForm, mentalGenerals: e.target.value })}
                placeholder="Disposition, fears, anxiety, grief history, consolation reaction, irritability, weeping tendency..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Generals (Thermal, Thirst, Cravings, Sleep)
              </label>
              <textarea
                rows={2}
                value={caseForm.physicalGenerals}
                onChange={(e) => setCaseForm({ ...caseForm, physicalGenerals: e.target.value })}
                placeholder="Thermal state (Chilly vs Hot), thirst (small sips vs large quantities), cravings/aversions (salt, sweets, spicy), perspiration, sleep posture..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
              />
            </div>
          </div>

          {/* Section 4: History & Medications */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-clinical-700 dark:text-clinical-400">
              4. Past, Family & Medical History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Past History
                </label>
                <input
                  type="text"
                  value={caseForm.pastHistory}
                  onChange={(e) => setCaseForm({ ...caseForm, pastHistory: e.target.value })}
                  placeholder="Suppressed eruptions, recurrent infections..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family History
                </label>
                <input
                  type="text"
                  value={caseForm.familyHistory}
                  onChange={(e) => setCaseForm({ ...caseForm, familyHistory: e.target.value })}
                  placeholder="Asthma, diabetes, cancer..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investigations & Meds
                </label>
                <input
                  type="text"
                  value={caseForm.investigations}
                  onChange={(e) => setCaseForm({ ...caseForm, investigations: e.target.value })}
                  placeholder="CBC, endoscopy, current drugs..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>

            {/* Prescribing Formulation */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remedy Considered
                </label>
                <input
                  type="text"
                  value={caseForm.remedyConsidered}
                  onChange={(e) => setCaseForm({ ...caseForm, remedyConsidered: e.target.value })}
                  placeholder="e.g. Natrum Muriaticum, Lycopodium..."
                  className="w-full p-2 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:border-clinical-600 dark:focus:border-clinical-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Potency & Posology
                </label>
                <input
                  type="text"
                  value={caseForm.potencyPrescribed}
                  onChange={(e) =>
                    setCaseForm({ ...caseForm, potencyPrescribed: e.target.value })
                  }
                  placeholder="e.g. 200C single dose, followed by Sac Lac"
                  className="w-full p-2 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:border-clinical-600 dark:focus:border-clinical-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Case Analysis Output Panel */}
        <div className="space-y-4">
          {analyzing ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-3">
              <LoadingSpinner label="AI is structuring anamnesis and querying verified knowledge..." />
            </div>
          ) : analysisResult ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-clinical-600 dark:text-clinical-400" />
                  AI Case Analysis
                </h3>
                <span className="text-[10px] font-semibold bg-clinical-50 dark:bg-clinical-950/60 text-clinical-700 dark:text-clinical-300 border border-clinical-200 dark:border-clinical-800 px-2 py-0.5 rounded">
                  Decision Support
                </span>
              </div>

              {/* Safety Alerts */}
              {analysisResult.safetyAlerts.length > 0 && (
                <div className="space-y-2">
                  {analysisResult.safetyAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1"
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        {alert.message}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{alert.clinicalContext}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Missing Information Detector */}
              {analysisResult.missingInformation.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Potentially Missing Clinical Information:
                  </div>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-300/90 text-[11px]">
                    {analysisResult.missingInformation.map((gap, i) => (
                      <li key={i}>• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Totality of Symptoms */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[10px]">
                  Totality of Symptoms
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  {analysisResult.totalityOfSymptoms.map((tot, i) => (
                    <div key={i}>• {tot}</div>
                  ))}
                </div>
              </div>

              {/* Candidate Rubrics */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[10px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-clinical-600 dark:text-clinical-400" /> Suggested Kent Rubrics
                </div>
                <div className="space-y-1.5">
                  {analysisResult.suggestedRubrics.map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 text-teal-950 dark:text-teal-200 text-[11px]"
                    >
                      <div className="font-mono font-semibold">{r.rubric}</div>
                      <div className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">{r.relevance}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Literature References */}
              {ragSources.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white uppercase text-[10px] flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Verified Knowledge Citations
                  </div>
                  <div className="space-y-2">
                    {ragSources.map((src, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 text-[11px] space-y-1"
                      >
                        <div className="font-semibold text-purple-900 dark:text-purple-200">
                          {src.sourceBook} — {src.chapterOrAphorism}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {src.passage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncertainty Tag */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic leading-snug">
                <strong>Uncertainty Assessment:</strong> {analysisResult.uncertaintyNotes}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">AI Anamnesis Ready</div>
              <p className="text-[11px] max-w-xs mx-auto">
                Fill in the anamnesis fields on the left and click <strong>"Analyze Case"</strong> to structure symptoms, check safety red flags, and retrieve verified Kent & Boericke citations.
              </p>
            </div>
          )}

          <ClinicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}

export default function DigitalCaseSheetPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading Digital Case Sheet..." />}>
      <DigitalCaseSheetContent />
    </Suspense>
  );
}
