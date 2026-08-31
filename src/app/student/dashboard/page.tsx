"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  UserCheck,
  FileSpreadsheet,
  Award,
  HelpCircle,
  TrendingUp,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Layers,
  FileText,
  PieChart,
  Users,
} from "lucide-react";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load student dashboard");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <LoadingSpinner label="Loading student learning metrics..." />;
  if (error) return <div className="text-rose-600 dark:text-rose-400 text-xs p-4">{error}</div>;

  const { user, metrics, weakSubjects, recommendations, recentQuizAttempts, recentVpSessions } = data;

  return (
    <div className="space-y-6 transition-colors">
      {/* Time-aware Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-clinical-700 to-clinical-900 rounded-2xl p-6 text-white shadow-card">
        <div>
          <div className="text-xs font-medium text-teal-200 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            BHMS Academic Companion
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getTimeGreeting()}, {user.name} 👋
          </h1>
          <p className="text-xs text-teal-100/80 mt-1">
            {user.year} • {user.college}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] text-teal-200">Study Streak</div>
              <div className="text-sm font-bold">{user.streakDays} Days</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-300" />
            <div>
              <div className="text-[10px] text-teal-200">Study Time</div>
              <div className="text-sm font-bold">{user.totalStudyHours} hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quizzes Completed</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.totalQuizzes}
          </div>
          <div className="text-[11px] text-clinical-600 dark:text-clinical-400 font-medium mt-1">
            Avg Score: {metrics.avgQuizScore !== null ? `${metrics.avgQuizScore}%` : "No attempts"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Viva Sessions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.totalVivas}
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">
            Avg Score: {metrics.avgVivaScore !== null ? `${metrics.avgVivaScore}%` : "No vivas yet"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Virtual Cases Solved</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.completedVpCases}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            History-taking practice
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Subjects Requiring Focus</div>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-1 truncate">
            {weakSubjects.length > 0 ? weakSubjects[0] : "All Strong"}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {weakSubjects.length > 0 ? `${weakSubjects.length} subject(s) < 60%` : "Mastery > 70%"}
          </div>
        </div>
      </div>

      {/* Main Navigation Modules Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Learning Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/student/ai-tutor"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-clinical-300 dark:hover:border-clinical-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-clinical-100 dark:bg-clinical-950/80 text-clinical-700 dark:text-clinical-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-clinical-200/50 dark:border-clinical-800/50">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                BHMS AI Tutor
                <span className="text-[10px] font-semibold bg-clinical-50 dark:bg-clinical-950 text-clinical-700 dark:text-clinical-400 border border-clinical-200 dark:border-clinical-800 px-1.5 py-0.5 rounded">
                  RAG Powered
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Chat with an intelligent tutor grounded in Organon, Boericke, and Kent Repertory.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-clinical-600 dark:text-clinical-400 gap-1">
              Start Discussion <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/virtual-patient"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-cyan-200/50 dark:border-cyan-800/50">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                Virtual Patient
                <span className="text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 px-1.5 py-0.5 rounded">
                  Interactive Anamnesis
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Take history from simulated patients with concealed symptoms and receive performance reports.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 gap-1">
              Examine Patient <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/viva"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-purple-300 dark:hover:border-purple-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-200/50 dark:border-purple-800/50">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                AI Viva Exam
                <span className="text-[10px] font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded">
                  Oral Grading
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time oral question answering with instant grade evaluation and model explanations.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1">
              Start Viva <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/quiz"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/50 dark:border-emerald-800/50">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                Practice Quiz
                <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                  8 Subjects
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Timed multiple choice questions for university exams and AIAPGET preparation.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
              Take Quiz <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/case-simulator"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-amber-300 dark:hover:border-amber-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-200/50 dark:border-amber-800/50">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                Case Simulator
                <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                  Step-by-Step
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Uncover chief complaints, modalities, and generals progressively with rubric selection.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1">
              Explore Case <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/progress"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-blue-300 dark:hover:border-blue-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-200/50 dark:border-blue-800/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                Study Progress
                <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                  Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Visual subject mastery scores, accuracy trends, and personalized study recommendations.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1">
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Advanced Clinical & Repertory Modules (7 Core Additions) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            Clinical & Repertorization Tools
          </h2>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
            7 Verified Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/student/repertorization"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-teal-400 dark:hover:border-teal-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-teal-200/50 dark:border-teal-800/50">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Repertorization Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kent rubrics search, dynamic Symptom Cart, and graded mathematical totality matrix.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 gap-1">
              Repertorize <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/materia-medica-comparator"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-indigo-200/50 dark:border-indigo-800/50">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Materia Medica Compare
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare 2–4 polycrests side-by-side on keynotes, modalities, and differentiating points.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1">
              Compare Remedies <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/exam-simulator"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-purple-400 dark:hover:border-purple-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-200/50 dark:border-purple-800/50">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AIAPGET Mock Exam
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                120-min working countdown timer, question palette, and negative marking scorecard.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1">
              Take Mock Test <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/logbook"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/50 dark:border-emerald-800/50">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Clinical Logbook
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Standardized 7-step clinical case builder, professor submission, and clean PDF export.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
              Open Logbook <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/organon-explorer"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-amber-400 dark:hover:border-amber-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-200/50 dark:border-amber-800/50">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Organon Explorer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dual-column original text reference with simplified study notes & visual flowcharts.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1">
              Explore Aphorisms <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/posology-miasm"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-cyan-400 dark:hover:border-cyan-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-cyan-200/50 dark:border-cyan-800/50">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Posology & Miasms
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Miasmatic distribution analyzer (Psora, Sycosis, Syphilis) & potency selection guide.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 gap-1">
              Analyze Miasms <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/student/mystery-cases"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-purple-400 dark:hover:border-purple-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-200/50 dark:border-purple-800/50">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Mystery Cases & Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Weekly de-identified clinical cases, submit totality reasoning, and peer discussions.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1">
              Solve Mystery Case <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/faculty"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-slate-400 dark:hover:border-slate-600 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-200/50 dark:border-slate-700/50">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Faculty Mentor Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clinical review portal for professors to grade student cases & provide feedback.
              </p>
            </div>
            <div className="pt-3 flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 gap-1">
              Mentor View <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recommended Next Actions (Real Data Backed) */}
      <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-900/90 border border-slate-800 text-white space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
          <BookOpen className="w-4 h-4 text-teal-400" />
          Recommended Next Study Activities (Computed from your performance data)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec: string, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-800 dark:bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Quiz Attempts
            </h3>
            <Link
              href="/student/quiz"
              className="text-[11px] font-semibold text-clinical-600 dark:text-clinical-400 hover:underline"
            >
              Take New Quiz
            </Link>
          </div>

          {recentQuizAttempts.length === 0 ? (
            <EmptyState
              title="No quiz attempts recorded"
              description="Complete your first quiz to see topic-wise breakdown here."
              actionLabel="Start Quiz"
              onAction={() => (window.location.href = "/student/quiz")}
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentQuizAttempts.map((q: any) => (
                <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{q.subject}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(q.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        q.percentage >= 70
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      {q.score} ({q.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Virtual Patient Sessions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Virtual Patient History
            </h3>
            <Link
              href="/student/virtual-patient"
              className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Start Case
            </Link>
          </div>

          {recentVpSessions.length === 0 ? (
            <EmptyState
              title="No patient simulations yet"
              description="Practice clinical history taking on interactive fictional cases."
              actionLabel="Start Virtual Patient"
              onAction={() => (window.location.href = "/student/virtual-patient")}
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentVpSessions.map((s: any) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[240px]">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{s.caseTitle}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        s.status === "COMPLETED"
                          ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                      }`}
                    >
                      {s.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
