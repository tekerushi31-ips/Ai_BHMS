"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Save, CheckCircle, Lock, Globe } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Platform settings saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Central Platform Preferences & Maintenance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global application configuration, default language, and maintenance mode controls.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {statusMessage && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-6 text-xs">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">System Maintenance Mode</div>
            <div className="text-slate-500 mt-0.5">When enabled, non-admin users will see a maintenance notice.</div>
          </div>

          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              maintenanceMode ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                maintenanceMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default System Language</label>
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Marathi">Marathi (मराठी)</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Platform Preferences
        </button>
      </form>

      <ClinicalDisclaimer compact />
    </div>
  );
}
