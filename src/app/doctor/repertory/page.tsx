"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  CheckCircle,
  Sparkles,
  BookOpen,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { RepertoryMatch } from "@/types";
import { ClinicalDisclaimer } from "@/components/common";

export default function DoctorRepertoryPage() {
  const [symptomText, setSymptomText] = useState("");
  const [chapterFilter, setChapterFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<RepertoryMatch[]>([]);
  const [confirmedRubrics, setConfirmedRubrics] = useState<RepertoryMatch[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sampleQueries = [
    "Anxiety before an important event followed by loose stool",
    "Headache from sunrise to sunset with throbbing hammers",
    "Burning pain in stomach relieved by warm drinks",
    "Distension and gas immediately after a few mouthfuls",
    "Joint stiffness worse on beginning motion, better continuing",
  ];

  const handleSearch = async (queryText?: string) => {
    const query = queryText || symptomText;
    if (!query.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/doctor/repertory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptomText: query,
          chapterFilter,
        }),
      });
      const data = await res.json();
      setMatches(data.matches || []);
      setStatusMessage(data.message || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRubric = (rubric: RepertoryMatch) => {
    if (!confirmedRubrics.some((r) => r.id === rubric.id)) {
      setConfirmedRubrics((prev) => [...prev, rubric]);
    }
  };

  const handleRemoveConfirmed = (id: string) => {
    setConfirmedRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Repertory Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convert natural language symptoms into authoritative Kent Repertory rubrics with required manual doctor confirmation.
          </p>
        </div>
      </div>

      {/* Search Bar & Chapter Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="Describe symptom: (e.g. 'Anxiety before exam with diarrhea', 'Sun headache worse 10 AM')..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
            />
          </div>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 font-medium"
          >
            <option value="ALL">All Repertory Chapters</option>
            <option value="MIND">Mind</option>
            <option value="HEAD">Head</option>
            <option value="STOMACH">Stomach</option>
            <option value="ABDOMEN">Abdomen</option>
            <option value="RECTUM">Rectum / Stool</option>
            <option value="GENERALITIES">Generalities</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? "Searching..." : "Find Rubrics"}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Try Prompt:</span>
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setSymptomText(q);
                handleSearch(q);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-600 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-300 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
          <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grid: Matches on Left, Confirmed Repertorization Basket on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Candidate Rubrics */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Candidate Rubric Matches ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft text-slate-400 dark:text-slate-500 text-xs">
              Enter a symptom description above to search Kent's Repertory rubrics and graded remedy candidates.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => {
                const isConfirmed = confirmedRubrics.some((r) => r.id === m.id);
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono font-bold text-xs text-purple-950 dark:text-purple-300">
                          {m.rubric}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Chapter: {m.chapter}</span>
                          <span>•</span>
                          <span>{m.source}</span>
                          <span>•</span>
                          <span className="font-semibold text-purple-700 dark:text-purple-400">
                            Confidence: {Math.round(m.confidenceScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmRubric(m)}
                        disabled={isConfirmed}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isConfirmed
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                            : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-xs"
                        }`}
                      >
                        {isConfirmed ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Confirm Rubric
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#1A2234] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {m.explanation}
                    </p>

                    {/* Graded Remedies */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                        Graded Remedies in Rubric:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.relatedRemedies.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              r.grade === 3
                                ? "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 font-bold border border-purple-200 dark:border-purple-800"
                                : r.grade === 2
                                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 italic border border-purple-100 dark:border-purple-900/60"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-normal"
                            }`}
                          >
                            {r.name} (Grade {r.grade})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Confirmed Repertorization Basket */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Doctor Confirmed Rubrics ({confirmedRubrics.length})
              </h3>
              {confirmedRubrics.length > 0 && (
                <button
                  onClick={() => setConfirmedRubrics([])}
                  className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {confirmedRubrics.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center py-6">
                No rubrics confirmed yet. Review the candidate matches on the left and click <strong>"Confirm Rubric"</strong> to add them to your prescription totality.
              </p>
            ) : (
              <div className="space-y-2">
                {confirmedRubrics.map((cr) => (
                  <div
                    key={cr.id}
                    className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 text-xs space-y-1 relative group"
                  >
                    <div className="font-mono font-semibold text-purple-950 dark:text-purple-200 text-[11px] pr-5 truncate">
                      {cr.rubric}
                    </div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-400">{cr.chapter}</div>
                    <button
                      onClick={() => handleRemoveConfirmed(cr.id)}
                      className="absolute right-2 top-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ClinicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
