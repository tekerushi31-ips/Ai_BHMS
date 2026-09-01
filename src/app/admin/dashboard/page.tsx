"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Bot,
  Stethoscope,
  GraduationCap,
  Activity,
  Server,
  Settings,
  ArrowRight,
  FileCheck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Search,
  History,
  Layers,
  Award,
  Video,
  Database,
  Sliders,
  FileText,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load admin officer dashboard");
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

  if (loading) return <LoadingSpinner label="Loading Master Admin Officer Portal..." />;
  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-400 font-semibold text-xs">
        {error || "Failed to load admin overview."}
      </div>
    );
  }

  const { metrics, copilots, systemHealth, recentAuditLogs } = data;

  return (
    <div className="space-y-6 transition-colors max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Master Admin Officer Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized Control & Monitoring for Student, Doctor, and Faculty Copilots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/copilots"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            Copilot Control Center
          </Link>
          <Link
            href="/admin/ai-settings"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            AI Settings
          </Link>
        </div>
      </div>

      {/* Primary Metrics Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Registered Users</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.users.total}</div>
          <div className="text-[11px] text-clinical-600 dark:text-clinical-400 font-medium mt-1">
            {metrics.users.students} Students • {metrics.users.doctors} Doctors
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total AI Interactions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.copilotUsage.studentAiSessions + metrics.copilotUsage.doctorAiRequests}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            RAG Grounded Conversations
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Appointments & Cases</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.clinicalActivity.appointments + metrics.clinicalActivity.clinicalCases}
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">
            {metrics.clinicalActivity.activeConsultations} Active Consultations
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Knowledge Corpus</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.clinicalActivity.knowledgeDocs}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Verified Organon & Boericke
          </div>
        </div>
      </div>

      {/* THREE COPILOT CONTROL CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Copilot Control Center Status
          </h2>
          <Link
            href="/admin/copilots"
            className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Manage Feature Switches →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Student Copilot Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-clinical-200 dark:border-clinical-900/60 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-clinical-50 dark:bg-clinical-950/80 text-clinical-600 dark:text-clinical-400 border border-clinical-200 dark:border-clinical-800">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">STUDENT COPILOT</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Learning AI & Exam Engine</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {copilots.student.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>AI Tutor (RAG):</span>
                <span className={`font-bold ${copilots.student.flags.aiTutor ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.student.flags.aiTutor ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Virtual Patient Sim:</span>
                <span className={`font-bold ${copilots.student.flags.virtualPatient ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.student.flags.virtualPatient ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>AI Viva Examiner:</span>
                <span className={`font-bold ${copilots.student.flags.aiViva ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.student.flags.aiViva ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Practice Quiz Bank:</span>
                <span className={`font-bold ${copilots.student.flags.practiceQuiz ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.student.flags.practiceQuiz ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <Link
              href="/admin/copilots"
              className="w-full py-2 bg-clinical-50 dark:bg-clinical-950/60 text-clinical-700 dark:text-clinical-300 hover:bg-clinical-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Configure Student Copilot
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 2. Doctor Copilot Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">DOCTOR COPILOT</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Clinical Decision Support</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {copilots.doctor.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Voice Case Taking (STT):</span>
                <span className={`font-bold ${copilots.doctor.flags.voiceAi ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.doctor.flags.voiceAi ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Verified RAG Search:</span>
                <span className={`font-bold ${copilots.doctor.flags.ragSearch ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.doctor.flags.ragSearch ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Follow-up Analyzer:</span>
                <span className={`font-bold ${copilots.doctor.flags.followupAi ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.doctor.flags.followupAi ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Clinical Decision AI:</span>
                <span className={`font-bold ${copilots.doctor.flags.clinicalAi ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.doctor.flags.clinicalAi ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            <Link
              href="/admin/copilots"
              className="w-full py-2 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Configure Doctor Copilot
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 3. Faculty Copilot Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">FACULTY COPILOT</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Mentor & Case Evaluation</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {copilots.faculty.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Case Submission Review:</span>
                <span className={`font-bold ${copilots.faculty.flags.caseReview ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.faculty.flags.caseReview ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Feedback AI Assistant:</span>
                <span className={`font-bold ${copilots.faculty.flags.feedbackAi ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.faculty.flags.feedbackAi ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Mystery Cases Hub:</span>
                <span className={`font-bold ${copilots.faculty.flags.mysteryCases ? "text-emerald-600" : "text-slate-400"}`}>
                  {copilots.faculty.flags.mysteryCases ? "ON" : "OFF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Evaluation Rubrics:</span>
                <span className="font-bold text-emerald-600">ON</span>
              </div>
            </div>

            <Link
              href="/admin/copilots"
              className="w-full py-2 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Configure Faculty Copilot
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* System Health & Quick Management Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              Live System Health
            </h3>
            <Link
              href="/admin/system-health"
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Detailed Monitor →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Database Engine:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                🟢 {systemHealth.supabase}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">AI Provider (Gemini):</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                🟢 {systemHealth.aiService}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">RAG Knowledge Search:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                🟢 {systemHealth.ragSearch}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Video Consultation:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                🟢 {systemHealth.videoService}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation Grid */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Admin Officer Management Modules
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/users"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-clinical-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">User Accounts</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Role & Activation</div>
              </div>
            </Link>

            <Link
              href="/admin/knowledge"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <FileCheck className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Knowledge RAG</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Verify & Publish</div>
              </div>
            </Link>

            <Link
              href="/admin/copilots"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <Sliders className="w-5 h-5 text-cyan-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Feature Toggles</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Copilot Control</div>
              </div>
            </Link>

            <Link
              href="/admin/ai-settings"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <Bot className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">AI Config</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Model & Prompts</div>
              </div>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <History className="w-5 h-5 text-rose-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Audit Trail</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Security Logging</div>
              </div>
            </Link>

            <Link
              href="/admin/system-health"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">System Health</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Status Monitors</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
