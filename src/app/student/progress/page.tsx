"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

export default function StudentProgressPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/progress")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Compiling performance analytics..." />;
  if (!data) return <div className="text-xs text-rose-600">Failed to load progress data</div>;

  const { metrics, subjectMastery, actionPlan, recentQuizHistory, recentVivaHistory } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Academic Progress & Mastery Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics aggregated across all your quiz attempts, viva examinations, and simulated case encounters.
        </p>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Quizzes</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalQuizzes}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {metrics.avgQuizAccuracy}% Avg Accuracy
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Oral Vivas Graded</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalVivas}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">University Viva Mode</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Virtual Cases Solved</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalVpCases}</div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">Simulated Anamnesis</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Subjects</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{subjectMastery.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Tracked in syllabus</div>
        </div>
      </div>

      {/* Subject Mastery Progress Bars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Subject Mastery Breakdown
        </h2>

        <div className="space-y-4">
          {subjectMastery.map((sm: any) => (
            <div key={sm.subject} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                <span>{sm.subject}</span>
                <span className="text-slate-900 dark:text-white font-bold">{sm.masteryLevel}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sm.masteryLevel >= 75
                      ? "bg-emerald-500"
                      : sm.masteryLevel >= 55
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${sm.masteryLevel}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                <span>Quizzes: {sm.quizzesTaken}</span>
                <span>Vivas: {sm.vivaCount}</span>
                <span>Cases: {sm.casesSolved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Data-Derived Action Plan */}
      <div className="p-5 rounded-2xl bg-slate-900 dark:bg-[#0c121e] border border-slate-800 text-white space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
          <BookOpen className="w-4 h-4 text-teal-400" />
          Data-Driven Academic Revision Plan
        </div>

        <div className="space-y-2 text-xs">
          {actionPlan.map((plan: string, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-800 dark:bg-slate-900/90 border border-slate-700/80 dark:border-slate-800 text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{plan}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attempt History Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Quiz History
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentQuizHistory.map((q: any) => (
              <div key={q.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{q.subject}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-800">
                  {q.correctCount}/{q.totalQuestions} ({q.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Viva Exam History
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentVivaHistory.map((v: any) => (
              <div key={v.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{v.subject}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded text-[11px] border border-purple-200 dark:border-purple-800">
                  {v.score ? `${v.score}%` : "Incomplete"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
