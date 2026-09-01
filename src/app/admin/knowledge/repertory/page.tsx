"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers, Plus, Search, CheckCircle, Clock } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminRepertoryPage() {
  const [rubrics, setRubrics] = useState([
    { id: "r-1", chapter: "MIND", rubric: "Anxiety, about future", remedies: "Ars. (3), Acon. (2), Bry. (1)", source: "Kent's Repertory", status: "VERIFIED" },
    { id: "r-2", chapter: "HEAD", rubric: "Pain, pressive, in forehead", remedies: "Bell. (3), Bry. (3), Puls. (2)", source: "Kent's Repertory", status: "VERIFIED" },
    { id: "r-3", chapter: "STOMACH", rubric: "Thirst, for cold water in large quantities", remedies: "Bry. (3), Phos. (3), Nat-m. (2)", source: "Kent's Repertory", status: "VERIFIED" },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Repertory Rubric & Hierarchy Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage classical Kent repertory chapters, rubrics, remedy gradations (1-3), and verification lifecycle.
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Indexed Classical Rubrics</h2>
          <span className="text-xs font-semibold text-purple-600">3 Verified Rubrics</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="p-4">Chapter</th>
              <th className="p-4">Rubric Description</th>
              <th className="p-4">Remedies & Gradations</th>
              <th className="p-4">Source</th>
              <th className="p-4">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rubrics.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-4 font-bold text-purple-600">{r.chapter}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{r.rubric}</td>
                <td className="p-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">{r.remedies}</td>
                <td className="p-4 text-slate-500">{r.source}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {r.status}
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
