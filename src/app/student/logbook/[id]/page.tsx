"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  User,
  Calendar,
  Building,
  Award,
  Send,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function StudentLogbookDetailView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [logbook, setLogbook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  async function fetchCase() {
    try {
      const res = await fetch(`/api/student/logbook/${id}`);
      const data = await res.json();
      if (data.logbook) setLogbook(data.logbook);
    } catch {
      alert("Failed to load case record.");
    } finally {
      setLoading(false);
    }
  }

  async function submitToProfessor() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/logbook/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SUBMITTED" }),
      });
      const data = await res.json();
      if (data.success && data.logbook) {
        setLogbook(data.logbook);
        alert("Case successfully submitted to faculty mentor for clinical review!");
      }
    } catch {
      alert("Failed to submit case.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrintPDF() {
    window.print();
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading clinical case record...</p>
      </div>
    );
  }

  if (!logbook) {
    return (
      <div className="p-8 text-center text-slate-500">
        Case record not found. <Link href="/student/logbook" className="text-teal-600 underline">Return to logbook</Link>
      </div>
    );
  }

  let parsedInvestigations = [];
  try {
    if (logbook.investigationsJson) {
      parsedInvestigations = JSON.parse(logbook.investigationsJson);
    }
  } catch {}

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Controls (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <Link
            href="/student/logbook"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Logbook Cases
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Clinical Case Record: {logbook.patientIdOrOpd}
          </h1>
          <p className="text-xs text-slate-500">
            Recorded by {logbook.user?.name || "Student"} on {new Date(logbook.visitDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logbook.status === "DRAFT" && (
            <button
              type="button"
              disabled={submitting}
              onClick={submitToProfessor}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit to Professor
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> DOWNLOAD AS PDF
          </button>
        </div>
      </div>

      {/* Faculty Score Alert if present */}
      {logbook.facultyScore !== null && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2 print:border-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Faculty Assessment & Clinical Grading:
            </span>
            <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-100 font-mono">
              Score: {logbook.facultyScore} / 100
            </span>
          </div>
          {logbook.facultyFeedback && (
            <p className="text-xs text-emerald-900 dark:text-emerald-200 italic">
              Professor Feedback: "{logbook.facultyFeedback}"
            </p>
          )}
        </div>
      )}

      {/* Printable Clinical Sheet Document */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Institutional Header */}
        <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4 space-y-1">
          <h2 className="text-xl font-extrabold tracking-wider uppercase text-slate-900 dark:text-white">
            BHMS Clinical Rotation & Case Record
          </h2>
          <p className="text-xs text-slate-500 font-mono uppercase">
            Department of Homoeopathic Materia Medica & Repertory • Clinical Posting Logbook
          </p>
          <div className="flex justify-between text-xs font-mono pt-2 text-slate-600 dark:text-slate-400">
            <span>OPD NO: <strong>{logbook.patientIdOrOpd}</strong></span>
            <span>DATE: <strong>{new Date(logbook.visitDate).toLocaleDateString()}</strong></span>
            <span>DEPT: <strong>{logbook.department}</strong></span>
            <span>STATUS: <strong>{logbook.status}</strong></span>
          </div>
        </div>

        {/* Section 1: Patient Information */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            1. Patient Demographics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Patient Age:</span>
              <span className="font-bold text-slate-900 dark:text-white">{logbook.patientAge} Years</span>
            </div>
            <div>
              <span className="text-slate-500 block">Gender:</span>
              <span className="font-bold text-slate-900 dark:text-white">{logbook.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department:</span>
              <span className="font-bold text-slate-900 dark:text-white">{logbook.department}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Chief Complaint */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            2. Chief Complaint & Modalities
          </h3>
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              {logbook.chiefComplaint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
              {logbook.duration && <div><strong>Duration:</strong> {logbook.duration}</div>}
              {logbook.location && <div><strong>Location:</strong> {logbook.location}</div>}
              {logbook.sensation && <div><strong>Sensation:</strong> {logbook.sensation}</div>}
            </div>
            {logbook.modalities && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-800 text-xs">
                <strong>Modalities:</strong> {logbook.modalities}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: History */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            3. Anamnesis & Medical History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {logbook.historyPresentIllness && (
              <div>
                <span className="text-slate-500 block font-semibold">History of Present Illness:</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.historyPresentIllness}</p>
              </div>
            )}
            {logbook.pastHistory && (
              <div>
                <span className="text-slate-500 block font-semibold">Past History:</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.pastHistory}</p>
              </div>
            )}
            {logbook.familyHistory && (
              <div>
                <span className="text-slate-500 block font-semibold">Family History (Miasm):</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.familyHistory}</p>
              </div>
            )}
            {logbook.treatmentHistory && (
              <div>
                <span className="text-slate-500 block font-semibold">Treatment History:</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.treatmentHistory}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Generals */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            4. Physical & Mental Generals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {logbook.generalsMental && (
              <div>
                <span className="text-slate-500 block font-semibold">Mental Generals:</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.generalsMental}</p>
              </div>
            )}
            {logbook.generalsPhysical && (
              <div>
                <span className="text-slate-500 block font-semibold">Physical Generals:</span>
                <p className="text-slate-800 dark:text-slate-200">{logbook.generalsPhysical}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
            {logbook.appetite && <div><strong>Appetite:</strong> {logbook.appetite}</div>}
            {logbook.thirst && <div><strong>Thirst:</strong> {logbook.thirst}</div>}
            {logbook.sleep && <div><strong>Sleep:</strong> {logbook.sleep}</div>}
            {logbook.thermalPreference && <div><strong>Thermal:</strong> {logbook.thermalPreference}</div>}
          </div>
        </div>

        {/* Section 5: Examination */}
        {logbook.examinationDetails && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
              5. Clinical Examination Findings
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line">
              {logbook.examinationDetails}
            </p>
          </div>
        )}

        {/* Section 6: Investigations */}
        {parsedInvestigations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
              6. Laboratory Investigations
            </h3>
            <div className="space-y-1 text-xs">
              {parsedInvestigations.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234]">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inv.name}:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{inv.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 7: Prescription & Totality */}
        <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/80 space-y-3 print:border-slate-400">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            7. Final Homoeopathic Prescription & Case Totality
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Prescribed Similimum:</span>
              <span className="text-base font-bold text-teal-900 dark:text-teal-100">
                {logbook.remedyPrescribed || "Not recorded"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Potency & Posology:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {logbook.potencyPosology || "Not recorded"}
              </span>
            </div>
          </div>
          {logbook.caseTotalityNotes && (
            <div className="text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-teal-100 dark:border-teal-900/60">
              <span className="font-semibold block text-slate-900 dark:text-white mb-0.5">
                Clinical Totality Rationale:
              </span>
              <p>{logbook.caseTotalityNotes}</p>
            </div>
          )}
        </div>

        {/* Signature & Verification Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="block border-t border-slate-400 w-40 pt-1 text-center font-mono">
              Student Signature
            </span>
          </div>
          <div>
            <span className="block border-t border-slate-400 w-40 pt-1 text-center font-mono">
              Faculty / Mentor Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
