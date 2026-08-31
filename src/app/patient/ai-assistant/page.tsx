"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  ShieldAlert,
  Bot,
  User,
  HelpCircle,
  AlertTriangle,
  FileQuestion,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "USER" | "AI";
  content: string;
  isEmergency?: boolean;
}

export default function PatientAiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "AI",
      content: `Hello! I am your **Patient Educational Health Assistant**.

I can help you:
- 📖 **Explain medical & lab test terms** in simple, everyday language.
- 📋 **Formulate thoughtful questions** to discuss with your homoeopathic doctor.
- 🎒 **Prepare symptom notes and documents** for your upcoming appointment.

*Please note: I am an educational assistant and do not provide medical diagnosis, prescription, or emergency care.*`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const query = text || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "USER",
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/patient/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query.trim() }),
      });

      const data = await res.json();
      if (data.success && data.response) {
        const aiMsg: ChatMessage = {
          id: "ai-" + Date.now(),
          sender: "AI",
          content: data.response.content,
          isEmergency: data.response.isEmergency,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      alert("Failed to get response from AI assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Patient Educational AI Assistant
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Understand your health records, translate laboratory parameters, and prepare questions for your doctor.
          </p>
        </div>
      </div>

      {/* Visible Emergency Safety Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold block">
            Educational Decision-Support Notice — Not an Emergency Service
          </span>
          <p>
            The AI assistant does not diagnose, prescribe remedies, adjust dosages, or replace professional medical consultations. If you are experiencing an urgent medical emergency, call your local emergency services (108 / 112) immediately.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === "USER";
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-purple-600 text-white"
                      : m.isEmergency
                      ? "bg-rose-600 text-white"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-1 shadow-xs ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tr-xs"
                      : m.isEmergency
                      ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-xs"
                      : "bg-slate-50 dark:bg-[#1A2234] border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-200" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/60 dark:bg-[#151D2C] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Quick prompts:</span>
          <button
            type="button"
            onClick={() => handleSend("What does Absolute Eosinophil Count mean?")}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 shrink-0 transition-colors"
          >
            🔬 What does Eosinophil Count mean?
          </button>
          <button
            type="button"
            onClick={() => handleSend("What questions should I ask my doctor about my allergy remedy?")}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 shrink-0 transition-colors"
          >
            📋 Questions to ask my doctor
          </button>
          <button
            type="button"
            onClick={() => handleSend("What should I bring to my appointment?")}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 shrink-0 transition-colors"
          >
            🎒 What to bring to my visit
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask an educational question about medical terms or visit preparation..."
              className="flex-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Ask AI
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
