"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sliders, CheckCircle, AlertCircle, Loader2, Sparkles, Shield, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/copilots");
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
        setStatusMessage(`Feature '${key}' updated to ${newVal ? "ENABLED" : "DISABLED"}`);
      }
    } catch (e) {
      setFlags((prev) => ({ ...prev, [key]: currentVal }));
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Global Feature Flags..." />;

  const featureGroups = [
    {
      title: "Student Copilot Features",
      keys: [
        { key: "student:ai_tutor", label: "BHMS AI Tutor (RAG Grounded)" },
        { key: "student:virtual_patient", label: "Virtual Patient Simulator" },
        { key: "student:repertorization", label: "Repertorization Engine" },
        { key: "student:materia_medica", label: "Materia Medica Compare" },
        { key: "student:quiz", label: "Practice Quiz Bank" },
        { key: "student:viva", label: "AI Viva Examiner" },
        { key: "student:aiapget", label: "AIAPGET Exam Simulator" },
        { key: "student:organon", label: "Organon Explorer" },
        { key: "student:logbook", label: "Clinical Logbook" },
      ],
    },
    {
      title: "Doctor Copilot Features",
      keys: [
        { key: "doctor:clinical_ai", label: "Clinical AI Copilot" },
        { key: "doctor:voice_ai", label: "Voice Case Taking (Speech-to-Text)" },
        { key: "doctor:rag_search", label: "Verified Knowledge RAG Search" },
        { key: "doctor:repertory", label: "Repertory Assistant" },
        { key: "doctor:followup_ai", label: "Follow-up Trajectory Analyzer" },
      ],
    },
    {
      title: "Faculty Copilot Features",
      keys: [
        { key: "faculty:mystery_cases", label: "Mystery Cases Management" },
        { key: "faculty:case_review", label: "Student Submission Review" },
        { key: "faculty:feedback_ai", label: "Feedback AI Assistant" },
        { key: "faculty:evaluation", label: "Academic Rubric Evaluator" },
      ],
    },
    {
      title: "Patient AI Features",
      keys: [
        { key: "patient:health_assistant", label: "Health Information Assistant" },
        { key: "patient:record_summary", label: "Record Summary Assistant" },
        { key: "patient:appointment_help", label: "Appointment Scheduling Help" },
        { key: "patient:question_prep", label: "Doctor Question Preparation" },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Global Feature Flags Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Persisted in Supabase. When a feature flag is disabled, corresponding portals will gracefully adapt.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {statusMessage && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {featureGroups.map((group) => (
          <div
            key={group.title}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {group.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.keys.map((item) => {
                const isEnabled = flags[item.key] ?? true;
                const isProcessing = togglingKey === item.key;

                return (
                  <div
                    key={item.key}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {isEnabled ? (
                        <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(item.key, isEnabled)}
                      disabled={isProcessing}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
