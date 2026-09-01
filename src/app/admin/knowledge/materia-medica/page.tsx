"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, CheckCircle } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminMateriaMedicaPage() {
  const remedies = [
    { id: "m-1", name: "Arsenicum Album", keynotes: "Prostration, Burning pain relieved by heat, Restlessness, Fear of death.", source: "Boericke's Materia Medica", status: "PUBLISHED" },
    { id: "m-2", name: "Bryonia Alba", keynotes: "Aggravation from least motion, Great thirst for large quantities of cold water, Irritability.", source: "Boericke's Materia Medica", status: "PUBLISHED" },
    { id: "m-3", name: "Pulsatilla Nigricans", keynotes: "Changeable symptoms, Thirstlessness with dry mouth, Desires open air, Weeping disposition.", source: "Boericke's Materia Medica", status: "PUBLISHED" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Materia Medica Remedy & Keynote Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage classical remedy characteristics, keynotes, modalities, and verified author citations (Boericke, Allen, Kent).
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Remedy Corpus Catalog</h2>
          <span className="text-xs font-semibold text-purple-600">3 Verified Remedies</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="p-4">Remedy Name</th>
              <th className="p-4">Core Clinical Keynotes</th>
              <th className="p-4">Source & Citation</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {remedies.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{m.keynotes}</td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">{m.source}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {m.status}
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
