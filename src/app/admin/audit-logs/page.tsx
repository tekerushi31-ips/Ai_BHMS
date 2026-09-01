"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Shield, Search, Filter, FileText, CheckCircle } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  detailsJson: string | null;
  createdAt: string;
  user?: { name: string; email: string; role: string } | null;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/audit-logs?action=${actionFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            Security & Admin Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of role changes, user activations, feature toggles, and knowledge modifications.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Action Filter:
        </span>
        {["ALL", "USER_ACTIVATED", "USER_DEACTIVATED", "USER_ROLE_UPDATED", "FEATURE_TOGGLED", "AI_SETTING_CHANGED", "PATIENT_CREATED"].map(
          (act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                actionFilter === act
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {act}
            </button>
          )
        )}
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <LoadingSpinner label="Loading security audit records..." />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No audit log events found for selected filter.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin / User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {log.user ? `${log.user.name} (${log.user.role})` : log.userId || "System"}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {log.resource} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ""}
                    </td>

                    <td className="p-4 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs truncate font-mono">
                      {log.detailsJson || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
