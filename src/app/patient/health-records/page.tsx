"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Shield,
  Stethoscope,
  ChevronDown,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function PatientHealthRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const res = await fetch("/api/patient/health-records");
      const data = await res.json();
      if (data.records) setRecords(data.records);
    } catch {
      alert("Failed to load health records.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Clinical Health Records Timeline
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your historical clinical consultations, shared doctor prescriptions, and dietary advice.
          </p>
        </div>
      </div>

      {/* Patient Privacy Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 flex items-start gap-3 shadow-xs">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-sm block">
            Patient-Visible Shared Records Policy
          </span>
          <p>
            To protect clinical practice integrity and your data privacy, this portal displays only doctor-shared consultation summaries, prescribed remedies, and lifestyle guidance. Internal clinical repertory rationale remains private to your healthcare team.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading your clinical health timeline...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
          No clinical visit records found.
        </div>
      ) : (
        <div className="relative border-l-2 border-emerald-500/30 dark:border-emerald-500/20 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
          {records.map((rec, index) => (
            <div key={rec.id || index} className="relative space-y-3">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-emerald-600/30 border-2 border-white dark:border-slate-900">
                {rec.visitNumber || index + 1}
              </div>

              {/* Record Card */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      Visit #{rec.visitNumber || index + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      Consultation with {rec.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {rec.specialization} • {rec.clinicName}
                    </p>
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 dark:bg-[#1A2234] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                    📅{" "}
                    {new Date(rec.visitDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Complaint Summary */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Chief Complaint Presented:
                  </span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#1A2234] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                    {rec.chiefComplaint}
                  </p>
                </div>

                {/* Shared Summary */}
                {rec.sharedSummary && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Shared Doctor's Observations:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.sharedSummary}
                    </p>
                  </div>
                )}

                {/* Prescriptions */}
                {rec.prescribedRemedies && rec.prescribedRemedies.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 block">
                      Prescribed Remedies & Administration:
                    </span>
                    <div className="space-y-2">
                      {rec.prescribedRemedies.map((rx: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200">
                            <span className="text-sm">{rx.remedyName}</span>
                            <span className="font-mono bg-teal-200/60 dark:bg-teal-900/80 px-2 py-0.5 rounded text-[11px]">
                              {rx.potency}
                            </span>
                          </div>
                          <p className="text-[11px] text-teal-800 dark:text-teal-300">
                            {rx.instructions}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Advice */}
                {rec.generalAdvice && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                    <strong className="text-slate-900 dark:text-white block font-semibold">
                      Dietary & Lifestyle Advice:
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300">{rec.generalAdvice}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
