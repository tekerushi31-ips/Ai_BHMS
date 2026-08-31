"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
} from "lucide-react";
import { AISource } from "@/types";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function DoctorKnowledgeSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<AISource[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleSearches = [
    "Aphorism §9 Vital Force",
    "Aphorism §153 Characteristic Symptoms",
    "Arsenicum Album burning better heat",
    "Lycopodium 4 to 8 PM right to left",
    "Pulsatilla thirstless weeping disposition",
    "50 Millesimal LM Potency preparation",
  ];

  const handleSearch = async (queryText?: string) => {
    const text = queryText || query;
    if (!text.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/doctor/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          category,
        }),
      });
      const data = await res.json();
      setSources(data.sources || []);
      setMessage(data.message || null);
    } catch (e) {
      console.error(e);
      setMessage("Knowledge search service temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Verified BHMS Knowledge Search
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global search strictly filtered across verified texts: Organon (6th Ed), Boericke's Materia Medica, and Kent's Repertory.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Verified Corpus Only
        </span>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search literature: (e.g. 'Aphorism 153', 'Arsenicum keynotes', 'Kent mind rubrics')..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ORGANON">Organon of Medicine</option>
            <option value="MATERIA_MEDICA">Materia Medica</option>
            <option value="REPERTORY">Repertory</option>
            <option value="PHARMACY">Pharmacy</option>
            <option value="PHILOSOPHY">Philosophy</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? "Searching..." : "Search Verified RAG"}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Quick Searches:</span>
          {sampleSearches.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-600 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-300 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header / Status */}
      {message && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
          {sources.length > 0 && (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {sources.length} Verified Citation(s)
            </span>
          )}
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <LoadingSpinner label="Searching verified homoeopathic corpus..." />
      ) : sources.length > 0 ? (
        <div className="space-y-4">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{src.title}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {src.author} • {src.sourceBook}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
                    {src.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    VERIFIED
                  </span>
                </div>
              </div>

              {src.chapterOrAphorism && (
                <div className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700">
                  Section: {src.chapterOrAphorism}
                </div>
              )}

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#1A2234] p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {src.passage}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Verification: Peer-reviewed & Grounded</span>
                {src.relevanceScore && (
                  <span>Relevance Match: {Math.round(src.relevanceScore * 100)}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No verified source found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            The query yielded no match meeting the confidence threshold in the verified homeopathic literature.
          </p>
        </div>
      ) : null}

      <ClinicalDisclaimer />
    </div>
  );
}
