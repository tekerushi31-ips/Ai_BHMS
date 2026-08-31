"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { BHMS_SUBJECTS } from "@/lib/constants";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function StudentQuizPage() {
  const [subject, setSubject] = useState(BHMS_SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (quizStarted && !results) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, results]);

  const handleStartQuiz = async () => {
    setLoading(true);
    setResults(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setSecondsElapsed(0);

    try {
      const res = await fetch(
        `/api/student/quiz/questions?subject=${encodeURIComponent(
          subject
        )}&difficulty=${difficulty}&count=${count}`
      );
      const data = await res.json();
      setQuestions(data.questions || []);
      setQuizStarted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    const q = questions[currentIdx];
    if (!q || results) return;
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting || Object.keys(selectedAnswers).length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/student/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          answers: selectedAnswers,
          timeSpentSec: secondsElapsed,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            BHMS Practice & Exam Quiz
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master university MCQs and AIAPGET question banks across 8 core BHMS subjects.
          </p>
        </div>

        {quizStarted && !results && (
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono flex items-center gap-2 border border-slate-800 dark:border-slate-700">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
        )}
      </div>

      {!quizStarted ? (
        /* Quiz Configuration Card */
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quiz Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize subject and question quantity for your test session.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
              >
                {BHMS_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXAM">University Exam Mode</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Questions Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
                >
                  <option value="3">3 Questions (Quick Drill)</option>
                  <option value="5">5 Questions (Standard)</option>
                  <option value="10">10 Questions (Full Test)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Loading Questions..." : "Start Timed Quiz"}
              </button>
            </div>
          </div>
        </div>
      ) : !results ? (
        /* Active Question Card */
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          {/* Question Index Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Topic: {currentQ?.topic}</span>
          </div>

          {/* Question Prompt */}
          <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentQ?.question}
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5 text-xs">
            {[
              { key: "A", text: currentQ?.optionA },
              { key: "B", text: currentQ?.optionB },
              { key: "C", text: currentQ?.optionC },
              { key: "D", text: currentQ?.optionD },
            ].map((opt) => {
              const isSelected = selectedAnswers[currentQ?.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs"
                      : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentIdx + 1 < questions.length ? (
              <button
                onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(selectedAnswers).length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                {submitting ? "Evaluating..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Results Breakdown Screen */
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-200/50 dark:border-emerald-800/50">
              {results.percentage >= 70 ? "🎉" : "📚"}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Completed</h2>
            <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {results.score} ({results.percentage}%)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Time taken: {formatTime(results.timeSpentSec)} • Results saved to your Learning Profile.
            </p>

            <button
              onClick={() => setQuizStarted(false)}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Take Another Quiz
            </button>
          </div>

          {/* Per Question Detailed Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Detailed Question Review
            </h3>

            {results.questionReview.map((rev: any, idx: number) => (
              <div
                key={rev.id}
                className={`p-5 rounded-2xl border ${
                  rev.isCorrect
                    ? "bg-white dark:bg-[#111827] border-emerald-200 dark:border-emerald-900/60"
                    : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {rev.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {idx + 1}. {rev.question}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${
                          rev.isCorrect
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        Your Answer: Option {rev.selectedOption}
                      </span>
                      {!rev.isCorrect && (
                        <span className="px-2 py-0.5 rounded font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          Correct: Option {rev.correctOption}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Explanation:</strong> {rev.explanation}
                    </div>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Ref: {rev.referenceBook}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
