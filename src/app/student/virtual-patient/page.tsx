"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserCheck,
  Send,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function VirtualPatientPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<Array<{ sender: string; text: string; timestamp: string }>>([]);
  const [factsDiscovered, setFactsDiscovered] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [endingCase, setEndingCase] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/student/virtual-patient/cases")
      .then((res) => res.json())
      .then((data) => {
        setCases(data.cases || []);
        if (data.cases && data.cases.length > 0) {
          setSelectedCase(data.cases[0]);
        }
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, loading]);

  const handleStartCase = async (caseToStart?: any) => {
    const c = caseToStart || selectedCase;
    if (!c) return;

    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/student/virtual-patient/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: c.id }),
      });
      const data = await res.json();
      setSession(data.session);
      setTranscript(data.session.transcript || []);
      setFactsDiscovered(data.session.factsDiscovered || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !session || loading || session.status === "COMPLETED") return;

    const userText = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/student/virtual-patient/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          message: userText,
        }),
      });
      const data = await res.json();
      setTranscript(data.transcript);
      setFactsDiscovered(data.factsDiscovered || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCase = async () => {
    if (!session || endingCase) return;
    setEndingCase(true);
    try {
      const res = await fetch("/api/student/virtual-patient/end-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      setReport(data);
      setSession((prev: any) => ({ ...prev, status: "COMPLETED" }));
    } catch (e) {
      console.error(e);
    } finally {
      setEndingCase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            AI Virtual Patient Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conduct realistic homeopathic consultations. Uncover concealed modalities, mental generals, and receive instant performance feedback.
          </p>
        </div>

        {session && session.status !== "COMPLETED" && (
          <button
            onClick={handleEndCase}
            disabled={endingCase || transcript.length < 2}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            {endingCase ? "Evaluating Case..." : "End Case & Generate Report"}
          </button>
        )}
      </div>

      {/* Case Selection or Active Consultation */}
      {!session ? (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Select a Fictional Patient Encounter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-200/50 dark:border-cyan-800/50">
                      {c.gender === "Female" ? "👩" : "👨"}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        c.difficulty === "BEGINNER"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {c.age} years • {c.gender} • {c.occupation}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {c.educationalNotes}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleStartCase(c)}
                    className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Begin Anamnesis Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Consultation Chat */}
          <div className="lg:col-span-2 flex flex-col h-[600px] bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
            {/* Patient Bar */}
            <div className="p-4 bg-slate-50 dark:bg-[#1A2234] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 flex items-center justify-center text-xl border border-cyan-200/50 dark:border-cyan-800/50">
                  {session.case?.gender === "Female" ? "👩" : "👨"}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {session.case?.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Simulated Patient Encounter • Fictional Case
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                  {factsDiscovered.length} Fact(s) Elicited
                </span>
                <button
                  onClick={() => setSession(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.sender === "STUDENT" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "PATIENT" && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs border border-cyan-200/50 dark:border-cyan-800/50">
                      Pt
                    </div>
                  )}

                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "STUDENT"
                        ? "bg-cyan-700 dark:bg-cyan-800 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-[#1A2234] text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === "STUDENT" ? "text-cyan-200" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {msg.sender === "STUDENT" && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs border border-slate-800 dark:border-slate-700">
                      Dr
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center text-xs text-slate-400 dark:text-slate-500">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-600/30 dark:border-cyan-400/30 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin" />
                  <span>Patient is answering...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar or Completed State */}
            {session.status !== "COMPLETED" ? (
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the patient: (e.g., 'What time of day is the pain worse?', 'What foods do you crave?')..."
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-center text-xs font-semibold border-t border-purple-200 dark:border-purple-800">
                Case consultation concluded. See detailed evaluation report on the right.
              </div>
            )}
          </div>

          {/* Right Col: Discovered Clues & Performance Report */}
          <div className="space-y-4">
            {report ? (
              /* Case Performance Report */
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Case Performance Report
                  </h3>
                  <span className="text-base font-extrabold text-purple-700 dark:text-purple-300">
                    {report.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Completeness</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {report.report.completenessScore}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Question Quality</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {report.report.questioningScore}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Key Facts Elicited:</div>
                  <div className="space-y-1">
                    {report.report.factsDiscovered.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {report.report.factsMissed.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span>Missed: {f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">Target Simillimum:</div>
                  <div className="text-clinical-700 dark:text-clinical-400 font-bold">{report.targetRemedy}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {report.educationalNotes}
                  </p>
                </div>

                <button
                  onClick={() => handleStartCase()}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Restart Simulation
                </button>
              </div>
            ) : (
              /* Live Anamnesis Status */
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Elicited Domains
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Live Tracker</span>
                </div>

                <div className="space-y-2 text-xs">
                  {factsDiscovered.length === 0 ? (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                      Begin asking questions to uncover symptom modalities, mental generals, and thermal traits.
                    </p>
                  ) : (
                    factsDiscovered.map((f, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/60 text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Case Taking Tip
                  </div>
                  <p className="leading-snug">
                    Remember to inquire into time modalities (&lt; morning/night), thermal reactions (chilly vs hot), and emotional triggers to find the simillimum.
                  </p>
                </div>
              </div>
            )}

            <ClinicalDisclaimer compact />
          </div>
        </div>
      )}
    </div>
  );
}
