"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Award,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  MessageSquare,
} from "lucide-react";

export default function MysteryCasesListPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    try {
      const res = await fetch("/api/student/mystery-cases");
      const data = await res.json();
      if (data.cases) setCases(data.cases);
    } catch {
      alert("Failed to load mystery cases.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Collaborative Mystery Case & Mentorship Hub
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solve weekly de-identified educational clinical cases, submit your totality reasoning to faculty mentors, and participate in peer clinical discussions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/faculty"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-purple-500" /> Faculty Mentor Portal
          </Link>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading weekly mystery cases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {c.weekLabel}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      c.hasSubmitted
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                        : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {c.hasSubmitted ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Submitted & Locked
                      </>
                    ) : (
                      "Active Challenge"
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.chiefComplaint}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Patient:</strong> {c.patientProfile?.age}y • {c.patientProfile?.gender} • {c.patientProfile?.occupation}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Difficulty:</strong> {c.difficulty}
                  </div>
                </div>

                {c.submissionScore !== null && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" /> Faculty Score:
                    </span>
                    <span className="font-mono text-sm">{c.submissionScore} / 100</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Closes weekly
                </span>

                <Link
                  href={`/student/mystery-cases/${c.id}`}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {c.hasSubmitted ? "View Solution & Discussion" : "Solve Case"} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
