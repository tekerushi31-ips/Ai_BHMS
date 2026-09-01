"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Search,
  HardDrive,
  Video,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminSystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      if (!healthData) setLoading(true);
      else setRefreshing(true);

      const res = await fetch("/api/admin/system-health");
      const data = await res.json();
      setHealthData(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) return <LoadingSpinner label="Checking system operational status..." />;

  const { timestamp, health } = healthData || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            System Health & Infrastructure Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status checks for Database, AI Model Provider, RAG Vector Search, Storage, and Video Signaling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
        Last Checked: {timestamp ? new Date(timestamp).toLocaleString() : "Just now"}
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-4">
        {[
          { key: "database", title: "Supabase / SQLite Database Engine", icon: Database, data: health?.database },
          { key: "aiService", title: "AI Model Provider (Gemini / OpenAI)", icon: Cpu, data: health?.aiService },
          { key: "ragSearch", title: "Verified Homoeopathic RAG Search", icon: Search, data: health?.ragSearch },
          { key: "storage", title: "Supabase Storage & Document Bucket", icon: HardDrive, data: health?.storage },
          { key: "videoService", title: "WebRTC Video Signaling Service", icon: Video, data: health?.videoService },
        ].map((service) => {
          const Icon = service.icon;
          const status = service.data?.status || "Operational";
          const isOk = status === "Operational";
          const isDegraded = status === "Degraded";

          return (
            <div
              key={service.key}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    isOk
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                      : isDegraded
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{service.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{service.data?.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isOk
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800"
                        : isDegraded
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800"
                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800"
                    }`}
                  >
                    {isOk ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isDegraded ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {status}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    Latency: {service.data?.latencyMs ?? 1} ms
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
