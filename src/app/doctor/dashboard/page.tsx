"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FilePlus,
  Mic,
  Search,
  History,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  Video,
} from "lucide-react";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

export default function DoctorDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doctor/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor dashboard");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading clinical overview..." />;
  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-400 font-semibold text-xs">
        {error || "Failed to retrieve doctor profile."}
      </div>
    );
  }

  const { doctor, metrics, recentPatients, recentCases, followUpsDue, safetyAlerts } = data;

  return (
    <div className="space-y-6 transition-colors">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-clinical-600 dark:text-clinical-400" />
            Clinical Workspace: {doctor.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {doctor.regNo} • {doctor.clinic}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/doctor/video-calls"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            Video Calls
          </Link>
          <Link
            href="/doctor/new-case"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4" />
            New Case Sheet
          </Link>
          <Link
            href="/doctor/voice-case"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Mic className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Voice Case
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registered Patients</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalPatients}</div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1">Directly Scoped</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cases Recorded</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalCases}</div>
          <div className="text-[11px] text-clinical-600 dark:text-clinical-400 font-medium mt-1">
            {metrics.newCasesThisMonth} new this month
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Follow-ups Due</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.followUpsDueCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Next 14 days</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Practice Experience</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {doctor.yearsOfPractice} yrs
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Registered Practitioner</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Clinical Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            href="/doctor/video-calls"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 shadow-soft hover:shadow-card hover:border-cyan-400 dark:hover:border-cyan-600 transition-all flex flex-col justify-between"
          >
            <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Video Calls</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Live Consultation & Notes</div>
            </div>
          </Link>

          <Link
            href="/doctor/patients"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex flex-col justify-between"
          >
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Patients Directory</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Manage patient records</div>
            </div>
          </Link>

          <Link
            href="/doctor/voice-case"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-clinical-300 dark:hover:border-clinical-700 transition-all flex flex-col justify-between"
          >
            <Mic className="w-5 h-5 text-clinical-600 dark:text-clinical-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Voice Case Taking</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Marathi / Hindi / English</div>
            </div>
          </Link>

          <Link
            href="/doctor/knowledge-search"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between"
          >
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Verified RAG Search</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Organon & Boericke</div>
            </div>
          </Link>

          <Link
            href="/doctor/follow-up"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-amber-300 dark:hover:border-amber-700 transition-all flex flex-col justify-between"
          >
            <History className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Follow-up Analyzer</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Kent Observation rules</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Real Clinical Safety Alerts (Only shown if triggered by real patient data) */}
      {safetyAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Active Clinical Safety Alerts Detected
          </div>

          <div className="space-y-2">
            {safetyAlerts.map((alert: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 text-xs space-y-1 shadow-xs"
              >
                <div className="flex items-center justify-between font-semibold text-rose-900 dark:text-rose-300">
                  <span>
                    Patient: {alert.patientName} ({alert.title})
                  </span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-1.5 py-0.2 rounded font-bold">
                    {alert.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Patients and Cases Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Patients
            </h3>
            <Link
              href="/doctor/patients"
              className="text-[11px] font-semibold text-clinical-600 dark:text-clinical-400 hover:underline"
            >
              View All
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <EmptyState
              title="No patient records yet"
              description="Register your first patient to start digital case sheets."
              actionLabel="Add Patient"
              onAction={() => (window.location.href = "/doctor/patients")}
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPatients.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/doctor/patients/${p.id}`}
                  className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}{" "}
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 font-mono">
                        ({p.patientCode})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {p.age} yrs • {p.gender} • {p.contact || "No phone"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Last visit: {new Date(p.lastVisit).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups Due */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Follow-ups Due
            </h3>
            <Link
              href="/doctor/follow-up"
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Open Analyzer
            </Link>
          </div>

          {followUpsDue.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No follow-up visits pending in the next 14 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {followUpsDue.map((f: any) => (
                <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{f.patientName}</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400">
                      Status at last visit: {f.lastStatus}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Due: {new Date(f.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
