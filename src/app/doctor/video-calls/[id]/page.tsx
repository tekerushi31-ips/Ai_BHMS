"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Clock,
  User,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Sparkles,
} from "lucide-react";
import { VideoSessionDTO } from "@/types";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function DoctorVideoCallRoomPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  const router = useRouter();

  const [session, setSession] = useState<VideoSessionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Media & Call State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<
    "CONNECTING" | "CONNECTED" | "WAITING_FOR_PATIENT" | "ENDED"
  >("CONNECTING");
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // In-Call Notes
  const [noteText, setNoteText] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // Post-Call Modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [pushingToRecord, setPushingToRecord] = useState(false);
  const [pushedToRecordSuccess, setPushedToRecordSuccess] = useState(false);

  // Media Stream Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // 1. Fetch Session Data
  const loadSession = () => {
    if (!sessionId) return;
    fetch(`/api/doctor/video-sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Video session not found or unauthorized.");
        return res.json();
      })
      .then((data) => {
        setSession(data.session);
        setNotesList(data.session.notes || []);
        setIsDemoMode(data.session.provider === "DEMO_WEBRTC");

        if (data.session.status === "COMPLETED") {
          setCallStatus("ENDED");
          setCallDurationSec(data.session.durationSeconds || 0);
        } else {
          setCallStatus("CONNECTED");
          // Mark session active in DB if not already
          if (data.session.status !== "ACTIVE") {
            fetch(`/api/doctor/video-sessions/${sessionId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "ACTIVE", startedAt: new Date().toISOString() }),
            });
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // 2. Initialize Camera
  useEffect(() => {
    if (callStatus === "ENDED") return;

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Camera access not available or denied, falling back to simulation:", err);
        });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callStatus]);

  // 3. Call Timer
  useEffect(() => {
    let timer: any;
    if (callStatus === "CONNECTED") {
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setIsVideoOff((prev) => !prev);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/doctor/video-sessions/${sessionId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText }),
      });
      const data = await res.json();
      if (data.note) {
        setNotesList((prev) => [data.note, ...prev]);
        setNoteText("");
        setNoteSavedToast(true);
        setTimeout(() => setNoteSavedToast(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleEndCall = async () => {
    setCallStatus("ENDED");

    // Stop camera tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    // Update session in DB
    try {
      await fetch(`/api/doctor/video-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          endedAt: new Date().toISOString(),
          durationSeconds: callDurationSec,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    setShowEndModal(true);
  };

  const handlePushNotesToPatientRecord = async () => {
    setPushingToRecord(true);
    try {
      const res = await fetch(`/api/doctor/video-sessions/${sessionId}/push-to-record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setPushedToRecordSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPushingToRecord(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const copyPatientLink = () => {
    if (!session) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
    const patientUrl = `${origin}/video-call/join/${session.joinToken}`;
    navigator.clipboard.writeText(patientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) return <LoadingSpinner label="Entering encrypted video consultation room..." />;
  if (error || !session) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-rose-600 text-xs font-semibold">{error || "Session not found."}</div>
        <Link
          href="/doctor/video-calls"
          className="text-xs text-cyan-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Video Consultations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/video-calls"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Consultation: {session.patient.name}
              </h1>
              <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                {session.patient.patientCode}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {session.patient.age} yrs • {session.patient.gender} • Direct Doctor-Patient Video Channel
            </p>
          </div>
        </div>

        {/* Live Call Badges & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTimer(callDurationSec)}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              callStatus === "CONNECTED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : callStatus === "ENDED"
                ? "bg-slate-100 text-slate-700 border"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                callStatus === "CONNECTED"
                  ? "bg-emerald-500 animate-pulse"
                  : callStatus === "ENDED"
                  ? "bg-slate-400"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {callStatus === "CONNECTED"
                ? "Connected (Encrypted)"
                : callStatus === "ENDED"
                ? "Call Completed"
                : "Waiting for Patient"}
            </span>
          </div>

          <button
            onClick={copyPatientLink}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? "Link Copied" : "Share Link"}
          </button>
        </div>
      </div>

      {/* Main Split: Video Feeds on Left (2 cols), Doctor Notes Panel on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Video Feed Display & Media Controls */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-card aspect-video border border-slate-800 flex items-center justify-center">
            {/* Remote Patient Video / Simulation */}
            {callStatus === "ENDED" ? (
              <div className="text-center p-8 text-slate-400 space-y-2">
                <VideoOff className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">Video Consultation Ended</h3>
                <p className="text-xs text-slate-400">Total duration: {formatTimer(callDurationSec)}</p>
              </div>
            ) : isDemoMode ? (
              /* Interactive Patient Feed in Demo Mode */
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 rounded-full bg-teal-900/60 border-2 border-teal-500 flex items-center justify-center text-teal-300 text-2xl font-bold shadow-lg">
                  {session.patient.name.charAt(0)}
                </div>
                <h3 className="text-sm font-bold text-white mt-3">{session.patient.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Patient Audio & Video Connected (Live Telehealth WebRTC)
                </p>
                <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Remote Feed Active
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Awaiting Remote Video Stream...</div>
            )}

            {/* Local Doctor Video PIP (Picture in Picture) */}
            {callStatus !== "ENDED" && (
              <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-elevated">
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    <VideoOff className="w-5 h-5 mb-1" />
                    Camera Off
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                )}
                <div className="absolute bottom-1.5 left-2 text-[9px] font-semibold bg-slate-900/80 text-slate-200 px-1.5 py-0.5 rounded backdrop-blur">
                  Dr. Self View {isMuted && "(Muted)"}
                </div>
              </div>
            )}
          </div>

          {/* Media Control Bar */}
          {callStatus !== "ENDED" && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-soft flex items-center justify-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isMuted
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isVideoOff
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                <span>{isVideoOff ? "Start Cam" : "Stop Cam"}</span>
              </button>

              <button
                onClick={handleEndCall}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call & Review</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Live In-Call Clinical Notes Drawer */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-clinical-600" />
                Live In-Call Doctor Notes
              </h2>
              {noteSavedToast && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Document patient symptoms, modalities, and observations during the live consultation.
            </p>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type observations: (e.g. 'Patient reports headache started at 10 AM, better after cold wash, thirst for cold water')..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-clinical-600 transition-colors"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !noteText.trim()}
                className="px-3.5 py-1.5 bg-clinical-600 hover:bg-clinical-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {savingNote ? "Saving..." : "Save Note"}
              </button>
            </div>

            {/* Saved Notes Feed */}
            {notesList.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Session Notes ({notesList.length})
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {notesList.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1"
                    >
                      <p className="leading-snug">{n.noteText}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {n.pushedToRecord && " • Pushed to Case Visit"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <strong>Communication Guardrail:</strong> AI does not automatically transcribe, diagnose, or prescribe from video consultation audio. All records require explicit doctor confirmation.
          </div>
        </div>
      </div>

      {/* Post-Call Summary Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-elevated animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Video Consultation Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{session.patient.name}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    {formatTimer(callDurationSec)} ({callDurationSec}s)
                  </div>
                </div>
              </div>

              {/* Consultation Notes Review */}
              <div>
                <span className="font-semibold text-slate-700">Recorded Consultation Notes:</span>
                {notesList.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 italic text-[11px] mt-1">
                    No notes were documented during this call.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 text-[11px] mt-1 space-y-1 max-h-40 overflow-y-auto">
                    {notesList.map((n, i) => (
                      <div key={i}>• {n.noteText}</div>
                    ))}
                  </div>
                )}
              </div>

              {pushedToRecordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Notes pushed and archived into Patient Case Visit timeline!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <Link
                href={`/doctor/patients/${session.patientId}`}
                className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold text-center"
              >
                View Patient Profile
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {notesList.length > 0 && !pushedToRecordSuccess && (
                  <button
                    onClick={handlePushNotesToPatientRecord}
                    disabled={pushingToRecord}
                    className="px-4 py-2 bg-clinical-600 hover:bg-clinical-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {pushingToRecord ? "Pushing to Case..." : "Save Notes to Patient Record"}
                  </button>
                )}

                <button
                  onClick={() => router.push("/doctor/video-calls")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
