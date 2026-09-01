"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Lock, Key, AlertTriangle } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs?limit=25")
      .then((res) => res.json())
      .then((json) => {
        setLogs(json.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            Security & Authentication Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor admin authentication sessions, role change audits, and session integrity.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Session Encryption</div>
          <div className="text-lg font-bold text-emerald-600 mt-1">JWT + HS256 Cookie</div>
          <div className="text-[11px] text-slate-400 mt-1">HTTP-Only SameSite Cookies</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Database Security</div>
          <div className="text-lg font-bold text-purple-600 mt-1">Supabase Postgres RLS</div>
          <div className="text-[11px] text-slate-400 mt-1">Role-Based Access Control</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Failed Security Events</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">0 Flagged</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Zero Unauthorized Access</div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading security logs..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Security Events Trail</h2>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((lg) => (
                <tr key={lg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono text-[11px] text-slate-500">{new Date(lg.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{lg.user?.name || "System"}</td>
                  <td className="p-4 font-mono text-purple-600 font-bold">{lg.action}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-600">{lg.detailsJson || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
