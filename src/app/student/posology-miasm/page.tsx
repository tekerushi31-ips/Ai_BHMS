"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Layers,
  PieChart as PieIcon,
  Sparkles,
  Info,
  CheckCircle,
  Plus,
  Trash2,
  BookOpen,
  AlertTriangle,
  Award,
} from "lucide-react";
import { MiasmSymptomItem, MiasmaticAnalysisOutput, PotencyEducationalGuide } from "@/services/posology-miasm";

export default function PosologyMiasmPage() {
  const [symptoms, setSymptoms] = useState<MiasmSymptomItem[]>([]);
  const [potencyGuides, setPotencyGuides] = useState<PotencyEducationalGuide[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([
    "sym-1",
    "sym-5",
    "sym-10",
  ]);
  const [analysisResult, setAnalysisResult] = useState<MiasmaticAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const res = await fetch("/api/student/posology-miasm");
      const data = await res.json();
      if (data.symptoms) setSymptoms(data.symptoms);
      if (data.potencyGuidelines) setPotencyGuides(data.potencyGuidelines);

      // Run initial analysis with default symptoms
      runMiasmAnalysis(["sym-1", "sym-5", "sym-10"]);
    } catch {
      alert("Failed to load miasm & posology learning data.");
    }
  }

  async function runMiasmAnalysis(ids: string[]) {
    if (ids.length === 0) {
      setAnalysisResult(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/posology-miasm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomIds: ids }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch {
      alert("Error computing miasmatic analysis.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSymptom(id: string) {
    let next: string[];
    if (selectedSymptomIds.includes(id)) {
      next = selectedSymptomIds.filter((item) => item !== id);
    } else {
      next = [...selectedSymptomIds, id];
    }
    setSelectedSymptomIds(next);
    runMiasmAnalysis(next);
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Strict Statutory Safety Guardrail Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-sm block">
            Mandatory Clinical Safety Notice — Educational Decision-Support Tool Only
          </span>
          <p>
            This module is strictly intended for educational study and clinical reasoning review by BHMS students. It does NOT prescribe potency, dosage, or repetition autonomously. Clinical remedy administration requires independent examination by a registered homoeopathic medical practitioner.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PieIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Posology, Potency & Miasmatic Learning Assistant
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate educational miasmatic totality distributions (Psora, Sycosis, Syphilis, Tubercular) and master Hahnemannian & Kentian posology guidelines.
          </p>
        </div>
      </div>

      {/* 1. MIASMATIC TOTALITY ANALYSIS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" /> Part 1: Educational Miasmatic Analysis Engine
          </h2>
          <span className="text-xs text-slate-500">
            Select patient case symptoms to compute miasmatic breakdown
          </span>
        </div>

        {/* Symptoms Grid & Interactive Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Symptoms Selection List (6 Columns) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Case Symptom Indications ({selectedSymptomIds.length} Selected):
                </span>
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {symptoms.map((s) => {
                  const isSelected = selectedSymptomIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSymptom(s.id)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-800 text-purple-950 dark:text-purple-100 shadow-xs"
                          : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-semibold block">{s.name}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.explanation}
                        </p>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono block">
                          📖 {s.classicReference}
                        </span>
                      </div>

                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Miasmatic Breakdown Visualizer (6 Columns) */}
          <div className="lg:col-span-6 space-y-3">
            {analysisResult ? (
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {analysisResult.disclaimer}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    Miasmatic Affinity Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Predominant: <strong>{analysisResult.predominantMiasm}</strong> | Secondary:{" "}
                    <strong>{analysisResult.secondaryMiasm}</strong>
                  </p>
                </div>

                {/* 4 Miasm Percentage Bars */}
                <div className="space-y-3">
                  {/* Psora */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-blue-600 dark:text-blue-400">Psora (Functional Irritation)</span>
                      <span className="font-mono">{analysisResult.distribution.psora}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.distribution.psora}%` }}
                      />
                    </div>
                  </div>

                  {/* Sycosis */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">Sycosis (Hypertrophy / Overgrowth)</span>
                      <span className="font-mono">{analysisResult.distribution.sycosis}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.distribution.sycosis}%` }}
                      />
                    </div>
                  </div>

                  {/* Syphilis */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-rose-600 dark:text-rose-400">Syphilis (Destruction / Ulceration)</span>
                      <span className="font-mono">{analysisResult.distribution.syphilis}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.distribution.syphilis}%` }}
                      />
                    </div>
                  </div>

                  {/* Tubercular */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-600 dark:text-amber-400">Tubercular / Pseudo-Psora (Combustion)</span>
                      <span className="font-mono">{analysisResult.distribution.tubercular}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.distribution.tubercular}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Synthesis Card */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs text-purple-950 dark:text-purple-200 space-y-1.5 leading-relaxed">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Educational Synthesis:
                  </span>
                  <p>{analysisResult.educationalSynthesis}</p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                Select symptoms on the left to compute miasmatic analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. POSOLOGY & POTENCY COMPARATOR SECTION */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-500" /> Part 2: Posology & Potency Learning Interface
          </h2>
          <span className="text-xs text-slate-500">
            Educational guidelines based on Kent's 12 Observations & Organon posology
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potencyGuides.map((guide) => (
            <div
              key={guide.potencyScale}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                    {guide.potencyScale}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Scale Guide
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {guide.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Susceptibility:</strong>{" "}
                    {guide.susceptibilityLevel}
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Pathology Depth:</strong>{" "}
                    {guide.pathologicalDepth}
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Repetition Rules:</strong>{" "}
                    {guide.repetitionRules}
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200">
                    <strong>Kent Observation:</strong> {guide.kentObservationLink}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                📖 Reference: {guide.referenceSource}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
