"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  History,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Sparkles,
  PlusCircle,
  X,
} from "lucide-react";
import { FollowUpSummaryResult } from "@/types";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

function FollowUpAnalyzerContent() {
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId") || "";

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);

  // New Visit Form
  const [newVisitForm, setNewVisitForm] = useState({
    symptomsSummary: "",
    statusChange: "IMPROVED",
    observations: "",
    prescriptionNotes: "Sac Lac (Placebo) bd",
    nextFollowUpDays: 21,
  });
  const [submittingVisit, setSubmittingVisit] = useState(false);

  useEffect(() => {
    fetch("/api/doctor/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        if (!selectedPatientId && data.patients && data.patients.length > 0) {
          setSelectedPatientId(data.patients[0].id);
        }
      });
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId) return;
    loadAnalysis(selectedPatientId);
  }, [selectedPatientId]);

  const loadAnalysis = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/follow-up/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();
      setAnalysisData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newVisitForm.symptomsSummary.trim()) return;

    setSubmittingVisit(true);
    try {
      const res = await fetch("/api/doctor/follow-up/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          ...newVisitForm,
        }),
      });
      if (res.ok) {
        setIsAddVisitModalOpen(false);
        setNewVisitForm({
          symptomsSummary: "",
          statusChange: "IMPROVED",
          observations: "",
          prescriptionNotes: "Sac Lac (Placebo) bd",
          nextFollowUpDays: 21,
        });
        loadAnalysis(selectedPatientId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingVisit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Follow-Up & Prognosis Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare visit-by-visit anamnesis strictly derived from stored patient records using Kent's 12 Observations and Hering's Law.
          </p>
        </div>

        <button
          onClick={() => setIsAddVisitModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Log New Follow-Up Visit
        </button>
      </div>

      {/* Patient Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Select Patient to Analyze
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full max-w-md px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Comparing chronological visits and generating Kent trajectory..." />
      ) : analysisData?.canAnalyze ? (
        /* Detailed Comparative Analysis */
        <div className="space-y-6 animate-in fade-in">
          {/* Trajectory Banner */}
          <div
            className={`p-6 rounded-2xl border text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              analysisData.analysis.trend === "IMPROVED"
                ? "bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-emerald-900 dark:to-teal-950 border-emerald-700 dark:border-emerald-800"
                : analysisData.analysis.trend === "AGGRAVATED"
                ? "bg-gradient-to-r from-rose-900 to-slate-900 dark:from-rose-950 dark:to-slate-950 border-rose-800 dark:border-rose-900"
                : "bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-slate-700 dark:border-slate-800"
            }`}
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                Overall Clinical Trajectory
              </div>
              <div className="text-2xl font-black mt-0.5">
                STATUS: {analysisData.analysis.trend}
              </div>
              <p className="text-xs text-slate-200/90 mt-1 max-w-2xl leading-relaxed">
                {analysisData.analysis.summary}
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-300">Recorded Visits</div>
              <div className="text-xl font-bold">{analysisData.visitCount} Consultations</div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Improved & Unchanged Symptoms */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Symptom Trajectory Analysis
              </h3>

              {analysisData.analysis.improvedSymptoms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Ameliorated / Improved Complaints:
                  </div>
                  <div className="space-y-1">
                    {analysisData.analysis.improvedSymptoms.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 text-xs border border-emerald-100 dark:border-emerald-900/60"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisData.analysis.unchangedSymptoms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    Unchanged Symptoms:
                  </div>
                  <div className="space-y-1">
                    {analysisData.analysis.unchangedSymptoms.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisData.analysis.aggravatedSymptoms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Aggravated Symptoms:
                  </div>
                  <div className="space-y-1">
                    {analysisData.analysis.aggravatedSymptoms.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 text-xs border border-rose-100 dark:border-rose-900/60"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Kent's Observations & Prescribing Guidance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Kentian Prescribing Observations
              </h3>

              <div className="space-y-2 text-xs">
                {analysisData.analysis.prescribingConsiderations.map((c: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 leading-relaxed text-[11px]"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs space-y-1 border border-slate-800 dark:border-slate-700">
                <div className="text-[10px] font-semibold uppercase text-teal-300">
                  Recommended Action:
                </div>
                <p className="text-slate-200 leading-snug">
                  {analysisData.analysis.nextStepsAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Chronological Visit Log */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chronological Visit Anamnesis Log
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {analysisData.visits.map((v: any) => (
                <div key={v.id} className="py-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Visit #{v.visitNumber}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(v.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{v.symptomsSummary}</p>
                    {v.prescriptionNotes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Rx: {v.prescriptionNotes}
                      </div>
                    )}
                  </div>

                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      v.statusChange === "IMPROVED"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : v.statusChange === "AGGRAVATED"
                        ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {v.statusChange}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Fewer than 2 visits state */
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 max-w-lg mx-auto">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            At Least 2 Recorded Visits Required
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Follow-up comparative analysis objectively contrasts symptoms across chronological visits. This patient currently has {analysisData?.visitCount || 0} recorded visit(s).
          </p>
          <button
            onClick={() => setIsAddVisitModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Log Follow-up Visit
          </button>
        </div>
      )}

      {/* Add Visit Modal */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Log Follow-Up Consultation Visit
              </h3>
              <button
                onClick={() => setIsAddVisitModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVisit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Symptoms & Progress Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newVisitForm.symptomsSummary}
                  onChange={(e) =>
                    setNewVisitForm({ ...newVisitForm, symptomsSummary: e.target.value })
                  }
                  placeholder="e.g. 70% relief in headache; appetite improved; no further morning aggravation..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Status Trajectory *
                </label>
                <select
                  value={newVisitForm.statusChange}
                  onChange={(e) =>
                    setNewVisitForm({ ...newVisitForm, statusChange: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors font-medium"
                >
                  <option value="IMPROVED">IMPROVED (General & Local Relief)</option>
                  <option value="UNCHANGED">UNCHANGED (Status Quo)</option>
                  <option value="AGGRAVATED">AGGRAVATED (Worsening Symptoms)</option>
                  <option value="NEW_SYMPTOMS">NEW SYMPTOMS (Different organ system)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Observations (Hering's Law / Modalities)
                </label>
                <input
                  type="text"
                  value={newVisitForm.observations}
                  onChange={(e) =>
                    setNewVisitForm({ ...newVisitForm, observations: e.target.value })
                  }
                  placeholder="e.g. Symptoms moving from head down to knees"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prescription Notes
                </label>
                <input
                  type="text"
                  value={newVisitForm.prescriptionNotes}
                  onChange={(e) =>
                    setNewVisitForm({ ...newVisitForm, prescriptionNotes: e.target.value })
                  }
                  placeholder="e.g. Sac Lac bd x 21 days"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-amber-600 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVisitModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVisit}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  {submittingVisit ? "Recording..." : "Record Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}

export default function FollowUpAnalyzerPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading Follow-Up Analyzer..." />}>
      <FollowUpAnalyzerContent />
    </Suspense>
  );
}
