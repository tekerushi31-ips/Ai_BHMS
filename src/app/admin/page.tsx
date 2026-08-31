"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  BookOpen,
  PlusCircle,
  CheckCircle,
  Clock,
  Layers,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "ORGANON",
    author: "",
    sourceBook: "",
    chapterOrAphorism: "",
    sectionTitle: "",
    content: "",
    keywords: "",
    verificationStatus: "VERIFIED",
  });

  const loadDocuments = () => {
    setLoading(true);
    fetch("/api/admin/knowledge")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verificationStatus: newStatus }),
      });
      if (res.ok) {
        loadDocuments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setForm({
          title: "",
          category: "ORGANON",
          author: "",
          sourceBook: "",
          chapterOrAphorism: "",
          sectionTitle: "",
          content: "",
          keywords: "",
          verificationStatus: "VERIFIED",
        });
        loadDocuments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#090D16] min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Knowledge Base Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage classical homoeopathic corpus, aphorism chunks, and verification lifecycle (DRAFT → REVIEW → VERIFIED → PUBLISHED).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Knowledge Entry
        </button>
      </div>

      {/* Verification Workflow Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Verification Pipeline:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
            DRAFT
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono text-[10px]">
            REVIEW
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-mono text-[10px] font-bold">
            VERIFIED
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono text-[10px] font-bold">
            PUBLISHED
          </span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          Only VERIFIED & PUBLISHED records are returned to doctors during clinical RAG searches.
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <LoadingSpinner label="Loading knowledge base records..." />
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.title}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Author: {doc.author} • Category: {doc.category} • Source: {doc.sourceBook}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={doc.verificationStatus}
                    onChange={(e) => handleUpdateStatus(doc.id, e.target.value)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                      doc.verificationStatus === "VERIFIED" || doc.verificationStatus === "PUBLISHED"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>

              {/* Chunks */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  Text Chunks ({doc.chunks?.length || 0}):
                </div>
                <div className="space-y-1.5">
                  {doc.chunks?.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{c.sectionTitle} {c.chapterOrAphorism ? `(${c.chapterOrAphorism})` : ""}</span>
                        {c.verifiedOnly && (
                          <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                            Verified Clinical RAG
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-elevated animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Add Verified Knowledge Entry
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Organon of Medicine (6th Ed)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                  >
                    <option value="ORGANON">ORGANON</option>
                    <option value="MATERIA_MEDICA">MATERIA_MEDICA</option>
                    <option value="REPERTORY">REPERTORY</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="PHILOSOPHY">PHILOSOPHY</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Dr. Samuel Hahnemann"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aphorism / Remedy
                  </label>
                  <input
                    type="text"
                    value={form.chapterOrAphorism}
                    onChange={(e) => setForm({ ...form, chapterOrAphorism: e.target.value })}
                    placeholder="e.g. Aphorism §153"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={form.sectionTitle}
                    onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })}
                    placeholder="e.g. Characteristic Symptoms"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Text Content Passage *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter the verbatim authoritative homeopathic text passage..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  {submitting ? "Saving..." : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
