"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  History,
  FileText,
  FilePlus,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Bell,
  Stethoscope,
  Heart,
  Video,
} from "lucide-react";

export default function PatientDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/patient/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      alert("Failed to load patient health dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your health portal...</p>
      </div>
    );
  }

  const patientName = data?.user?.name || "Valued Patient";
  const upcoming = data?.upcomingAppointment;
  const lastVisit = data?.lastVisit;
  const doctor = data?.connectedDoctor;
  const followup = data?.pendingFollowup;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white shadow-lg shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-100 border border-white/15">
            <Heart className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
            <span>BHMS Patient Health Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {patientName}
          </h1>
          <p className="text-sm text-teal-100/90 max-w-xl leading-relaxed">
            Welcome to your BHMS health portal. Manage your appointments, view shared clinical records, upload lab reports, and communicate securely with your doctor.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/patient/appointments"
            className="px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-teal-600" /> Book Appointment
          </Link>
          <Link
            href="/patient/ai-assistant"
            className="px-4 py-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" /> AI Assistant
          </Link>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Overview Cards (4 Real Database Backed Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointment */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Upcoming Appointment
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {upcoming ? (
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {new Date(upcoming.appointmentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ⏰ {upcoming.timeSlot} • {upcoming.doctorName}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      upcoming.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : upcoming.status === "IN_PROGRESS"
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800 animate-pulse"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {upcoming.status === "IN_PROGRESS" ? "Live In-Call" : upcoming.status}
                  </span>
                </div>

                {(upcoming.status === "CONFIRMED" || upcoming.status === "IN_PROGRESS") && (
                  <Link
                    href={`/consultation/${upcoming.id}`}
                    className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Video className="w-3.5 h-3.5 fill-white" />
                    <span>Join Video Consultation</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-1">
                <p className="text-xs text-slate-500">No upcoming appointments</p>
                <Link
                  href="/patient/appointments"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block mt-2"
                >
                  + Book Appointment
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/patient/appointments"
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            Manage Schedule <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Last Visit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Last Visit
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <History className="w-4 h-4" />
              </div>
            </div>

            {lastVisit ? (
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {new Date(lastVisit.visitDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {lastVisit.chiefComplaint}
                </p>
                {lastVisit.remedyPrescribed && (
                  <div className="mt-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                    Rx: {lastVisit.remedyPrescribed} ({lastVisit.potencyPrescribed || "200C"})
                  </div>
                )}
              </div>
            ) : (
              <div className="py-1">
                <p className="text-xs text-slate-500">No health records available</p>
              </div>
            )}
          </div>

          <Link
            href="/patient/health-records"
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            View Full Records <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Connected Doctor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connected Doctor
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>

            {doctor ? (
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {doctor.name}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {doctor.specialization}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {doctor.clinicName}
                </span>
              </div>
            ) : (
              <div className="py-1">
                <p className="text-xs text-slate-500">No doctor assigned yet.</p>
              </div>
            )}
          </div>

          <Link
            href="/patient/messages"
            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            Message Doctor <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Pending Follow-up */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending Follow-up
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {followup ? (
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  Severity: {followup.currentSeverity} / 10
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {followup.currentSymptoms}
                </p>
                <div className="mt-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      followup.status === "REVIEWED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    }`}
                  >
                    Status: {followup.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-1">
                <p className="text-xs text-slate-500">No active follow-up submitted.</p>
                <Link
                  href="/patient/follow-ups"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-block mt-2"
                >
                  + Submit Follow-up
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/patient/follow-ups"
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            Review Progress <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/patient/appointments"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Book Appointment
            </span>
          </Link>

          <Link
            href="/patient/appointments"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              My Appointments
            </span>
          </Link>

          <Link
            href="/patient/health-records"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Health Records
            </span>
          </Link>

          <Link
            href="/patient/reports"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <FilePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Reports
            </span>
          </Link>

          <Link
            href="/patient/follow-ups"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Follow-up
            </span>
          </Link>

          <Link
            href="/patient/messages"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Message Doctor
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Emergency Medical Information Section */}
      <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-sm block">
            Emergency Medical Guidance
          </span>
          <p>
            This health portal and its AI assistant are designed for educational decision support and non-urgent consultation management. In case of a medical emergency (such as severe chest pain, breathing difficulty, or sudden loss of consciousness), please contact local emergency medical services immediately (Dial 108 / 112 in India) or visit the nearest hospital emergency department.
          </p>
        </div>
      </div>
    </div>
  );
}
