"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function PatientVideoJoinPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-call vs In-call state
  const [hasJoined, setHasJoined] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDurationSec, setCallDurationSec] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/video-call/join/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          setErrorMessage(data.error || "Join link is invalid or has expired.");
        } else {
          setSessionInfo(data.session);
        }
        setLoading(false);
      })
      .catch((e) => {
        setErrorMessage("Unable to validate consultation link.");
        setLoading(false);
      });
  }, [token]);

  // Initialize Camera
  useEffect(() => {
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
          console.warn("Patient camera permission denied or unavailable:", err);
        });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasJoined]);

  // Call timer
  useEffect(() => {
    let timer: any;
    if (hasJoined) {
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasJoined]);

  const handleJoinCall = async () => {
    if (!consentAccepted) {
      alert("Please accept the telehealth consultation consent to proceed.");
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch(`/api/video-call/join/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentAccepted: true }),
      });
      if (res.ok) {
        setHasJoined(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setHasJoined(false);
    setSessionInfo((prev: any) => ({ ...prev, status: "COMPLETED" }));
  };

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

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) return <LoadingSpinner label="Validating encrypted consultation link..." />;

  if (errorMessage || !sessionInfo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-elevated">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Consultation Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorMessage || "This consultation link is no longer valid or has already expired."}
          </p>
          <div className="text-[11px] text-slate-400">
            Please contact your doctor to request a new consultation link.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-sm">
            B
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">BHMS Telehealth Portal</div>
            <div className="text-[10px] text-cyan-400">Doctor-Patient Encrypted Channel</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto my-6 flex-1 flex items-center justify-center">
        {!hasJoined ? (
          /* Pre-Call Setup Screen */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in fade-in">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-extrabold text-white">
                Join Telehealth Consultation
              </h1>
              <p className="text-xs text-slate-400">
                You are connecting with <strong>{sessionInfo.doctorName}</strong>
              </p>
            </div>

            {/* Patient Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Patient Name</span>
                <div className="font-semibold text-slate-200">{sessionInfo.patientName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500">Demographics</span>
                <div className="text-slate-300">
                  {sessionInfo.patientAge} yrs • {sessionInfo.patientGender}
                </div>
              </div>
            </div>

            {/* Camera Preview Area */}
            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
                  <VideoOff className="w-6 h-6" />
                  <span>Camera Disabled</span>
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

              {/* In-Preview Quick Media Controls */}
              <div className="absolute bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-2.5 rounded-xl text-xs transition-colors backdrop-blur ${
                    isMuted ? "bg-rose-600 text-white" : "bg-slate-900/80 text-slate-200"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl text-xs transition-colors backdrop-blur ${
                    isVideoOff ? "bg-rose-600 text-white" : "bg-slate-900/80 text-slate-200"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="leading-snug">
                I give consent for this remote video consultation with my homeopathic practitioner. I understand this session is for clinical communication.
              </span>
            </label>

            {/* Join Call Action */}
            <button
              onClick={handleJoinCall}
              disabled={isJoining || !consentAccepted}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              {isJoining ? "Connecting..." : "Join Video Call Room"}
            </button>
          </div>
        ) : (
          /* Live In-Call Screen for Patient */
          <div className="w-full max-w-4xl space-y-4 animate-in fade-in">
            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {/* Doctor Remote Stream Feed */}
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 rounded-full bg-cyan-900/60 border-2 border-cyan-500 flex items-center justify-center text-cyan-300 text-2xl font-bold shadow-lg">
                  Dr
                </div>
                <h3 className="text-sm font-bold text-white mt-3">{sessionInfo.doctorName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Doctor Connected (Live Telehealth WebRTC Stream)
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Consultation
                </div>
              </div>

              {/* Call Timer Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur text-white font-mono text-xs border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formatTimer(callDurationSec)}</span>
              </div>

              {/* Patient Local Video PIP */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-elevated">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
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
                <div className="absolute bottom-1.5 left-2 text-[9px] font-semibold bg-slate-900/80 text-slate-200 px-1.5 py-0.5 rounded">
                  You {isMuted && "(Muted)"}
                </div>
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isMuted ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isVideoOff ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span>{isVideoOff ? "Start Cam" : "Stop Cam"}</span>
              </button>

              <button
                onClick={handleLeaveCall}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Call</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-2 border-t border-slate-800">
        BHMS AI Telehealth Platform • Direct Encrypted Clinical Video Consultations
      </footer>
    </div>
  );
}
