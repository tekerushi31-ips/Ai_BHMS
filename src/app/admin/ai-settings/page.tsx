"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bot,
  Sliders,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Cpu,
  Layers,
  FileText,
  Lock,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminAiSettingsPage() {
  const [config, setConfig] = useState<any>({
    aiModel: "gemini-1.5-flash",
    temperature: "0.2",
    maxTokens: "1500",
    ragRetrievalCount: "5",
    defaultLanguage: "English",
    studentSystemPromptVersion: "v2.1-grounded-organon",
    doctorSystemPromptVersion: "v3.0-clinical-repertory",
    facultySystemPromptVersion: "v1.4-viva-evaluation",
    patientSystemPromptVersion: "v1.0-health-literacy",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-settings");
      if (!res.ok) throw new Error("Failed to load AI settings");
      const data = await res.json();
      setConfig(data.config || {});
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: "error", message: e.message || "Failed to load AI configuration" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update AI configuration");

      setStatusMessage({ type: "success", message: "AI Settings updated successfully." });
    } catch (e: any) {
      setStatusMessage({ type: "error", message: e.message || "Failed to save AI configuration." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading AI Configuration..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Provider & Prompt Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure active LLM model, temperature, RAG retrieval count, and Copilot system prompt versions.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Security Warning Banner */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs flex items-center gap-3">
        <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
        <div>
          <span className="font-bold text-purple-900 dark:text-purple-200">Server Security Assurance: </span>
          <span className="text-purple-700 dark:text-purple-300">
            API Keys (`AI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly server-side in process environment variables and are never rendered in the frontend.
          </span>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Parameters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active LLM Model & Generation Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active AI Model
              </label>
              <select
                value={config.aiModel}
                onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast RAG)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Precision)</option>
                <option value="openai-gpt-4o">GPT-4o (Clinical)</option>
                <option value="demo-fallback">Demo Fallback Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Temperature (Creativity: 0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.0"
                max="1.0"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Response Tokens
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RAG Retrieval Chunks (Organon/Boericke)
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={config.ragRetrievalCount}
                onChange={(e) => setConfig({ ...config, ragRetrievalCount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Platform Language
              </label>
              <select
                value={config.defaultLanguage}
                onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Prompt Version Control */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-clinical-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              System Prompt Version Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Copilot System Prompt
              </label>
              <input
                type="text"
                value={config.studentSystemPromptVersion}
                onChange={(e) => setConfig({ ...config, studentSystemPromptVersion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Doctor Copilot System Prompt
              </label>
              <input
                type="text"
                value={config.doctorSystemPromptVersion}
                onChange={(e) => setConfig({ ...config, doctorSystemPromptVersion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Copilot System Prompt
              </label>
              <input
                type="text"
                value={config.facultySystemPromptVersion}
                onChange={(e) => setConfig({ ...config, facultySystemPromptVersion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient Assistant System Prompt
              </label>
              <input
                type="text"
                value={config.patientSystemPromptVersion}
                onChange={(e) => setConfig({ ...config, patientSystemPromptVersion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save AI Configuration
              </>
            )}
          </button>
        </div>
      </form>

      <ClinicalDisclaimer compact />
    </div>
  );
}
