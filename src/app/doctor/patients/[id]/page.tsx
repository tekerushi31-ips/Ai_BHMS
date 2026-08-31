"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  FilePlus,
  History,
  Calendar,
  Layers,
  ArrowLeft,
  Edit,
  Sparkles,
  BookOpen,
  Video,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/doctor/patients/${patientId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Patient not found or unauthorized.");
        return res.json();
      })
      .then((data) => {
        setPatient(data.patient);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [patientId]);

  const handleStartInstantVideoCall = async () => {
    if (!patientId) return;
    setStartingCall(true);
    try {
      const res = await fetch("/api/doctor/video-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          isInstant: true,
        }),
      });
      const data = await res.json();
      if (data.session) {
        window.location.href = `/doctor/video-calls/${data.session.id}`;
      }
    } catch (e) {
      console.error("Failed to start instant video call:", e);
      setStartingCall(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading patient profile & case history..." />;
  if (error || !patient) {
    return (
      <div className="p-6 text-center space-y-3">
        <div className="text-rose-600 font-semibold text-xs">{error || "Patient not found"}</div>
        <Link
          href="/doctor/patients"
          className="text-xs text-cyan-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Patients Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/patients"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{patient.name}</h1>
              <span className="font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {patient.patientCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {patient.age} yrs • {patient.gender} • {patient.occupation || "Occupation unrecorded"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartInstantVideoCall}
            disabled={startingCall}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            {startingCall ? "Starting Call..." : "Start Video Call"}
          </button>
          <Link
            href={`/doctor/new-case?patientId=${patient.id}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4" />
            New Case Sheet
          </Link>
          <Link
            href={`/doctor/follow-up?patientId=${patient.id}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            Analyze Follow-ups
          </Link>
        </div>
      </div>

      {/* Patient Demographics & Contact Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Phone Contact</span>
          <div className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{patient.contact || "—"}</div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Address</span>
          <div className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{patient.address || "—"}</div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Total Visits</span>
          <div className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{patient.caseVisits.length} recorded</div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Registered On</span>
          <div className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
            {new Date(patient.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Clinical Cases Recorded */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Recorded Case Sheets ({patient.clinicalCases.length})
        </h2>

        {patient.clinicalCases.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">No clinical case sheet recorded for this patient.</p>
            <Link
              href={`/doctor/new-case?patientId=${patient.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-clinical-600 dark:text-clinical-400 hover:underline"
            >
              <FilePlus className="w-3.5 h-3.5" /> Create First Case Sheet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {patient.clinicalCases.map((c: any) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Chief Complaint: {c.chiefComplaint}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        c.status === "ANALYZED"
                          ? "bg-clinical-50 dark:bg-clinical-950/60 text-clinical-700 dark:text-clinical-300 border border-clinical-200 dark:border-clinical-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Recorded: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Location & Sensation
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {[c.location, c.sensation].filter(Boolean).join(" • ") || "Not recorded"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Modalities</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {c.modalities || "Not recorded"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Mental & Physical Generals
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {[c.mentalGenerals, c.physicalGenerals].filter(Boolean).join(" • ") ||
                        "Not recorded"}
                    </p>
                  </div>
                </div>

                {c.remedyConsidered && (
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs flex items-center justify-between text-teal-950 dark:text-teal-200">
                    <div>
                      <strong>Remedy Considered:</strong> {c.remedyConsidered}{" "}
                      <span className="text-teal-700 dark:text-teal-400 font-normal">
                        ({c.potencyPrescribed || "Potency pending"})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visit History Timeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Visit History ({patient.caseVisits.length})
        </h2>

        {patient.caseVisits.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No visits logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {patient.caseVisits.map((v: any) => (
              <div key={v.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Visit #{v.visitNumber}</span>
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      {new Date(v.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{v.symptomsSummary}</p>
                  {v.observations && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">
                      Obs: {v.observations}
                    </p>
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
        )}
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
