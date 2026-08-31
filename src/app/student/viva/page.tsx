"use client";

import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Send,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { BHMS_SUBJECTS, VIVA_DIFFICULTIES } from "@/lib/constants";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function StudentVivaPage() {
  const [subject, setSubject] = useState(BHMS_SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [session, setSession] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [finalReport, setFinalReport] = useState<any | null>(null);

  const handleStartViva = async () => {
    setLoading(true);
    setEvalResult(null);
    setFinalReport(null);
    try {
      const res = await fetch("/api/student/viva/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          difficulty,
          questionCount: 3,
        }),
      });
      const data = await res.json();
      setSession(data.session);
      setCurrentQIndex(0);
      setCurrentQuestion(data.session.currentQuestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || loading || !session) return;

    setLoading(true);
    try {
      const res = await fetch("/api/student/viva/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vivaSessionId: session.id,
          questionIndex: currentQIndex,
          studentAnswer: answerInput,
        }),
      });
      const data = await res.json();
      setEvalResult(data);
      if (data.isCompleted) {
        setFinalReport(data.finalReport);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (evalResult?.nextQuestion) {
      setCurrentQuestion(evalResult.nextQuestion);
      setCurrentQIndex((prev) => prev + 1);
      setAnswerInput("");
      setEvalResult(null);
    }
  };

  const handleReset = () => {
    setSession(null);
    setEvalResult(null);
    setFinalReport(null);
    setAnswerInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Oral Viva Examination
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate realistic university viva exams with multi-round grading, rubric inquiries, and instant feedback.
          </p>
        </div>

        {session && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Viva Setup
          </button>
        )}
      </div>

      {/* Setup Form */}
      {!session ? (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Configure Viva Exam Parameters</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your target subject and difficulty level to begin.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                BHMS Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              >
                {BHMS_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VIVA_DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl font-semibold transition-all ${
                      difficulty === d
                        ? "bg-purple-600 dark:bg-purple-600 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleStartViva}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Preparing Examination..." : "Start AI Viva Exam"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Viva Examination Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Question & Student Answering */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                  Question {currentQIndex + 1} of {session.totalQuestions}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">{session.subject}</span>
              </div>

              {/* Examiner Question */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm leading-relaxed">
                {currentQuestion?.question}
              </div>

              {/* Answering Form or Evaluation Result */}
              {!evalResult ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Answer (Type your oral response):
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Explain keynotes, modalities, aphorism numbers, or pathological correlations clearly..."
                      className="w-full p-3.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !answerInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {loading ? "Examiner is evaluating..." : "Submit Oral Answer"}
                  </button>
                </form>
              ) : (
                /* Evaluation Breakdown */
                <div className="space-y-4 animate-in fade-in">
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      evalResult.grade === "CORRECT"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                        : evalResult.grade === "PARTIALLY_CORRECT"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200"
                    }`}
                  >
                    {evalResult.grade === "CORRECT" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : evalResult.grade === "PARTIALLY_CORRECT" ? (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 text-xs">
                      <div className="font-bold flex items-center gap-2">
                        <span>Grade: {evalResult.grade.replace("_", " ")}</span>
                        <span className="text-[11px] font-mono">
                          (+{evalResult.scoreObtained} pts)
                        </span>
                      </div>
                      <p className="leading-relaxed">{evalResult.modelExplanation}</p>
                    </div>
                  </div>

                  {/* Expected Keypoints */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      Authoritative Key Points Expected:
                    </div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {evalResult.correctKeypoints.map((kp: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!evalResult.isCompleted ? (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold text-xs text-center rounded-xl border border-purple-200 dark:border-purple-800">
                      Viva examination finished! Review your performance report on the right.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Viva Status & Final Report */}
          <div className="space-y-4">
            {finalReport ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Viva Report Card
                  </h3>
                  <span className="text-xl font-black text-purple-700 dark:text-purple-300">
                    {finalReport.totalScore}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">Examiner Remark:</div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {finalReport.examinerRemark}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Strong Topics:</div>
                  <div className="space-y-1 text-emerald-700 dark:text-emerald-400 text-[11px]">
                    {finalReport.strongTopics.length > 0 ? (
                      finalReport.strongTopics.map((t: string, i: number) => (
                        <div key={i}>✓ {t}</div>
                      ))
                    ) : (
                      <div className="text-slate-400 dark:text-slate-500">None identified</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 transition-colors"
                >
                  Start Another Viva
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Examination Guidelines
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <li>• State key modalities (&lt; aggravation, &gt; amelioration) clearly.</li>
                  <li>• Cite specific Aphorisms or Boericke keynotes where relevant.</li>
                  <li>• Answers are scored on precision of homoeopathic concepts.</li>
                </ul>
              </div>
            )}

            <ClinicalDisclaimer compact />
          </div>
        </div>
      )}
    </div>
  );
}
