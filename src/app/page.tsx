import Link from "next/link";
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  Mic,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  User,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ClinicalDisclaimer } from "@/components/common";
import { HomeRoleCardAction } from "@/components/home/HomeRoleCardActions";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex-1 flex flex-col justify-between transition-colors">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clinical-50 dark:bg-clinical-950/60 border border-clinical-200 dark:border-clinical-800 text-clinical-800 dark:text-clinical-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-clinical-600 dark:text-clinical-400" />
            Next-Gen Homoeopathic Medical Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            BHMS AI — <span className="text-clinical-600 dark:text-clinical-400">Clinical & Learning</span> Copilot
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            One Unified Core Engine. Two specialized roles: Empowering BHMS students to master classical theory and examination, while giving homoeopathic practitioners precision case structuring, RAG knowledge retrieval, and follow-up analytics.
          </p>

          {/* Role Choice Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8 text-left">
            {/* Student Role Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-clinical-300 dark:hover:border-clinical-700 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-clinical-100 dark:bg-clinical-950/80 text-clinical-700 dark:text-clinical-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-clinical-200/40 dark:border-clinical-800/60">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    For BHMS Students
                    <span className="text-[10px] font-semibold bg-clinical-50 dark:bg-clinical-950/80 text-clinical-700 dark:text-clinical-400 border border-clinical-200 dark:border-clinical-800 px-2 py-0.5 rounded">
                      Learning Copilot
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Interactive AI Tutor grounded in Organon & Boericke, conversational Virtual Patients, progressive Case Simulator, AI Viva grading, and AIAPGET quiz engine.
                  </p>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-500" />
                    AI Virtual Patient Anamnesis & End-Case Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-500" />
                    Live Oral Viva Exam grading across 8 BHMS subjects
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-500" />
                    Real-time study recommendations from stored performance
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <HomeRoleCardAction targetRole="STUDENT" user={user} />
              </div>
            </div>

            {/* Doctor Role Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-cyan-200/40 dark:border-cyan-800/60">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    For BHMS Doctors
                    <span className="text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                      Clinical Copilot
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    15-section Digital Case Sheet, multi-lingual Voice STT (Marathi/Hindi/Hinglish), Kent Repertory Assistant, Follow-up Analyzer, and strict tenant-isolated patient records.
                  </p>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    AI Anamnesis Structuring & Red Flag Safety Screen
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Verified-only RAG Search (Kent, Boericke, Organon)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Objective Follow-up Trajectory based on Kent Observations
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <HomeRoleCardAction targetRole="DOCTOR" user={user} />
              </div>
            </div>

            {/* Patient Role Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/40 dark:border-emerald-800/60">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    For Patients
                    <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      Patient Portal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Access your appointments, health records, reports, follow-ups and secure communication with your doctor from one place.
                  </p>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    View appointments & upcoming visits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Access shared health records & reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Submit follow-up information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Securely communicate with your doctor
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <HomeRoleCardAction targetRole="PATIENT" user={user} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Authoritative Homoeopathic Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Engineered with medical AI guardrails, strict verified-only citations, and tenant isolation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <BookOpen className="w-5 h-5 text-clinical-600 dark:text-clinical-400 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Verified Knowledge RAG</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Zero hallucinated sources. Returns "No verified source found" when below threshold.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <Mic className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Multilingual Voice STT</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Transcribes English, Marathi, and Hinglish dialogue with doctor review flow.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Repertory Assistant</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Kent rubric matching with mandatory manual practitioner confirmation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Tenant & Privacy Safe</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Doctor-scoped patient queries and clear separation between fictional and clinical records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Disclaimer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ClinicalDisclaimer />
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          BHMS AI Copilot v2.0 • Designed for Homoeopathic Education & Clinical Decision Support.
        </div>
      </footer>
    </div>
  );
}
