"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  User,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { AISource } from "@/types";
import { ClinicalDisclaimer } from "@/components/common";

interface Message {
  id: string;
  sender: "USER" | "AI";
  content: string;
  sources?: AISource[];
  timestamp: string;
}

export default function StudentAiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      sender: "AI",
      content: `Welcome to **BHMS AI Tutor**! 🎓\n\nI am your educational assistant grounded in **Hahnemann's Organon of Medicine (6th Edition)**, **Boericke's Materia Medica**, and **Kent's Repertory**.\n\nHow can I assist your study today? Select a topic or type any question regarding aphorisms, remedy keynotes, or repertorial rubric synthesis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<AISource | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Explain Aphorism §153 (Characteristic vs Common Symptoms)",
    "Differentiate Arsenicum Album, Sulphur & Apis burning sensations",
    "Explain Lycopodium 4-8 PM aggravation & digestive keynote triad",
    "How to convert patient language into Kent Repertory rubrics?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    setError(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "USER",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/student/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI service is temporarily unavailable.");
      }

      setConversationId(data.conversationId);

      const aiMsg: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        sender: "AI",
        content: data.content,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.sources && data.sources.length > 0) {
        setSelectedSource(data.sources[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach AI Tutor.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setConversationId(null);
    setSelectedSource(null);
    setMessages([
      {
        id: "cleared-welcome",
        sender: "AI",
        content: `New session started. Ask any BHMS curriculum topic to explore homoeopathic principles and remedy differentiations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1A2234] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-clinical-600 dark:bg-clinical-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                BHMS AI Tutor
                <span className="text-[10px] font-semibold bg-clinical-100 dark:bg-clinical-950/80 text-clinical-800 dark:text-clinical-300 px-1.5 py-0.2 rounded border border-clinical-200 dark:border-clinical-800">
                  Pedagogical Engine
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounded in Organon of Medicine & Boericke Materia Medica
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "AI" && (
                <div className="w-7 h-7 rounded-lg bg-clinical-100 dark:bg-clinical-950/80 text-clinical-700 dark:text-clinical-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-clinical-200/50 dark:border-clinical-800/50">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                  msg.sender === "USER"
                    ? "bg-clinical-600 dark:bg-clinical-700 text-white rounded-br-none"
                    : "bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.content}
                </div>

                {/* Attached RAG Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5">
                      <BookOpen className="w-3 h-3 text-clinical-600 dark:text-clinical-400" />
                      Retrieved Authoritative Citations ({msg.sources.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSource(src)}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-clinical-50 dark:hover:bg-clinical-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-clinical-700 dark:hover:text-clinical-300 text-[10px] font-medium transition-colors flex items-center gap-1"
                        >
                          <span>{src.sourceBook || src.title}</span>
                          {src.chapterOrAphorism && (
                            <span className="text-slate-400 dark:text-slate-500">({src.chapterOrAphorism})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === "USER" ? "text-teal-100 dark:text-teal-200" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "USER" && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-800 dark:border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#1A2234] p-3 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm">
              <div className="w-4 h-4 border-2 border-clinical-600/30 dark:border-clinical-400/30 border-t-clinical-600 dark:border-t-clinical-400 rounded-full animate-spin flex-shrink-0" />
              <span>Synthesizing homoeopathic literature & reasoning...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-100 rounded text-[11px] font-medium"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="p-2.5 bg-slate-50/80 dark:bg-[#151D2C] border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-clinical-50 dark:hover:bg-clinical-950/60 border border-slate-200 dark:border-slate-700 hover:border-clinical-300 dark:hover:border-clinical-700 text-slate-600 dark:text-slate-300 hover:text-clinical-700 dark:hover:text-clinical-300 text-[11px] whitespace-nowrap transition-colors flex-shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-clinical-500 dark:text-clinical-400" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything on Organon, Materia Medica, or Kent Repertory (e.g., 'Explain Organon §153')..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* RAG Source & Citation Inspector Panel */}
      <div className="w-full lg:w-80 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft p-4 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-clinical-600 dark:text-clinical-400" />
            Authoritative Citation
          </h3>
          <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
            Verified Source
          </span>
        </div>

        {selectedSource ? (
          <div className="mt-3 space-y-3 flex-1 overflow-y-auto text-xs">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Source Document
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{selectedSource.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Author: {selectedSource.author}</div>
            </div>

            {selectedSource.chapterOrAphorism && (
              <div className="p-2 rounded-lg bg-clinical-50 dark:bg-clinical-950/40 border border-clinical-100 dark:border-clinical-900/60 text-clinical-900 dark:text-clinical-200">
                <div className="text-[10px] font-bold uppercase text-clinical-700 dark:text-clinical-400">
                  Aphorism / Remedy
                </div>
                <div className="font-semibold">{selectedSource.chapterOrAphorism}</div>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">
                Verified Text Passage
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] max-h-64 overflow-y-auto">
                {selectedSource.passage}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Category: {selectedSource.category}</span>
              {selectedSource.relevanceScore && (
                <span>Relevance: {Math.round(selectedSource.relevanceScore * 100)}%</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">
              When the AI tutor answers using homoeopathic literature, click on any citation badge to inspect verified source passages here.
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <ClinicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
