"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Calendar,
  History,
  FileText,
  MessageSquare,
  Check,
} from "lucide-react";

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/patient/notifications");
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch {
      alert("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/patient/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "ALL" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      alert("Failed to mark all notifications as read.");
    }
  }

  async function markOneRead(id: string) {
    try {
      await fetch("/api/patient/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      alert("Failed to mark notification as read.");
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "FOLLOWUP":
        return <History className="w-4 h-4 text-amber-500" />;
      case "REPORT":
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case "MESSAGE":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-teal-500" />;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications & Alerts
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay informed on appointment confirmations, doctor replies, and report processing updates.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
          No notifications at this time.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markOneRead(n.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.isRead
                  ? "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-80"
                  : "bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80 text-slate-900 dark:text-white shadow-xs"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {n.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
