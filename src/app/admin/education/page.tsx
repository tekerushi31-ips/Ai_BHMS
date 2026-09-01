"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, Award, FileText, CheckCircle } from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

export default function AdminEducationPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-clinical-600 dark:text-clinical-400" />
            Education & Exam Engine Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage practice quizzes, AIAPGET question banks, AI Viva topics, and mystery clinical cases.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <HelpCircle className="w-5 h-5 text-clinical-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Practice Quiz Bank</h3>
          <p className="text-xs text-slate-500">250 Active MCQs across 8 BHMS Subjects</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">AIAPGET Question Bank</h3>
          <p className="text-xs text-slate-500">120 Post-Graduate Entrance Questions</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <FileText className="w-5 h-5 text-cyan-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Viva Exam Topics</h3>
          <p className="text-xs text-slate-500">45 Oral Viva Clinical Scenarios</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Mystery Cases Hub</h3>
          <p className="text-xs text-slate-500">12 Faculty-Created Mystery Cases</p>
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
