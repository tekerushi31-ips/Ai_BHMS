"use client";

import React, { useState, useEffect } from "react";
import {
  FilePlus,
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldAlert,
  X,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function PatientReportsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload Form
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [docType, setDocType] = useState("LAB_REPORT");

  // AI Explainer Modal
  const [explainingDoc, setExplainingDoc] = useState<any>(null);
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [explainingLoading, setExplainingLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/patient/reports");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch {
      alert("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!reportName.trim()) {
      alert("Please enter report name.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/patient/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reportName.trim(),
          documentType: docType,
          fileSize: "1.2 MB",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Report added to your health records!");
        setIsUploadOpen(false);
        setReportName("");
        fetchDocuments();
      }
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/patient/reports?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch {
      alert("Failed to delete document.");
    }
  }

  async function handleExplainReport(doc: any) {
    setExplainingDoc(doc);
    setExplainingLoading(true);
    setExplanationResult(null);

    try {
      const res = await fetch("/api/patient/reports/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: doc.id,
          reportName: doc.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.explanation) {
        setExplanationResult(data.explanation);
      }
    } catch {
      alert("Failed to generate AI report explanation.");
    } finally {
      setExplainingLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FilePlus className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reports & Medical Documents
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Securely upload, store, and understand your laboratory blood tests and diagnostic reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading your medical files...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500 space-y-3">
          <p>No medical reports uploaded yet.</p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
          >
            + Upload First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {doc.documentType.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {doc.fileSize || "1.2 MB"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>

                {doc.aiExplanation && (
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" /> AI Summary:
                    </span>
                    <p className="line-clamp-2">{doc.aiExplanation}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleExplainReport(doc)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Explain Report
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading "${doc.name}"...`)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    title="Download Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                    title="Delete Report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" /> Upload Health Document
              </h2>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Report / Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g. Thyroid Profile, Lipid Panel, Chest X-Ray..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="LAB_REPORT">Laboratory Blood Test (CBC, IgE, LFT)</option>
                  <option value="PRESCRIPTION">External Doctor Prescription</option>
                  <option value="SCAN">Imaging / X-Ray / Ultrasound</option>
                  <option value="OTHER">Other Health Document</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1 bg-slate-50 dark:bg-[#1A2234]">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Select PDF, JPG, or PNG
                </span>
                <span className="text-[10px] text-slate-400">Maximum upload size: 10 MB</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {uploading ? "Uploading..." : "Add to Health Records"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Explainer Modal */}
      {explainingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Report Terminology Explainer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setExplainingDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Safety Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Important Notice:</strong> This is general educational information to help you understand medical terms. It does NOT diagnose conditions or replace clinical interpretation by your doctor.
              </p>
            </div>

            {explainingLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-medium text-slate-500">
                  Translating medical parameters into plain language...
                </p>
              </div>
            ) : explanationResult ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {explanationResult.reportTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {explanationResult.summary}
                  </p>
                </div>

                {/* Medical Terms Breakdown */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                    Key Laboratory Parameters Explained:
                  </span>
                  {explanationResult.terms?.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                    >
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold block">
                        {t.term}
                      </strong>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {t.simplified}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <strong>Clinical Meaning:</strong> {t.generalMeaning}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recommended Questions */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-2">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-600" /> Questions to Discuss with Your Doctor:
                  </span>
                  <ul className="space-y-1.5 text-purple-950 dark:text-purple-200">
                    {explanationResult.recommendedQuestions?.map((q: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setExplainingDoc(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
