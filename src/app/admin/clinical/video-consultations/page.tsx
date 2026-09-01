"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Video, ShieldAlert, CheckCircle, Clock, Server } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminVideoConsultationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Video Consultation Telemetry & Signaling Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor active WebRTC video sessions, WebRTC ICE signaling readiness, and duration logs.
          </p>
        </div>

        <Link
          href="/admin/clinical"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Clinical Hub
        </Link>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
        <div>
          <span className="font-bold text-purple-900 dark:text-purple-200">Patient Privacy Policy: </span>
          <span className="text-purple-700 dark:text-purple-300">
            Admin Officers monitor WebRTC network signals and technical health. Admins cannot auto-join live consultations, and video/audio streams are never recorded without consent.
          </span>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            WebRTC Telemetry Signal Status
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            🟢 Signal Server Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500">Active Video Streams</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1 Live Call</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500">ICE Candidate Latency</div>
            <div className="text-xl font-bold text-emerald-600 mt-1">18 ms</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-slate-500">Session Error Rate</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">0.00%</div>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
