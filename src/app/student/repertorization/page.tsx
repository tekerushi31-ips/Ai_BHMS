"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { RepertoryMatch } from "@/types";
import { RepertorizationTableResult } from "@/services/repertory";

export default function RepertorizationPage() {
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RepertoryMatch[]>([]);
  const [hasVerifiedMatch, setHasVerifiedMatch] = useState(true);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Persistent Symptom Cart: array of selected rubrics
  const [cart, setCart] = useState<RepertoryMatch[]>([]);

  // Repertorization Result Table
  const [repertorizationResult, setRepertorizationResult] =
    useState<RepertorizationTableResult | null>(null);
  const [isRepertorizing, setIsRepertorizing] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  // Initial load
  useEffect(() => {
    fetchRubrics("", "ALL");
  }, []);

  async function fetchRubrics(q: string, chapter: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/repertorization?q=${encodeURIComponent(q)}&chapter=${encodeURIComponent(
          chapter
        )}`
      );
      const data = await res.json();
      if (data.chapters) setChapters(data.chapters);
      setSearchResults(data.matches || []);
      setHasVerifiedMatch(data.hasVerifiedMatch ?? true);
      setSearchMessage(data.message || "");
    } catch {
      setSearchResults([]);
      setHasVerifiedMatch(false);
      setSearchMessage("Failed to connect to repertory engine.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchRubrics(searchQuery, selectedChapter);
  }

  function handleChapterChange(chap: string) {
    setSelectedChapter(chap);
    fetchRubrics(searchQuery, chap);
  }

  function addToCart(rubric: RepertoryMatch) {
    if (!cart.some((item) => item.id === rubric.id)) {
      setCart((prev) => [...prev, rubric]);
    }
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
    setRepertorizationResult(null);
    setSavedSuccessMsg("");
  }

  async function runRepertorization() {
    if (cart.length === 0) return;
    setIsRepertorizing(true);
    setSavedSuccessMsg("");

    try {
      const rubricIds = cart.map((r) => r.id);
      const res = await fetch("/api/student/repertorization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubricIds,
          saveSession: true,
          sessionTitle: `Student Repertorization (${cart.length} Rubrics)`,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setRepertorizationResult(data.result);
        setSavedSuccessMsg("Repertorization session calculated & saved to your record!");
      }
    } catch {
      alert("Failed to compute repertorization.");
    } finally {
      setIsRepertorizing(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Interactive Repertorization Engine
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search verified Kent repertory rubrics, manage your Symptom Cart, and compute graded mathematical totality rankings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            Kent's Repertory (3-Grade System)
          </span>
        </div>
      </div>

      {/* Main Grid: Left Search & Results | Right Symptom Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Search & Rubric Selector (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Controls */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symptom, sensation, modality (e.g. anxiety, sun headache)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Chapter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3 h-3" /> Chapter:
              </span>
              {chapters.slice(0, 10).map((chap) => (
                <button
                  key={chap}
                  type="button"
                  onClick={() => handleChapterChange(chap)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                    selectedChapter === chap
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {chap}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Rubrics ({searchResults.length})
              </h2>
              {searchMessage && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{searchMessage}</span>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-500">Searching verified repertory database...</p>
              </div>
            ) : !hasVerifiedMatch || searchResults.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-amber-300 dark:border-amber-900/50">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No verified rubric found.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching classical Kentian terminology or select a specific anatomical chapter.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {searchResults.map((rubric) => {
                  const inCart = cart.some((c) => c.id === rubric.id);
                  return (
                    <div
                      key={rubric.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        inCart
                          ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800"
                          : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {rubric.chapter}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {rubric.source}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {rubric.rubric}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rubric.explanation}
                          </p>

                          {/* Related Remedies Preview with Grades */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rubric.relatedRemedies.map((rem) => (
                              <span
                                key={rem.name}
                                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                                  rem.grade === 3
                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 font-bold"
                                    : rem.grade === 2
                                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 italic"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                }`}
                                title={`Grade ${rem.grade} (Weight: ${rem.grade})`}
                              >
                                {rem.name.split(" ")[0]} ({rem.grade})
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => (inCart ? removeFromCart(rubric.id) : addToCart(rubric))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                            inCart
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200"
                              : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                          }`}
                        >
                          {inCart ? "Remove" : "+ Add Rubric"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Symptom Cart (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Symptom Cart ({cart.length})
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto opacity-40 text-teal-500" />
                <p className="text-sm font-medium">Your symptom cart is empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select rubrics from the search list to build the case totality for mathematical repertorization.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                        Rubric #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      ✓ {item.rubric}
                    </p>
                    <span className="inline-block text-[10px] text-slate-500 dark:text-slate-400">
                      {item.relatedRemedies.length} remedies in rubric
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Gradation Legend */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Kent Gradation Scale:
              </span>
              <div className="flex items-center gap-3">
                <span className="text-rose-600 dark:text-rose-400 font-bold">3 = 3rd Grade (Bold)</span>
                <span className="text-indigo-600 dark:text-indigo-400 italic">2 = 2nd Grade (Italics)</span>
                <span className="text-slate-700 dark:text-slate-300">1 = 1st Grade (Roman)</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={cart.length === 0 || isRepertorizing}
              onClick={runRepertorization}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                cart.length === 0 || isRepertorizing
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white active:scale-98"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {isRepertorizing ? "Calculating Totality Matrix..." : "REPERTORIZE"}
            </button>
          </div>
        </div>
      </div>

      {/* Repertorization Result Scoring Matrix */}
      {repertorizationResult && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Repertorization Scoring Matrix & Totality Ranking
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Rubrics Evaluated: {repertorizationResult.totalRubricsSelected} | Ranked by Rubric Coverage Count and Gradation Sum
              </p>
            </div>
            {savedSuccessMsg && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {savedSuccessMsg}
              </span>
            )}
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1A2234] border-y border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold">
                  <th className="p-3 min-w-[60px]">Rank</th>
                  <th className="p-3 min-w-[180px]">Remedy</th>
                  <th className="p-3 text-center min-w-[80px]">Coverage</th>
                  {repertorizationResult.rubrics.map((r, i) => (
                    <th
                      key={r.id}
                      className="p-3 text-center max-w-[140px] truncate"
                      title={r.rubric}
                    >
                      Rubric {i + 1}
                    </th>
                  ))}
                  <th className="p-3 text-right font-bold text-teal-600 dark:text-teal-400 min-w-[90px]">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                {repertorizationResult.remedyScores.slice(0, 15).map((row, idx) => (
                  <tr
                    key={row.remedy}
                    className={`hover:bg-slate-50/80 dark:hover:bg-[#1A2234]/50 transition-colors ${
                      idx === 0
                        ? "bg-teal-50/40 dark:bg-teal-950/20 font-semibold"
                        : idx === 1 || idx === 2
                        ? "bg-amber-50/30 dark:bg-amber-950/10"
                        : ""
                    }`}
                  >
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-amber-400 text-amber-950 shadow-xs"
                            : idx === 1
                            ? "bg-slate-300 text-slate-900"
                            : idx === 2
                            ? "bg-amber-700/60 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {row.remedy}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {row.rubricCoverageCount}/{repertorizationResult.totalRubricsSelected}
                      </span>
                    </td>
                    {repertorizationResult.rubrics.map((r) => {
                      const grade = row.rubricGrades[r.id];
                      return (
                        <td key={r.id} className="p-3 text-center">
                          {grade ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                                grade === 3
                                  ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold"
                                  : grade === 2
                                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 italic"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {grade}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-mono">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right">
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400 font-mono">
                        {row.totalScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
