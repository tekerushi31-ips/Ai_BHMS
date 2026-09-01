"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Send, CheckCircle, AlertCircle } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(`Platform announcement broadcasted to target: ${targetRole}`);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Platform Announcements & Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Broadcast platform updates, scheduled maintenance notices, or new feature alerts.
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

      <form onSubmit={handleBroadcast} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Users (Students, Doctors, Faculty, Patients)</option>
            <option value="STUDENT">Students Only 🎓</option>
            <option value="DOCTOR">Doctors Only 👨‍⚕️</option>
            <option value="PATIENT">Patients Only 🏥</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled System Maintenance / New Materia Medica Corpus Added"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement description..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </form>

      <ClinicalDisclaimer compact />
    </div>
  );
}
