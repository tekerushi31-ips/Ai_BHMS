"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video, Stethoscope, Clock, CheckCircle, FileText, ArrowRight } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminClinicalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading Clinical Operations..." />;

  const { platform } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Clinical Management Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Operational control for appointments, clinical case trajectory, follow-ups, and WebRTC video consultations.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Total Appointments</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{platform?.appointments || 0}</div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1">Scheduled Patients</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Active Consultations</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{platform?.activeConsultations || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live WebRTC Signals</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Clinical Cases</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{platform?.clinicalCases || 0}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Active Case Files</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Follow-up Submissions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{platform?.followups || 0}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Patient Follow-up Trajectories</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appointment Management</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor pending, confirmed, in-progress, completed, and cancelled consultation bookings across all registered doctors.
          </p>
          <Link
            href="/admin/clinical/appointments"
            className="inline-flex items-center gap-1 py-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Manage Appointments →
          </Link>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Video Consultation Monitor</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track WebRTC signal server readiness, consultation start/end timestamps, session duration, and technical connection health.
          </p>
          <Link
            href="/admin/clinical/video-consultations"
            className="inline-flex items-center gap-1 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Monitor Video Consultations →
          </Link>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
