"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  User,
  Sparkles,
  Send,
  Lock,
  MessageSquare,
  Award,
  CheckCircle,
  Check,
  Clock,
  BookOpen,
} from "lucide-react";

export default function MysteryCaseSolverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Student Input Form
  const [suggestedRemedy, setSuggestedRemedy] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [miasmAnalysis, setMiasmAnalysis] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Comment input
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  async function fetchCaseDetail() {
    try {
      const res = await fetch(`/api/student/mystery-cases/${id}`);
      const data = await res.json();
      if (data.case) {
        setCaseData(data.case);
        setUserSubmission(data.userSubmission);
        setComments(data.comments || []);
        setIsRevealed(data.isRevealed);

        if (data.userSubmission) {
          setSuggestedRemedy(data.userSubmission.suggestedRemedy);
          setReasoning(data.userSubmission.reasoning);
          setMiasmAnalysis(data.userSubmission.miasmAnalysis || "");
        }
      }
    } catch {
      alert("Failed to load mystery case.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitSolution(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestedRemedy.trim() || !reasoning.trim()) {
      alert("Please enter your suggested remedy and clinical reasoning.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/mystery-cases/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestedRemedy,
          reasoning,
          miasmAnalysis,
        }),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        setUserSubmission(data.submission);
        setIsRevealed(true);
        if (data.actualRemedy) {
          setCaseData((prev: any) => ({
            ...prev,
            actualRemedyHidden: data.actualRemedy,
            actualRationale: data.actualRationale,
          }));
        }
        alert("Your case solution has been submitted and locked for faculty evaluation!");
      } else {
        alert(data.error || "Submission failed.");
      }
    } catch {
      alert("Network error submitting solution.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const res = await fetch(`/api/student/mystery-cases/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: id,
          content: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      }
    } catch {
      alert("Failed to post comment.");
    } finally {
      setCommenting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading mystery case anamnesis...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Mystery case not found. <Link href="/student/mystery-cases" className="text-purple-600 underline">Back to cases</Link>
      </div>
    );
  }

  const isLocked = !!userSubmission;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link
            href="/student/mystery-cases"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Weekly Mystery Cases
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {caseData.weekLabel}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {caseData.title}
            </h1>
          </div>
        </div>

        <div>
          {isLocked ? (
            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
              <CheckCircle className="w-4 h-4" /> Status: Submitted & Locked
            </span>
          ) : (
            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Submission Open
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Case Narrative | Right Solver Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case Anamnesis Narrative (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase text-slate-400">
                Patient Profile:
              </span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1">
                {caseData.patientProfile?.age} Years Old • {caseData.patientProfile?.gender} • {caseData.patientProfile?.occupation}
              </p>
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">
                Chief Complaint:
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A2234] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                {caseData.chiefComplaint}
              </p>
            </div>

            {/* Narrative Sections */}
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                  History of Present Illness:
                </strong>
                <p>{caseData.caseNarrative?.presentIllness}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                  Modalities & Sensations:
                </strong>
                <p>{caseData.caseNarrative?.modalitiesAndSensations}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                  Generals & Thermal State:
                </strong>
                <p>{caseData.caseNarrative?.generalsAndThermal}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                  Mental Disposition:
                </strong>
                <p>{caseData.caseNarrative?.mentalCharacteristics}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                  Clinical Investigations:
                </strong>
                <p>{caseData.caseNarrative?.investigations}</p>
              </div>
            </div>

            {/* Symptoms Key Checklist */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                Extracted Kent Rubrics for Synthesis:
              </span>
              <ul className="space-y-1 text-xs text-purple-950 dark:text-purple-200">
                {caseData.symptomsList?.map((sym: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Submission & Faculty Solution Box (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Submission Form */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> Your Diagnostic Synthesis
              </h2>
              {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Proposed Similimum & Potency *
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={suggestedRemedy}
                  onChange={(e) => setSuggestedRemedy(e.target.value)}
                  placeholder="e.g. Gelsemium Sempervirens 200C"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 font-bold text-teal-600 dark:text-teal-400 text-sm disabled:opacity-80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Totality Reasoning & Rubric Justification *
                </label>
                <textarea
                  rows={4}
                  disabled={isLocked}
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Detail your clinical repertorization reasoning, why this remedy fits best over other differentials..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs disabled:opacity-80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Miasmatic Considerations
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={miasmAnalysis}
                  onChange={(e) => setMiasmAnalysis(e.target.value)}
                  placeholder="e.g. Acute Psora with neuromuscular weakness"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs disabled:opacity-80"
                />
              </div>

              {!isLocked && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit to Professor & Unlock Discussion
                </button>
              )}
            </form>

            {userSubmission?.score !== null && userSubmission?.score !== undefined && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-emerald-600" /> Faculty Mentor Score:
                  </span>
                  <span className="font-mono text-sm">{userSubmission.score} / 100</span>
                </div>
                {userSubmission.facultyFeedback && (
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200 italic pt-1">
                    "{userSubmission.facultyFeedback}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Solution Reveal Box (Once Submitted) */}
          {isRevealed && caseData.actualRemedyHidden && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-emerald-300 dark:border-emerald-800/80 p-6 shadow-xs space-y-3 bg-emerald-50/20">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Official Clinical Solution
              </span>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                Correct Similimum: {caseData.actualRemedyHidden}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {caseData.actualRationale}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Community Discussion & Peer Feedback Forum */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Scholars' Peer Discussion Forum ({comments.length} Comments)
            </h2>
          </div>
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share clinical insights, alternative rubric combinations, or ask questions..."
            className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={commenting || !newComment.trim()}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors shrink-0"
          >
            {commenting ? "Posting..." : "Comment"}
          </button>
        </form>

        {/* Comments Feed */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No peer discussion comments yet. Be the first to share your clinical reasoning!
            </p>
          ) : (
            comments.map((cm) => (
              <div
                key={cm.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cm.userName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {cm.userRole}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(cm.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 pt-0.5">{cm.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
