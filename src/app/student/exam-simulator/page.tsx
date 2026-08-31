"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookOpen,
  Check,
  X,
  Clock,
} from "lucide-react";
import { ExamEvaluationResult } from "@/services/exam";

interface QuestionItem {
  id: string;
  number: number;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export default function ExamSimulatorPage() {
  const [examMode, setExamMode] = useState<"AIAPGET" | "UNIVERSITY" | "CUSTOM">("AIAPGET");
  const [universitySubject, setUniversitySubject] = useState("ALL");
  const [examState, setExamState] = useState<"SETUP" | "RUNNING" | "EVALUATED">("SETUP");

  // Questions and Active Test state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, { selectedOption: string | null; isMarkedForReview: boolean }>
  >({});

  // Countdown timer in seconds (120 min = 7200 sec)
  const [secondsRemaining, setSecondsRemaining] = useState(7200);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [evaluation, setEvaluation] = useState<ExamEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (examState === "RUNNING") {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  async function startExam() {
    try {
      const res = await fetch(
        `/api/student/exam/start?mode=${examMode}&subject=${encodeURIComponent(universitySubject)}`
      );
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);

        // Initialize responses
        const initMap: Record<
          string,
          { selectedOption: string | null; isMarkedForReview: boolean }
        > = {};
        data.questions.forEach((q: QuestionItem) => {
          initMap[q.id] = { selectedOption: null, isMarkedForReview: false };
        });
        setResponses(initMap);

        const durationSec = (data.durationMinutes || 120) * 60;
        setSecondsRemaining(durationSec);
        setExamState("RUNNING");
      }
    } catch {
      alert("Failed to load exam questions.");
    }
  }

  function handleSelectOption(opt: string) {
    const q = questions[currentIndex];
    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        selectedOption: opt,
      },
    }));
  }

  function handleClearResponse() {
    const q = questions[currentIndex];
    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        selectedOption: null,
      },
    }));
  }

  function handleToggleMarkReview() {
    const q = questions[currentIndex];
    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        isMarkedForReview: !prev[q.id]?.isMarkedForReview,
      },
    }));
  }

  async function autoSubmitExam() {
    await submitExam(true);
  }

  async function submitExam(isAuto = false) {
    if (examState !== "RUNNING") return;
    setIsSubmitting(true);

    try {
      const respArray = questions.map((q) => ({
        questionId: q.id,
        selectedOption: responses[q.id]?.selectedOption || null,
        isMarkedForReview: responses[q.id]?.isMarkedForReview || false,
      }));

      const totalDurationSec =
        examMode === "AIAPGET" ? 7200 : examMode === "UNIVERSITY" ? 3600 : 1800;
      const timeSpent = totalDurationSec - secondsRemaining;

      const res = await fetch("/api/student/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: examMode,
          responses: respArray,
          timeSpentSeconds: timeSpent,
          isAutoSubmitted: isAuto,
        }),
      });

      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setExamState("EVALUATED");
      }
    } catch {
      alert("Error submitting exam.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatTimer(totalSec: number) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }

  // Question counts
  const attemptedCount = Object.values(responses).filter((r) => r.selectedOption !== null).length;
  const markedCount = Object.values(responses).filter((r) => r.isMarkedForReview).length;
  const unattemptedCount = questions.length - attemptedCount;

  const currentQ = questions[currentIndex];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. SETUP SCREEN */}
      {examState === "SETUP" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 inline-block">
              <Award className="w-8 h-8" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              AIAPGET & University Exam Simulator
            </h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Simulate high-stakes national AIAPGET entrance and BHMS university professional examinations with realistic countdown timers and exact scoring rules (+4 / -1 / 0).
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Exam Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExamMode("AIAPGET")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    examMode === "AIAPGET"
                      ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20"
                      : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    National Level
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2">
                    AIAPGET Mock Test
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    120-minute countdown, 8 subjects, negative marking (+4 / -1).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExamMode("UNIVERSITY")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    examMode === "UNIVERSITY"
                      ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20"
                      : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    Subject Wise
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2">
                    University Exam
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    60-minute subject-specific examination.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExamMode("CUSTOM")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    examMode === "CUSTOM"
                      ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20"
                      : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Self-Paced
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2">
                    Custom Practice
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Quick 30-minute high-yield question drill.
                  </p>
                </button>
              </div>
            </div>

            {/* University Subject Filter */}
            {examMode === "UNIVERSITY" && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Subject:
                </label>
                <select
                  value={universitySubject}
                  onChange={(e) => setUniversitySubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Subjects Combined</option>
                  <option value="Materia Medica">Materia Medica</option>
                  <option value="Organon of Medicine">Organon of Medicine & Philosophy</option>
                  <option value="Repertory">Repertory</option>
                  <option value="Homoeopathic Pharmacy">Homoeopathic Pharmacy</option>
                  <option value="Practice of Medicine">Practice of Medicine</option>
                  <option value="Pathology">Pathology & Microbiology</option>
                  <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                </select>
              </div>
            )}

            {/* Exam Rules Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-500" /> Exam Rules & Marking Scheme:
              </span>
              <ul className="space-y-1 list-disc pl-5">
                <li>
                  <strong>Correct Answer:</strong> +4 Marks
                </li>
                <li>
                  <strong>Incorrect Answer (Negative Marking):</strong> -1 Mark
                </li>
                <li>
                  <strong>Unattempted:</strong> 0 Marks
                </li>
                <li>
                  <strong>Automatic Submission:</strong> Exam will automatically submit when the timer reaches 00:00:00.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={startExam}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Timer className="w-5 h-5" /> Start Simulated Examination
            </button>
          </div>
        </div>
      )}

      {/* 2. RUNNING EXAM SCREEN */}
      {examState === "RUNNING" && currentQ && (
        <div className="space-y-6">
          {/* Top Bar: Timer & Status Palette Bar */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {examMode} Simulator
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Working Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-bold border ${
                secondsRemaining < 300
                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-300 dark:border-rose-800 animate-pulse"
                  : "bg-slate-50 dark:bg-[#1A2234] text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              }`}
            >
              <Clock className="w-4 h-4 text-teal-500" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Quick Status Counts */}
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ● Attempted: {attemptedCount}
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                ● Review: {markedCount}
              </span>
              <span className="text-slate-400">● Unattempted: {unattemptedCount}</span>
            </div>
          </div>

          {/* Exam Body: Left Question Box | Right Question Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Question Box (8 Columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {currentQ.subject}
                    </span>
                    <span className="text-xs text-slate-400">{currentQ.topic}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    [+4 / -1 Marks]
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Question #{currentQ.number}:
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {[
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                  ].map((opt) => {
                    const isSelected = responses[currentQ.id]?.selectedOption === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(opt.key)}
                        className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-100"
                            : "bg-slate-50/70 dark:bg-[#1A2234]/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2234]"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleMarkReview}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        responses[currentQ.id]?.isMarkedForReview
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {responses[currentQ.id]?.isMarkedForReview
                        ? "Marked for Review"
                        : "Mark for Review"}
                    </button>

                    {responses[currentQ.id]?.selectedOption && (
                      <button
                        type="button"
                        onClick={handleClearResponse}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        Clear Response
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1"
                      >
                        Next <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => submitExam(false)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        Finish & Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Question Palette (4 Columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Palette
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {questions.length} Items
                  </span>
                </div>

                {/* Palette Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAttempted = responses[q.id]?.selectedOption !== null;
                    const isMarked = responses[q.id]?.isMarkedForReview;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all relative ${
                          isCurrent
                            ? "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 font-black"
                            : ""
                        } ${
                          isMarked
                            ? "bg-purple-600 text-white"
                            : isAttempted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Palette Legend */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
                    <span>Attempted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-purple-600 inline-block" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 inline-block" />
                    <span>Unattempted</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitExam(false)}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                >
                  {isSubmitting ? "Submitting..." : "Submit Examination"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST EXAM ANALYTICS DASHBOARD */}
      {examState === "EVALUATED" && evaluation && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Score Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Official Scorecard
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Examination Result & Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculation Model: (Correct × 4) - (Wrong × 1)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExamState("SETUP")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Another Test
                </button>
              </div>
            </div>

            {/* 5 Big Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1">
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase">
                  Total Score
                </span>
                <p className="text-2xl font-extrabold text-teal-900 dark:text-teal-100 font-mono">
                  {evaluation.totalScore}{" "}
                  <span className="text-xs font-normal text-teal-600">
                    / {evaluation.maxPossibleScore}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  Correct
                </span>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                  {evaluation.correctCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                  Wrong (-1)
                </span>
                <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 font-mono">
                  {evaluation.wrongCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Unattempted
                </span>
                <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-200 font-mono">
                  {evaluation.unattemptedCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                  Accuracy
                </span>
                <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
                  {evaluation.accuracyPercentage}%
                </p>
              </div>
            </div>

            {/* Weak Subjects Alert */}
            {evaluation.weakSubjects.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-amber-900 dark:text-amber-200">
                  <span className="font-bold text-sm block">
                    Actionable High-Yield Improvement Areas:
                  </span>
                  <p>
                    Performance in <strong>{evaluation.weakSubjects.join(", ")}</strong> fell below the 60% mastery threshold. Review Organon aphorisms and Materia Medica keynotes in the Concept Explorer before your next mock.
                  </p>
                </div>
              </div>
            )}

            {/* Subject Breakdown Bars */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subject-Wise Performance Breakdown:
              </h3>
              <div className="space-y-2">
                {evaluation.subjectBreakdown.map((sb) => (
                  <div
                    key={sb.subject}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sb.subject}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono text-[11px]">
                          Score: {sb.score} pts ({sb.correct} correct, {sb.wrong} wrong)
                        </span>
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                            sb.percentage >= 75
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : sb.percentage >= 60
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {sb.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sb.percentage >= 75
                            ? "bg-emerald-500"
                            : sb.percentage >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${sb.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Explanations Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Solutions & Verified Classical Citations:
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {evaluation.detailedQuestionResults.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                      item.isCorrect
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                        : item.userSelected === null
                        ? "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700"
                        : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-500">
                        Q{idx + 1}. {item.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.isCorrect
                            ? "bg-emerald-600 text-white"
                            : item.userSelected === null
                            ? "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {item.isCorrect
                          ? "+4 Correct"
                          : item.userSelected === null
                          ? "0 Unattempted"
                          : "-1 Wrong"}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {item.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div
                        className={`p-2 rounded-lg border ${
                          item.correctOption === "A"
                            ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-bold"
                            : item.userSelected === "A"
                            ? "bg-rose-100 dark:bg-rose-950 border-rose-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        A. {item.optionA}
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          item.correctOption === "B"
                            ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-bold"
                            : item.userSelected === "B"
                            ? "bg-rose-100 dark:bg-rose-950 border-rose-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        B. {item.optionB}
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          item.correctOption === "C"
                            ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-bold"
                            : item.userSelected === "C"
                            ? "bg-rose-100 dark:bg-rose-950 border-rose-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        C. {item.optionC}
                      </div>
                      <div
                        className={`p-2 rounded-lg border ${
                          item.correctOption === "D"
                            ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 font-bold"
                            : item.userSelected === "D"
                            ? "bg-rose-100 dark:bg-rose-950 border-rose-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        D. {item.optionD}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] space-y-1">
                      <span className="font-bold text-teal-600 dark:text-teal-400 block">
                        Clinical Explanation:
                      </span>
                      <p>{item.explanation}</p>
                      <span className="text-[10px] text-slate-400 font-mono block pt-1">
                        📖 Reference: {item.referenceBook}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
