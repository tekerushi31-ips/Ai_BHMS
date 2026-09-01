"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle, Search, Filter } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminAiAnalyticsPage() {
  const [feedbackList, setFeedbackList] = useState([
    {
      id: "fb-1",
      user: "Aarav Sharma (Student)",
      copilot: "Student AI",
      query: "Differentiate Bryonia and Rhus Tox in Joint Pain",
      rating: "POSITIVE",
      comment: "Excellent Organon §26 reference and clear comparison table.",
      status: "RESOLVED",
      date: "2026-08-31",
    },
    {
      id: "fb-2",
      user: "Dr. Vikram Sharma (Doctor)",
      copilot: "Doctor AI",
      query: "Kent Rubric for Anxiety about health",
      rating: "POSITIVE",
      comment: "Accurate Boericke remedy gradations provided.",
      status: "RESOLVED",
      date: "2026-08-30",
    },
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Telemetry & Feedback Review Loop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review user AI feedback (Thumbs Up / Down) to continuously improve RAG retrieval accuracy and prompt safety.
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Analytics
        </Link>
      </div>

      {/* AI Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">User Satisfaction Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">98.4%</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on positive feedback votes</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">RAG Retrieval Success</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">99.1%</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified Organon/Boericke grounding</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <div className="text-xs text-slate-500 font-medium">Reported AI Issues</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0 Open</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">All feedback items reviewed</div>
        </div>
      </div>

      {/* Feedback Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Recent AI Feedback Audit Logs</h2>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Copilot</th>
              <th className="p-4">Query</th>
              <th className="p-4">Rating</th>
              <th className="p-4">User Comment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {feedbackList.map((fb) => (
              <tr key={fb.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{fb.user}</td>
                <td className="p-4 text-purple-600 font-medium">{fb.copilot}</td>
                <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{fb.query}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <ThumbsUp className="w-3.5 h-3.5" /> Positive
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-[11px]">{fb.comment}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {fb.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
