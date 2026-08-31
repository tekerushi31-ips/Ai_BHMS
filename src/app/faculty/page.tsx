"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  CheckCircle,
  FileText,
  HelpCircle,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function FacultyMentorDashboard() {
  const [activeTab, setActiveTab] = useState<"LOGBOOKS" | "MYSTERY_CASES">("LOGBOOKS");
  const [submittedLogbooks, setSubmittedLogbooks] = useState<any[]>([]);
  const [mysterySubmissions, setMysterySubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active item for grading modal
  const [gradingItem, setGradingItem] = useState<{
    type: "LOGBOOK" | "MYSTERY_CASE";
    id: string;
    studentName: string;
    title: string;
    score: string;
    feedback: string;
  } | null>(null);

  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch("/api/faculty/submissions");
      const data = await res.json();
      if (data.submittedLogbooks) setSubmittedLogbooks(data.submittedLogbooks);
      if (data.mysterySubmissions) setMysterySubmissions(data.mysterySubmissions);
    } catch {
      alert("Failed to load faculty submissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingItem) return;

    setIsSubmittingGrade(true);
    try {
      const res = await fetch("/api/faculty/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: gradingItem.type,
          id: gradingItem.id,
          score: gradingItem.score,
          feedback: gradingItem.feedback,
          status: "REVIEWED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Evaluation score & feedback successfully recorded!");
        setGradingItem(null);
        fetchSubmissions();
      }
    } catch {
      alert("Failed to save grading.");
    } finally {
      setIsSubmittingGrade(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Faculty Mentor & Clinical Evaluation Hub
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student clinical logbook cases, evaluate weekly mystery case totality reasoning, and provide structured academic feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/mystery-cases"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-purple-500" /> Student Cases View
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("LOGBOOKS")}
          className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "LOGBOOKS"
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Clinical Logbooks ({submittedLogbooks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MYSTERY_CASES")}
          className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "MYSTERY_CASES"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Mystery Case Submissions ({mysterySubmissions.length})</span>
        </button>
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading student submissions for review...</p>
        </div>
      ) : activeTab === "LOGBOOKS" ? (
        <div className="space-y-4">
          {submittedLogbooks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
              No clinical logbooks submitted by students yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submittedLogbooks.map((lb) => (
                <div
                  key={lb.id}
                  className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                        OPD: {lb.patientIdOrOpd}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          lb.status === "REVIEWED"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        }`}
                      >
                        {lb.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                        {lb.chiefComplaint}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Student: <strong>{lb.user?.name}</strong> ({lb.department})
                      </p>
                    </div>

                    {lb.remedyPrescribed && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Student's Prescription:
                        </span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          {lb.remedyPrescribed} ({lb.potencyPosology || "200C"})
                        </span>
                      </div>
                    )}

                    {lb.facultyScore !== null && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
                        <span>Current Score:</span>
                        <span>{lb.facultyScore} / 100</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/student/logbook/${lb.id}`}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      View Full Record
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setGradingItem({
                          type: "LOGBOOK",
                          id: lb.id,
                          studentName: lb.user?.name || "Student",
                          title: `OPD: ${lb.patientIdOrOpd} (${lb.chiefComplaint.slice(0, 30)}...)`,
                          score: lb.facultyScore ? String(lb.facultyScore) : "85",
                          feedback: lb.facultyFeedback || "",
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                    >
                      {lb.status === "REVIEWED" ? "Edit Feedback" : "Grade Case"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {mysterySubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
              No mystery case submissions received from students yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mysterySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        {sub.case?.weekLabel || "Weekly Challenge"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          sub.status === "REVIEWED"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {sub.case?.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scholar: <strong>{sub.user?.name}</strong>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 block">
                          Suggested Remedy:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sub.suggestedRemedy}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Clinical Reasoning:
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                          "{sub.reasoning}"
                        </p>
                      </div>
                    </div>

                    {sub.score !== null && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
                        <span>Assigned Score:</span>
                        <span>{sub.score} / 100</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setGradingItem({
                          type: "MYSTERY_CASE",
                          id: sub.id,
                          studentName: sub.user?.name || "Student",
                          title: `${sub.case?.title} - ${sub.suggestedRemedy}`,
                          score: sub.score ? String(sub.score) : "90",
                          feedback: sub.facultyFeedback || "",
                        })
                      }
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      {sub.status === "REVIEWED" ? "Edit Review" : "Evaluate & Score"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grading & Feedback Modal */}
      {gradingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Faculty Clinical Assessment
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Evaluate: {gradingItem.studentName}
              </h2>
              <p className="text-xs text-slate-500 truncate">{gradingItem.title}</p>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Assessment Score (0 – 100 Marks) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradingItem.score}
                  onChange={(e) =>
                    setGradingItem((prev: any) => ({ ...prev, score: e.target.value }))
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-base font-bold font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Professor's Feedback & Clinical Teaching Points *
                </label>
                <textarea
                  rows={4}
                  value={gradingItem.feedback}
                  onChange={(e) =>
                    setGradingItem((prev: any) => ({ ...prev, feedback: e.target.value }))
                  }
                  placeholder="Provide structured feedback on rubric selection, miasmatic evaluation, and differential Materia Medica accuracy..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  {isSubmittingGrade ? "Saving..." : "Submit Grade & Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
