"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Calendar,
  User,
  Building,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  Printer,
  Sparkles,
  Download,
} from "lucide-react";

interface LogbookItem {
  id: string;
  patientIdOrOpd: string;
  patientAge: number;
  patientGender: string;
  department: string;
  chiefComplaint: string;
  visitDate: string;
  remedyPrescribed: string | null;
  potencyPosology: string | null;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "RETURNED";
  facultyScore: number | null;
  facultyFeedback: string | null;
  createdAt: string;
}

export default function StudentLogbookListPage() {
  const [logbooks, setLogbooks] = useState<LogbookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogbooks();
  }, []);

  async function fetchLogbooks() {
    try {
      const res = await fetch("/api/student/logbook");
      const data = await res.json();
      if (data.logbooks) setLogbooks(data.logbooks);
    } catch {
      alert("Failed to load student logbooks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Digital Clinical Logbook & Case Record Builder
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized 7-step clinical documentation for BHMS clinical postings, internship rotations, and professor evaluation.
          </p>
        </div>

        <Link
          href="/student/logbook/new"
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Case Record
        </Link>
      </div>

      {/* Logbook Cases List */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading student clinical cases...</p>
        </div>
      ) : logbooks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Clinical Cases Recorded Yet
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start building your clinical case logbook with the standardized 7-step wizard (Patient Info, Chief Complaint, History, Generals, Examination, Investigations, Totality Summary).
            </p>
          </div>
          <Link
            href="/student/logbook/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Clinical Case
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logbooks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                    OPD: {item.patientIdOrOpd}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.status === "REVIEWED"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : item.status === "SUBMITTED"
                        ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        : item.status === "RETURNED"
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                    {item.chiefComplaint}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {item.patientAge}y • {item.patientGender}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> {item.department}
                    </span>
                  </div>
                </div>

                {item.remedyPrescribed && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Prescribed Similimum:
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {item.remedyPrescribed}{" "}
                      {item.potencyPosology && `(${item.potencyPosology})`}
                    </span>
                  </div>
                )}

                {item.facultyScore !== null && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Faculty Evaluation:
                      </span>
                      <span>{item.facultyScore} / 100</span>
                    </div>
                    {item.facultyFeedback && (
                      <p className="text-[11px] text-emerald-900 dark:text-emerald-200 italic line-clamp-2">
                        "{item.facultyFeedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />{" "}
                  {new Date(item.visitDate).toLocaleDateString()}
                </span>

                <Link
                  href={`/student/logbook/${item.id}`}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  View Case & PDF <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
