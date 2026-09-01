"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Search, CheckCircle } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminOrganonPage() {
  const aphorisms = [
    { aphorism: 1, topic: "The Physician's High and Only Mission", summary: "The physician's high and only mission is to restore the sick to health, to cure, as it is termed.", edition: "Organon 6th Edition", status: "VERIFIED" },
    { aphorism: 2, topic: "The Highest Ideal of Cure", summary: "The highest ideal of cure is rapid, gentle and permanent restoration of health...", edition: "Organon 6th Edition", status: "VERIFIED" },
    { aphorism: 3, topic: "Knowledge of Physician", summary: "If the physician clearly perceives what is to be cured in diseases...", edition: "Organon 6th Edition", status: "VERIFIED" },
    { aphorism: 26, topic: "Law of Similars (Therapeutic Law of Nature)", summary: "A weaker dynamic affection is permanently extinguished in the living organism by a stronger one...", edition: "Organon 6th Edition", status: "VERIFIED" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Organon of Medicine Aphorisms (§1 - §291)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Hahnemannian aphorisms, topics, summaries, and verified Organon 6th edition text.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Knowledge Base
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Organon Aphorism Index</h2>
          <span className="text-xs font-semibold text-purple-600">4 Verified Aphorisms</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="p-4">§ Aphorism</th>
              <th className="p-4">Topic / Philosophy</th>
              <th className="p-4">Summary & Text Snippet</th>
              <th className="p-4">Edition</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {aphorisms.map((a) => (
              <tr key={a.aphorism} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-4 font-bold text-purple-600 font-mono">§ {a.aphorism}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{a.topic}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{a.summary}</td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">{a.edition}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {a.status}
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
