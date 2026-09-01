"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sliders,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot,
  UserCheck,
  Mic,
  Search,
  History,
  Layers,
  Award,
  HelpCircle,
  BookOpen,
  FilePlus,
  Video,
  Heart,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminCopilotsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/copilots");
      if (!res.ok) throw new Error("Failed to load feature flags");
      const data = await res.json();
      setFlags(data.flags || {});
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (key: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setTogglingKey(key);
    setStatusMessage(null);

    // Optimistic UI update
    setFlags((prev) => ({ ...prev, [key]: newVal }));

    try {
      const res = await fetch("/api/admin/copilots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: newVal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFlags((prev) => ({ ...prev, [key]: currentVal }));
        setStatusMessage(data.error || "Failed to update feature flag");
      } else {
        setStatusMessage(`Feature '${key}' set to ${newVal ? "ON" : "OFF"}`);
      }
    } catch (e: any) {
      setFlags((prev) => ({ ...prev, [key]: currentVal }));
      setStatusMessage("Failed to update feature flag");
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading 4 Copilots Control Center..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Copilot Control Center (4 AI Systems)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enable or disable feature flags for Student AI, Doctor AI, Faculty AI, and Patient AI.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* FOUR COPILOT CONTROL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. STUDENT AI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-clinical-200 dark:border-clinical-900/60 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-clinical-50 dark:bg-clinical-950/80 text-clinical-600 dark:text-clinical-400 border border-clinical-200 dark:border-clinical-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">STUDENT AI</h2>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Status: Active
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "student:ai_tutor", label: "AI Tutor (RAG)", icon: Bot },
              { key: "student:virtual_patient", label: "Virtual Patient Sim", icon: UserCheck },
              { key: "student:repertorization", label: "Repertorization", icon: Layers },
              { key: "student:materia_medica", label: "Materia Medica Diffs", icon: BookOpen },
              { key: "student:quiz", label: "Practice Quiz Bank", icon: HelpCircle },
              { key: "student:viva", label: "AI Viva Examiner", icon: Award },
              { key: "student:aiapget", label: "AIAPGET Exam Sim", icon: Award },
              { key: "student:organon", label: "Organon Explorer", icon: BookOpen },
              { key: "student:logbook", label: "Clinical Logbook", icon: FilePlus },
            ].map((module) => {
              const Icon = module.icon;
              const isEnabled = flags[module.key] ?? true;
              const isProcessing = togglingKey === module.key;

              return (
                <div
                  key={module.key}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-clinical-600 dark:text-clinical-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{module.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(module.key, isEnabled)}
                    disabled={isProcessing}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DOCTOR AI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">DOCTOR AI</h2>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Status: Active
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "doctor:clinical_ai", label: "Clinical Copilot", icon: Stethoscope },
              { key: "doctor:voice_ai", label: "Voice Case Taking (STT)", icon: Mic },
              { key: "doctor:rag_search", label: "Knowledge Search", icon: Search },
              { key: "doctor:repertory", label: "Repertory Assistant", icon: Layers },
              { key: "doctor:followup_ai", label: "Follow-up AI", icon: History },
            ].map((module) => {
              const Icon = module.icon;
              const isEnabled = flags[module.key] ?? true;
              const isProcessing = togglingKey === module.key;

              return (
                <div
                  key={module.key}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{module.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(module.key, isEnabled)}
                    disabled={isProcessing}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. FACULTY AI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">FACULTY AI</h2>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Status: Active
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "faculty:mystery_cases", label: "Mystery Cases", icon: HelpCircle },
              { key: "faculty:case_review", label: "Submission Review", icon: BookOpen },
              { key: "faculty:feedback_ai", label: "Feedback Assistant", icon: Bot },
              { key: "faculty:evaluation", label: "Academic Evaluation", icon: Award },
            ].map((module) => {
              const Icon = module.icon;
              const isEnabled = flags[module.key] ?? true;
              const isProcessing = togglingKey === module.key;

              return (
                <div
                  key={module.key}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{module.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(module.key, isEnabled)}
                    disabled={isProcessing}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. PATIENT AI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">PATIENT AI</h2>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Status: Active
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "patient:health_assistant", label: "Health Information Assistant", icon: Bot },
              { key: "patient:record_summary", label: "Record Summary AI", icon: FileText },
              { key: "patient:appointment_help", label: "Appointment Scheduling Help", icon: Calendar },
              { key: "patient:question_prep", label: "Question Preparation", icon: MessageSquare },
            ].map((module) => {
              const Icon = module.icon;
              const isEnabled = flags[module.key] ?? true;
              const isProcessing = togglingKey === module.key;

              return (
                <div
                  key={module.key}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{module.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(module.key, isEnabled)}
                    disabled={isProcessing}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
