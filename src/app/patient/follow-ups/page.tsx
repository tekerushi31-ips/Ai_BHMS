"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Award,
} from "lucide-react";

export default function PatientFollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [currentSymptoms, setCurrentSymptoms] = useState("");
  const [previousSeverity, setPreviousSeverity] = useState(7);
  const [currentSeverity, setCurrentSeverity] = useState(3);
  const [symptomChange, setSymptomChange] = useState("IMPROVED");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [questionsForDoctor, setQuestionsForDoctor] = useState("");

  useEffect(() => {
    fetchFollowups();
  }, []);

  async function fetchFollowups() {
    try {
      const res = await fetch("/api/patient/follow-ups");
      const data = await res.json();
      if (data.followups) setFollowups(data.followups);
    } catch {
      alert("Failed to load follow-ups.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentSymptoms.trim()) {
      alert("Please describe your current symptoms.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/patient/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSymptoms,
          previousSeverity,
          currentSeverity,
          symptomChange,
          newSymptoms,
          questionsForDoctor,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Your follow-up report has been submitted to Dr. Sharma!");
        setCurrentSymptoms("");
        setNewSymptoms("");
        setQuestionsForDoctor("");
        fetchFollowups();
      } else {
        alert(data.error || "Failed to submit follow-up.");
      }
    } catch {
      alert("Network error submitting follow-up.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Patient Symptom Follow-ups & Progress Tracker
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit periodic recovery updates, rate your symptom intensity, and receive doctor guidance between clinical visits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submit New Follow-up Form (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" /> New Follow-up Submission
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Current Symptoms & Flare-up Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={currentSymptoms}
                  onChange={(e) => setCurrentSymptoms(e.target.value)}
                  placeholder="Describe your current state (e.g. morning sneezing reduced, no itchy eyes)..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Severity Comparison Slider / Number */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">
                    Previous Severity (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={previousSeverity}
                    onChange={(e) => setPreviousSeverity(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border font-mono font-bold text-center text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-600 dark:text-emerald-400">
                    Current Severity (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={currentSeverity}
                    onChange={(e) => setCurrentSeverity(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-700 font-mono font-bold text-center text-sm text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Change Trend */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Overall Symptom Change
                </label>
                <select
                  value={symptomChange}
                  onChange={(e) => setSymptomChange(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <option value="IMPROVED">✨ Improved / Better</option>
                  <option value="UNCHANGED">⚖️ Unchanged / Same</option>
                  <option value="AGGRAVATED">⚠️ Aggravated / Worse</option>
                </select>
              </div>

              {/* New Symptoms */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Any New Symptoms Noticed?
                </label>
                <input
                  type="text"
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="e.g. Mild dryness of throat in evening..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Questions for Doctor */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Specific Questions for Doctor
                </label>
                <textarea
                  rows={2}
                  value={questionsForDoctor}
                  onChange={(e) => setQuestionsForDoctor(e.target.value)}
                  placeholder="Questions regarding remedy dosage, diet, or next visit..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Send Follow-up to Doctor"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: History & Doctor Replies (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Past Submissions & Doctor Responses ({followups.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-slate-500">Loading follow-up history...</p>
            </div>
          ) : followups.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              No previous follow-up submissions recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {followups.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      📅 {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        f.status === "REVIEWED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      Status: {f.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        Severity: {f.previousSeverity} → {f.currentSeverity} / 10
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                        {f.symptomChange}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{f.currentSymptoms}</p>
                    {f.questionsForDoctor && (
                      <p className="text-slate-500 italic text-[11px]">
                        <strong>Your Question:</strong> "{f.questionsForDoctor}"
                      </p>
                    )}
                  </div>

                  {f.doctorReply && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Doctor's Clinical Review:
                      </span>
                      <p className="leading-relaxed">{f.doctorReply}</p>
                      {f.reviewedAt && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block pt-1 font-mono">
                          Reviewed on {new Date(f.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
