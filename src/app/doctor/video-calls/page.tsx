"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  PlusCircle,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
  Play,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertCircle,
  X,
  Radio,
} from "lucide-react";
import { VideoSessionDTO } from "@/types";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

export default function DoctorVideoCallsHubPage() {
  const [sessions, setSessions] = useState<VideoSessionDTO[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "SCHEDULED" | "COMPLETED">("ALL");

  // Modal States
  const [isInstantModalOpen, setIsInstantModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [creatingCall, setCreatingCall] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form States
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [createdSessionData, setCreatedSessionData] = useState<{
    session: any;
    patientJoinUrl: string;
  } | null>(null);

  const loadSessions = () => {
    fetch("/api/doctor/video-sessions")
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.sessions || []);
      })
      .catch((e) => console.error(e));
  };

  const loadAppointments = () => {
    fetch("/api/doctor/appointments")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
      })
      .catch((e) => console.error(e));
  };

  const loadPatients = () => {
    fetch("/api/doctor/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        if (data.patients && data.patients.length > 0 && !selectedPatientId) {
          setSelectedPatientId(data.patients[0].id);
        }
      });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/doctor/video-sessions").then((r) => r.json()),
      fetch("/api/doctor/appointments").then((r) => r.json()),
      fetch("/api/doctor/patients").then((r) => r.json()),
    ])
      .then(([sessData, appData, patData]) => {
        if (sessData.sessions) setSessions(sessData.sessions);
        if (appData.appointments) setAppointments(appData.appointments);
        if (patData.patients) {
          setPatients(patData.patients);
          if (patData.patients.length > 0) setSelectedPatientId(patData.patients[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmAppointment = async (appId: string) => {
    try {
      const res = await fetch("/api/doctor/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appId, status: "CONFIRMED" }),
      });
      const data = await res.json();
      if (data.success) {
        loadAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartInstantCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setCreatingCall(true);
    try {
      const res = await fetch("/api/doctor/video-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          isInstant: true,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setCreatedSessionData(data);
        loadSessions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingCall(false);
    }
  };

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !scheduledDateTime) return;

    setCreatingCall(true);
    try {
      const res = await fetch("/api/doctor/video-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          scheduledAt: new Date(scheduledDateTime).toISOString(),
          isInstant: false,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setCreatedSessionData(data);
        setIsScheduleModalOpen(false);
        loadSessions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingCall(false);
    }
  };

  const handleCopyLink = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return s.status === "ACTIVE" || s.status === "WAITING";
    if (filter === "SCHEDULED") return s.status === "SCHEDULED";
    if (filter === "COMPLETED") return s.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Telehealth Video Consultations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Encrypted direct doctor-patient communication with expiring join links, live clinical notes, and patient record archiving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreatedSessionData(null);
              setIsScheduleModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Schedule Call
          </button>

          <button
            onClick={() => {
              setCreatedSessionData(null);
              setIsInstantModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Instant Call
          </button>
        </div>
      </div>

      {/* Section 1: Booked Patient Appointments (Integrated Telehealth) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900/40 via-slate-900/70 to-slate-900/90 border border-teal-500/30 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Patient Appointments Ready for Video Consultation
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Launch dedicated consultation rooms for confirmed patient bookings.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {appointments.filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS").length} Active Ready
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
            No patient appointments requested yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        app.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : app.status === "IN_PROGRESS"
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800 animate-pulse"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {app.status === "IN_PROGRESS" ? "Live In-Call" : app.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ⏰ {app.timeSlot}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {app.patientName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {app.patientAge} yrs • {app.patientGender} • {app.patientPhone}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 italic line-clamp-2">
                    "{app.reason}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {app.status === "CONFIRMED" || app.status === "IN_PROGRESS" ? (
                    <Link
                      href={`/consultation/${app.id}`}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>
                        {app.status === "IN_PROGRESS"
                          ? "Enter Live Consultation"
                          : "Start Video Consultation"}
                      </span>
                    </Link>
                  ) : app.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => handleConfirmAppointment(app.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Prepare Room</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold block text-center py-1">
                      Consultation Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        {(["ALL", "ACTIVE", "SCHEDULED", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === tab
                ? "bg-slate-900 dark:bg-slate-800 text-white font-semibold border border-slate-800 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab === "ALL" && "All Consultations"}
            {tab === "ACTIVE" && "Active / Waiting"}
            {tab === "SCHEDULED" && "Scheduled"}
            {tab === "COMPLETED" && "Completed History"}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <LoadingSpinner label="Retrieving video consultations..." />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          title="No video consultations found"
          description={
            filter === "ALL"
              ? "You have not conducted or scheduled any video consultations yet."
              : `No ${filter.toLowerCase()} video consultations found.`
          }
          actionLabel="Start Instant Video Call"
          onAction={() => setIsInstantModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
            const patientLink = `${origin}/video-call/join/${session.joinToken}`;
            const isCopied = copiedToken === session.joinToken;

            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{session.patient.name}</h3>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {session.patient.patientCode} • {session.patient.age} yrs • {session.patient.gender}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        session.status === "ACTIVE"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse"
                          : session.status === "WAITING"
                          ? "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                          : session.status === "SCHEDULED"
                          ? "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-[#1A2234] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {session.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Scheduled: {new Date(session.scheduledAt).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>
                        Created: {new Date(session.createdAt).toLocaleDateString()}{" "}
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {session.durationSeconds > 0 && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        Duration: {Math.round(session.durationSeconds / 60)} min (
                        {session.durationSeconds}s)
                      </div>
                    )}
                  </div>

                  {/* Notes summary if any */}
                  {session.notes && session.notes.length > 0 && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-100 dark:border-amber-900/60">
                      <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {session.notes.length} note(s) recorded
                      </div>
                      <p className="line-clamp-1 italic mt-0.5">{session.notes[0].noteText}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyLink(patientLink, session.joinToken)}
                    title="Copy Patient Join Link"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                      isCopied
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Link Copied" : "Copy Link"}
                  </button>

                  <Link
                    href={`/doctor/video-calls/${session.id}`}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1 shadow-sm ${
                      session.status === "COMPLETED"
                        ? "bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700"
                        : "bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    {session.status === "COMPLETED" ? "Review Notes" : "Enter Room"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Instant Call Modal */}
      {isInstantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Launch Instant Video Call
              </h3>
              <button
                onClick={() => {
                  setIsInstantModalOpen(false);
                  setCreatedSessionData(null);
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdSessionData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Consultation Room Ready!
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    Share this secure, single-use join link with the patient. It expires in 2 hours and requires no patient login.
                  </p>
                  <div className="p-2 bg-white dark:bg-[#1A2234] rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] break-all text-slate-800 dark:text-slate-200">
                    {createdSessionData.patientJoinUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyLink(
                        createdSessionData.patientJoinUrl,
                        createdSessionData.session.joinToken
                      )
                    }
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedToken === createdSessionData.session.joinToken ? "Copied!" : "Copy Patient Link"}
                  </button>

                  <Link
                    href={`/doctor/video-calls/${createdSessionData.session.id}`}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enter Doctor Room
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartInstantCall} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.patientCode}) — {p.age} yrs
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Guardrail Notice:</strong> This video session is for direct doctor-patient communication only. The AI will never make automatic diagnostic or prescription inferences from video streams.
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInstantModalOpen(false)}
                    className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCall}
                    className="px-4 py-2 bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
                  >
                    {creatingCall ? "Creating Room..." : "Create Room & Get Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Schedule Call Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Schedule Video Consultation
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleCall} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode}) — {p.age} yrs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Consultation Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-purple-600 dark:focus:border-purple-400 transition-colors font-sans"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCall || !scheduledDateTime}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  {creatingCall ? "Scheduling..." : "Schedule Consultation"}
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
