"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, Bot, Stethoscope, GraduationCap, ArrowRight } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminAnalyticsPage() {
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

  if (loading) return <LoadingSpinner label="Loading Platform Analytics..." />;

  const { users, ai, platform } = data || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Platform & User Growth Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real data metrics for Student, Doctor, Faculty, and Patient activity across BHMS AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics/ai"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            AI Feedback Loop →
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Students Active</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users?.students || 0}</div>
          <div className="text-[11px] text-clinical-600 font-medium mt-1">Learning & Quiz Attempt Rate</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Doctors Active</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users?.doctors || 0}</div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1">Clinical Cases & Consults</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Patients Managed</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users?.patients || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Registered Telehealth Patients</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Total AI Interactions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {(ai?.studentRequests || 0) + (ai?.doctorRequests || 0)}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Source-Grounded Queries</div>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
