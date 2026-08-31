"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Lock,
  Unlock,
  CheckCircle,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

interface CaseStep {
  id: string;
  title: string;
  isUnlocked: boolean;
  content: string;
  questionPrompt: string;
  rubricsFound: string[];
}

export default function CaseSimulatorPage() {
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [studentNotes, setStudentNotes] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const initialSteps: CaseStep[] = [
    {
      id: "step-1",
      title: "1. Chief Complaint & Initial Presentation",
      isUnlocked: true,
      content:
        "Patient (Male, 28 years old) reports recurring morning sneezing bouts, severe burning in nostrils, and acrid watery coryza whenever exposed to cool morning air.",
      questionPrompt: "What specific time modalities and thermal triggers need inquiry?",
      rubricsFound: ["NOSE - CORYZA - discharge - acrid, watery", "GENERALITIES - AIR - cold - agg."],
    },
    {
      id: "step-2",
      title: "2. Modalities & Sensations (Elicited)",
      isUnlocked: false,
      content:
        "Sensation is burning and raw excoriation inside nostrils. Worse immediately on putting feet out of bed in the morning, and from drafts of air. Better when wrapping head in a warm blanket or in a warm room.",
      questionPrompt: "How do these thermal and positional modalities guide the totality?",
      rubricsFound: ["HEAD - UNCOVERING - head - agg.", "GENERALITIES - WARMTH - room - amel."],
    },
    {
      id: "step-3",
      title: "3. Mental Generals & Disposition",
      isUnlocked: false,
      content:
        "The patient is very ambitious, fastidious, neat, and over-sensitive to minor noises and interruptions. Becomes easily impatient and irritable if work is delayed.",
      questionPrompt: "Which polychrest remedy corresponds to this high-strung, chilly, fastidious picture?",
      rubricsFound: ["MIND - FASTIDIOUS", "MIND - IRRITABILITY - noise, from"],
    },
    {
      id: "step-4",
      title: "4. Physical Generals & Constitutional Totality",
      isUnlocked: false,
      content:
        "Patient is intensely chilly, craves spicy savory food and strong coffee. Sleep is disturbed around 3:00 AM with mental restlessness.",
      questionPrompt: "Synthesize the totality: Chilly + 3 AM wakefulness + Irritable fastidious + Morning rhinitis > warmth.",
      rubricsFound: ["STOMACH - DESIRES - spices", "SLEEP - WAKING - 3 a.m."],
    },
  ];

  const [steps, setSteps] = useState<CaseStep[]>(initialSteps);

  const handleUnlockNext = () => {
    if (activeStep + 1 < steps.length) {
      const nextStep = activeStep + 1;
      setSteps((prev) =>
        prev.map((s, idx) => (idx <= nextStep ? { ...s, isUnlocked: true } : s))
      );
      setActiveStep(nextStep);
    } else {
      setIsCompleted(true);
    }
  };

  const toggleRubric = (rubric: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(rubric) ? prev.filter((r) => r !== rubric) : [...prev, rubric]
    );
  };

  const handleReset = () => {
    setSteps(initialSteps);
    setActiveStep(0);
    setSelectedRubrics([]);
    setStudentNotes("");
    setIsCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Step-by-Step Case Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Progressively uncover case details, synthesize repertory rubrics, and test your homoeopathic case analysis.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Case
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Progressive Case Stages */}
        <div className="lg:col-span-2 space-y-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-5 rounded-2xl border transition-all ${
                step.isUnlocked
                  ? "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-soft"
                  : "bg-slate-50 dark:bg-[#1A2234]/50 border-slate-200/60 dark:border-slate-800/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {step.isUnlocked ? (
                    <Unlock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  )}
                  {step.title}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Stage {idx + 1} of {steps.length}
                </span>
              </div>

              {step.isUnlocked ? (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#1A2234] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {step.content}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Candidate Rubrics for this stage (Click to add to repertorization):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {step.rubricsFound.map((rubric, rIdx) => {
                        const isSelected = selectedRubrics.includes(rubric);
                        return (
                          <button
                            key={rIdx}
                            onClick={() => toggleRubric(rubric)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                              isSelected
                                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-semibold"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {rubric}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  Field locked. Uncover previous case stages first to simulate real consultation questioning.
                </p>
              )}
            </div>
          ))}

          {!isCompleted ? (
            <button
              onClick={handleUnlockNext}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>
                {activeStep + 1 < steps.length
                  ? `Inquire & Unlock Stage ${activeStep + 2}`
                  : "Finalize Case Analysis"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            /* Educational Debrief */
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Case Simulation Completed — Educational Debrief
              </div>

              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>Simillimum Synthesis:</strong> The combination of <em>chilly constitution</em>, <em>morning rhinitis worse putting feet out of bed</em>, <em>3 AM wakefulness</em>, <em>fastidious & irritable temperament</em>, and <em>desire for stimulants</em> clearly points to <strong>Nux Vomica</strong> (Polychrest).
              </p>

              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                You selected {selectedRubrics.length} rubric(s) in your repertorial synthesis. Review Aphorism §153 on characteristic symptom hierarchies.
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Student Case Notes & Selected Rubrics */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Repertorization Basket ({selectedRubrics.length})
            </h3>

            {selectedRubrics.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                No rubrics tagged yet. Click on candidate rubrics from unlocked stages to build your rubric list.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedRubrics.map((r, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-mono text-amber-900 dark:text-amber-200 flex items-center justify-between"
                  >
                    <span className="truncate">{r}</span>
                    <button
                      onClick={() => toggleRubric(r)}
                      className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Student Reasoning Notes
            </h3>
            <textarea
              rows={5}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Record your differential remedy notes, miasmatic evaluation (Psora vs Sycosis), and posology plan here..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors"
            />
          </div>

          <ClinicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
