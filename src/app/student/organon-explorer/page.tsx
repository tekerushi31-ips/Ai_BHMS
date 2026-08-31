"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { OrganonAphorism } from "@/services/organon";

export default function OrganonExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [aphorisms, setAphorisms] = useState<OrganonAphorism[]>([]);
  const [selectedAphorism, setSelectedAphorism] = useState<OrganonAphorism | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAphorisms("", "ALL");
  }, []);

  async function fetchAphorisms(q: string, cat: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/organon?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`
      );
      const data = await res.json();
      if (data.aphorisms) {
        setAphorisms(data.aphorisms);
        if (data.aphorisms.length > 0 && !selectedAphorism) {
          setSelectedAphorism(data.aphorisms[0]);
        }
      }
    } catch {
      alert("Failed to load Organon aphorisms.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchAphorisms(searchQuery, categoryFilter);
  }

  function handleCategoryChange(cat: string) {
    setCategoryFilter(cat);
    fetchAphorisms(searchQuery, cat);
  }

  const categories = [
    { key: "ALL", label: "All Aphorisms" },
    { key: "FUNDAMENTALS", label: "Principles (§1-§8, §26)" },
    { key: "VITAL_FORCE", label: "Vital Force (§9-§17)" },
    { key: "CASE_TAKING", label: "Case Taking & SRP (§153)" },
    { key: "POSOLOGY_REPERTORY", label: "LM Potencies (§270)" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Organon & Philosophy Concept Explorer
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search Hahnemannian aphorisms, explore authentic reference texts alongside simplified study notes, and master AIAPGET exam concepts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Organon 6th Edition Text & Notes
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by aphorism number (§26, 153), keyword (vital force, similars, LM)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Topic:
          </span>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => handleCategoryChange(c.key)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                categoryFilter === c.key
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Aphorism Selector & Text | Right Student Study Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Aphorism Selector & Reference Text (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Aphorism ({aphorisms.length})
            </h2>
          </div>

          {/* Aphorism Pills List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {aphorisms.map((a) => (
              <button
                key={a.aphorismNumber}
                type="button"
                onClick={() => setSelectedAphorism(a)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  selectedAphorism?.aphorismNumber === a.aphorismNumber
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300"
                }`}
              >
                § {a.aphorismNumber}
              </button>
            ))}
          </div>

          {/* Left Column: Authentic Text Card */}
          {selectedAphorism ? (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Aphorism § {selectedAphorism.aphorismNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedAphorism.topic}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-1">
                  {selectedAphorism.title}
                </h3>
              </div>

              {/* Authentic Paragraph */}
              <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                  Original Reference Translation:
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-serif leading-relaxed italic">
                  "{selectedAphorism.originalText}"
                </p>
                <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/30 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  📖 Source: {selectedAphorism.referenceEdition}
                </div>
              </div>

              {/* Category info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
                <strong>Subject Area:</strong> {selectedAphorism.category.replace(/_/g, " ")}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No aphorism selected.</div>
          )}
        </div>

        {/* Right Column: Student Study Notes & Visual Flowchart (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          {selectedAphorism && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Student Study & Clinical Notes
                </h3>
              </div>

              {/* Simplified Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Simplified Hahnemannian Meaning:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-[#1A2234] p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                  {selectedAphorism.studentNotes.simplifiedExplanation}
                </p>
              </div>

              {/* Core Key Points */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Core Philosophical Pillars:
                </span>
                <ul className="space-y-1.5">
                  {selectedAphorism.studentNotes.keyPoints.map((kp, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50/50 dark:bg-[#1A2234]/50 p-2 rounded-xl"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Flowchart Mapping: Concept -> Meaning -> Application -> Example */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-[#1A2234] dark:to-[#0F2228] border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                  Visual Conceptual Logic Flow:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      1. Concept
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedAphorism.studentNotes.visualFlowchart.concept}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      2. Meaning
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedAphorism.studentNotes.visualFlowchart.meaning}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      3. Application
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedAphorism.studentNotes.visualFlowchart.application}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      4. Clinical Example
                    </span>
                    <span className="text-teal-700 dark:text-teal-300 font-medium">
                      {selectedAphorism.studentNotes.visualFlowchart.example}
                    </span>
                  </div>
                </div>
              </div>

              {/* AIAPGET Exam Points */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
                  <Award className="w-4 h-4" /> AIAPGET High-Yield Exam Points:
                </div>
                <ul className="space-y-1 text-purple-950 dark:text-purple-200 pl-4 list-disc">
                  {selectedAphorism.studentNotes.aiapgetExamPointers.map((ep, i) => (
                    <li key={i}>{ep}</li>
                  ))}
                </ul>
              </div>

              {/* Clinical Connection */}
              <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                <strong>Bedside Clinical Connection:</strong>{" "}
                {selectedAphorism.studentNotes.clinicalConnection}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
