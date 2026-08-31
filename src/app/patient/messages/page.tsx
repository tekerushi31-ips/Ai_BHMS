"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Stethoscope,
  Clock,
  CheckCircle,
  Paperclip,
} from "lucide-react";

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/patient/messages");
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      if (data.doctor) setDoctor(data.doctor);
    } catch {
      alert("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/patient/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          doctorId: doctor?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Doctor Consultation Chat
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Direct, secure asynchronous communication with your treating homoeopathic physician.
          </p>
        </div>

        {doctor && (
          <div className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{doctor.name}</div>
              <div className="text-slate-500 text-[11px]">{doctor.specialization}</div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Connecting to secure messaging channel...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No messages exchanged yet. Send a query below to start a conversation with Dr. Sharma.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderRole === "PATIENT";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                    <span>{isMe ? "You" : doctor?.name || "Doctor"}</span>
                    <span>•</span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-purple-600 text-white rounded-br-xs"
                        : "bg-slate-100 dark:bg-[#1A2234] text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-bl-xs"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message or question for Dr. Sharma..."
              className="flex-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-5 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
