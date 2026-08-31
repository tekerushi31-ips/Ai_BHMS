"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Check,
  Plus,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { RemedyDetail } from "@/services/materia-medica";

export default function MateriaMedicaComparatorPage() {
  const [availableRemedies, setAvailableRemedies] = useState<
    Array<{ id: string; name: string; commonName: string; familyOrSource: string }>
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "aconitum-napellus",
    "belladonna",
    "arsenicum-album",
  ]);
  const [comparedRemedies, setComparedRemedies] = useState<RemedyDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableRemedies();
  }, []);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      runComparison(selectedIds);
    }
  }, []);

  async function fetchAvailableRemedies() {
    try {
      const res = await fetch("/api/student/materia-medica/compare");
      const data = await res.json();
      if (data.remedies) setAvailableRemedies(data.remedies);
    } catch {}
  }

  async function runComparison(ids: string[]) {
    if (ids.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch("/api/student/materia-medica/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remedyIds: ids }),
      });
      const data = await res.json();
      if (data.remedies) {
        setComparedRemedies(data.remedies);
      }
    } catch {
      alert("Failed to compare remedies.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRemedy(id: string) {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert("You must keep at least 2 remedies for comparison.");
        return;
      }
      const next = selectedIds.filter((item) => item !== id);
      setSelectedIds(next);
      runComparison(next);
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare up to 4 remedies at a time.");
        return;
      }
      const next = [...selectedIds, id];
      setSelectedIds(next);
      runComparison(next);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Differential Materia Medica Comparator
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare 2 to 4 homoeopathic remedies side-by-side across keynotes, modalities, generals, concomitants, and fine differentiating points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            {selectedIds.length}/4 Remedies Selected
          </span>
        </div>
      </div>

      {/* Remedy Selector Strip */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Remedies to Compare (2–4):
          </span>
          <span className="text-xs text-slate-500">
            Click to add/remove from comparison
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableRemedies.map((rem) => {
            const isSelected = selectedIds.includes(rem.id);
            return (
              <button
                key={rem.id}
                type="button"
                onClick={() => toggleRemedy(rem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 dark:bg-[#1A2234] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{rem.name}</span>
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  ({rem.commonName})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Compiling differential Materia Medica matrices...
          </p>
        </div>
      ) : comparedRemedies.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
          Select at least 2 remedies above to see the differential comparison.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multi-Column Header Cards */}
          <div
            className={`grid gap-4 ${
              comparedRemedies.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : comparedRemedies.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {comparedRemedies.map((rem, idx) => (
              <div
                key={rem.id}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Remedy #{idx + 1}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {rem.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {rem.commonName} • {rem.familyOrSource}
                    </p>
                  </div>
                  {comparedRemedies.length > 2 && (
                    <button
                      type="button"
                      onClick={() => toggleRemedy(rem.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Miasm:</span>{" "}
                  {rem.miasmaticAffinity}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparative Rows */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-200/80 dark:divide-slate-800 overflow-hidden">
            {/* Section: Keynotes */}
            <ComparisonSection
              title="Keynotes & Characteristic Essentials"
              badge="Core Image"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <ul className="space-y-1.5">
                  {rem.keynotes.map((kn, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-indigo-500 font-bold leading-none mt-0.5">•</span>
                      <span>{kn}</span>
                    </li>
                  ))}
                </ul>
              )}
            />

            {/* Section: Mental Generals */}
            <ComparisonSection
              title="Mental Generals & Temperament"
              badge="Mind"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <ul className="space-y-1.5">
                  {rem.mentalGenerals.map((mg, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-teal-500 font-bold leading-none mt-0.5">•</span>
                      <span>{mg}</span>
                    </li>
                  ))}
                </ul>
              )}
            />

            {/* Section: Physical Generals & Thermal State */}
            <ComparisonSection
              title="Physical Generals & Thermal State"
              badge="Generals"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <ul className="space-y-1.5">
                  {rem.physicalGenerals.map((pg, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-amber-500 font-bold leading-none mt-0.5">•</span>
                      <span>{pg}</span>
                    </li>
                  ))}
                </ul>
              )}
            />

            {/* Section: Modalities (Aggravation vs Amelioration) */}
            <ComparisonSection
              title="Modalities (Aggravation < vs Amelioration >)"
              badge="Modalities"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1">
                      Aggravation (&lt;):
                    </span>
                    <ul className="space-y-1">
                      {rem.modalitiesAggravation.map((agg, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300">
                          - {agg}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Amelioration (&gt;):
                    </span>
                    <ul className="space-y-1">
                      {rem.modalitiesAmelioration.map((amel, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300">
                          + {amel}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            />

            {/* Section: Concomitants */}
            <ComparisonSection
              title="Concomitants"
              badge="Concomitants"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <ul className="space-y-1.5">
                  {rem.concomitants.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-cyan-500 font-bold leading-none mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              )}
            />

            {/* Section: Differentiating Points */}
            <ComparisonSection
              title="Important Differentiating Points"
              badge="Fine Differentiation"
              remedies={comparedRemedies}
              highlighted={true}
              renderContent={(rem) => (
                <div className="space-y-2">
                  {rem.differentiatingPoints.map((dp, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200"
                    >
                      {dp}
                    </div>
                  ))}
                </div>
              )}
            />

            {/* Section: Source References */}
            <ComparisonSection
              title="Verified Source References"
              badge="Citations"
              remedies={comparedRemedies}
              renderContent={(rem) => (
                <div className="space-y-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {rem.sourceReferences.map((ref, i) => (
                    <div key={i}>📖 {ref}</div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonSection({
  title,
  badge,
  remedies,
  renderContent,
  highlighted = false,
}: {
  title: string;
  badge: string;
  remedies: RemedyDetail[];
  renderContent: (remedy: RemedyDetail) => React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div className={`p-5 ${highlighted ? "bg-slate-50/60 dark:bg-[#141C2E]/60" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {title}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
          {badge}
        </span>
      </div>

      <div
        className={`grid gap-4 ${
          remedies.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : remedies.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {remedies.map((rem) => (
          <div
            key={rem.id}
            className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/70 dark:border-slate-800/80 space-y-2"
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block border-b border-slate-200/50 dark:border-slate-700/50 pb-1">
              {rem.name}
            </span>
            {renderContent(rem)}
          </div>
        ))}
      </div>
    </div>
  );
}
