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
  AlertTriangle,
  ArrowLeft,
  Share2,
  Sparkles,
  MessageSquare,
  Paperclip,
  Send,
  RefreshCw,
  Stethoscope,
  Maximize2,
  Minimize2,
  Layers,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

interface ConsultationAuthData {
  currentUserRole: "DOCTOR" | "PATIENT";
  currentUserId: string;
  currentUserName: string;
  appointment: {
    id: string;
    appointmentDate: string;
    timeSlot: string;
    reason: string;
    status: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    clinicName: string;
    regNo: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phone: string;
    bloodGroup: string;
    allergies: string;
  };
  session: {
    id: string;
    roomId: string;
    status: string;
    startedAt: string | null;
    endedAt: string | null;
    durationSeconds: number;
    doctorNotes: string | null;
  };
}

export default function ConsultationRoomPage() {
  const params = useParams();
  const appointmentId = params?.appointmentId as string;
  const router = useRouter();

  // Consultation Data
  const [data, setData] = useState<ConsultationAuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stage: "WAITING_ROOM" | "IN_CALL" | "POST_CALL"
  const [stage, setStage] = useState<"WAITING_ROOM" | "IN_CALL" | "POST_CALL">("WAITING_ROOM");

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<"CONNECTED" | "RECONNECTING" | "DISCONNECTED">("CONNECTED");
  const [callDuration, setCallDuration] = useState(0);

  // Side Drawers: null | "CHAT" | "DOCUMENTS" | "CASE_INFO"
  const [activeDrawer, setActiveDrawer] = useState<"CHAT" | "DOCUMENTS" | "CASE_INFO" | null>(null);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Documents State
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Doctor Notes State
  const [doctorNotes, setDoctorNotes] = useState("");
  const [pushToCaseVisit, setPushToCaseVisit] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Media Stream References
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const waitingVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSignalTimeRef = useRef<number>(0);

  // 1. Initial Authorization & Room Data Fetch
  useEffect(() => {
    if (!appointmentId) return;

    fetch(`/api/consultation/${appointmentId}/auth`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || "Access denied to this consultation room.");
          });
        }
        return res.json();
      })
      .then((json: ConsultationAuthData) => {
        setData(json);
        if (json.session?.doctorNotes) {
          setDoctorNotes(json.session.doctorNotes);
        }
        if (json.appointment.status === "COMPLETED") {
          setStage("POST_CALL");
          setCallDuration(json.session.durationSeconds || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [appointmentId]);

  // 2. Initialize Camera & Mic in Waiting Room (Device Check)
  useEffect(() => {
    if (stage === "POST_CALL") return;

    async function initMedia() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: true,
          });

          localStreamRef.current = stream;
          setHasCameraPermission(true);
          setHasMicPermission(true);

          if (waitingVideoRef.current) {
            waitingVideoRef.current.srcObject = stream;
          }
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Audio Meter Setup
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkAudio = () => {
              if (stage === "POST_CALL" || !localStreamRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
              requestAnimationFrame(checkAudio);
            };
            checkAudio();
          } catch {
            // Audio context visualizer fallback
          }
        }
      } catch (err: any) {
        console.warn("[Media Check Error]:", err);
        setHasCameraPermission(false);
        setHasMicPermission(false);
      }
    }

    initMedia();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stage, facingMode]);

  // 3. WebRTC Peer Connection & Signaling Loop
  useEffect(() => {
    if (stage !== "IN_CALL" || !data) return;

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    };

    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setNetworkStatus("CONNECTED");
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch(`/api/consultation/${appointmentId}/signaling`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ice-candidate",
              data: event.candidate,
              senderRole: data.currentUserRole,
            }),
          }).catch(() => {});
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setNetworkStatus("CONNECTED");
        if (pc.connectionState === "connecting") setNetworkStatus("RECONNECTING");
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setNetworkStatus("DISCONNECTED");
        }
      };
    } catch (e) {
      console.warn("WebRTC PC init error:", e);
    }

    // Signaling Polling Interval
    const signalingInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/consultation/${appointmentId}/signaling?since=${lastSignalTimeRef.current}`
        );
        const json = await res.json();
        if (json.signals && json.signals.length > 0) {
          lastSignalTimeRef.current = json.serverTime || Date.now();

          for (const signal of json.signals) {
            if (signal.type === "offer" && pc && data.currentUserRole === "PATIENT") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              await fetch(`/api/consultation/${appointmentId}/signaling`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "answer",
                  data: answer,
                  senderRole: "PATIENT",
                }),
              });
            } else if (signal.type === "answer" && pc && data.currentUserRole === "DOCTOR") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            } else if (signal.type === "ice-candidate" && pc) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.data));
              } catch {}
            }
          }
        }
      } catch {}
    }, 2000);

    // If Doctor, create SDP Offer
    if (data.currentUserRole === "DOCTOR") {
      setTimeout(async () => {
        try {
          if (pc && pc.signalingState === "stable") {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await fetch(`/api/consultation/${appointmentId}/signaling`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "offer",
                data: offer,
                senderRole: "DOCTOR",
              }),
            });
          }
        } catch (e) {
          console.warn("Offer creation notice:", e);
        }
      }, 1000);
    }

    return () => {
      clearInterval(signalingInterval);
      if (pc) pc.close();
    };
  }, [stage, data, appointmentId]);

  // 4. In-Call Duration Timer
  useEffect(() => {
    let timer: any;
    if (stage === "IN_CALL") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // 5. In-Call Chat & Document Polling
  useEffect(() => {
    if (stage !== "IN_CALL") return;

    loadMessages();
    loadDocuments();

    const chatInterval = setInterval(loadMessages, 3000);
    return () => clearInterval(chatInterval);
  }, [stage, appointmentId]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/consultation/${appointmentId}/messages`);
      const json = await res.json();
      if (json.messages) setMessages(json.messages);
    } catch {}
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch(`/api/consultation/${appointmentId}/documents`);
      const json = await res.json();
      if (json.documents) setDocuments(json.documents);
    } catch {}
  };

  // Action Handlers
  const handleStartOrJoinCall = async () => {
    try {
      // Transition backend status to IN_PROGRESS
      await fetch(`/api/consultation/${appointmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_CALL" }),
      });

      setStage("IN_CALL");
    } catch (e) {
      console.error(e);
      setStage("IN_CALL");
    }
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

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedDoc) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/consultation/${appointmentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput.trim(),
          attachmentUrl: selectedDoc?.fileUrl || null,
          attachmentName: selectedDoc?.name || null,
        }),
      });
      const json = await res.json();
      if (json.message) {
        setMessages((prev) => [...prev, json.message]);
        setChatInput("");
        setSelectedDoc(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleEndCall = async () => {
    if (!confirm("Are you sure you want to end this video consultation?")) return;

    // Stop media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      await fetch(`/api/consultation/${appointmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "END_CALL",
          durationSeconds: callDuration,
          doctorNotes,
          pushToCaseVisit,
        }),
      });
    } catch {}

    setStage("POST_CALL");
  };

  const handleSaveDoctorNotes = async () => {
    if (!doctorNotes.trim()) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/consultation/${appointmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_NOTES",
          doctorNotes,
          pushToCaseVisit,
        }),
      });
      if (res.ok) {
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return <LoadingSpinner label="Connecting to secure consultation room..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 max-w-md space-y-2">
          <AlertTriangle className="w-8 h-8 mx-auto" />
          <h2 className="text-base font-bold">Consultation Access Error</h2>
          <p className="text-xs">{error || "Unable to join consultation."}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { appointment, doctor, patient, currentUserRole } = data;
  const isDoctor = currentUserRole === "DOCTOR";

  // =========================================================================
  // VIEW 1: PRE-CALL WAITING ROOM & DEVICE CHECK
  // =========================================================================
  if (stage === "WAITING_ROOM") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-emerald-500" />
                Telehealth Consultation Room
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end encrypted medical consultation via WebRTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Room</span>
          </div>
        </div>

        {/* Main Waiting Room Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Device Check & Live Self-Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center text-slate-500 space-y-2">
                  <VideoOff className="w-10 h-10 mx-auto opacity-60" />
                  <p className="text-xs">Camera is paused</p>
                </div>
              ) : hasCameraPermission === false ? (
                <div className="text-center p-6 text-amber-400 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold">Camera Permission Required</p>
                  <p className="text-[11px] text-slate-400">
                    Please grant camera and microphone access in your browser to proceed with the consultation.
                  </p>
                </div>
              ) : (
                <video
                  ref={waitingVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              )}

              {/* Mute indicator overlay */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-semibold">
                Self View Preview
              </div>
            </div>

            {/* Quick Media Toggles & Mic Volume Meter */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Microphone Activity:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {isMuted ? "Muted" : `${micLevel}%`}
                </span>
              </div>

              {/* Visualizer bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                  style={{ width: isMuted ? "0%" : `${micLevel}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isMuted
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-500" />}
                  <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isVideoOff
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4 text-emerald-500" />}
                  <span>{isVideoOff ? "Turn On Cam" : "Turn Off Cam"}</span>
                </button>

                <button
                  type="button"
                  onClick={switchCamera}
                  title="Switch Front/Rear Camera (iQOO / Mobile)"
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Appointment & Participant Card + Join Action */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isDoctor ? "Patient Consultation Profile" : "Attending Doctor"}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {isDoctor ? patient.name : doctor.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isDoctor
                    ? `${patient.age} yrs • ${patient.gender} • Blood Group: ${patient.bloodGroup}`
                    : `${doctor.specialization} • ${doctor.clinicName}`}
                </p>
              </div>

              {/* Consultation Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Consultation Date:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Scheduled Time:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ⏰ {appointment.timeSlot}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Chief Complaint / Reason:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
                    "{appointment.reason}"
                  </p>
                </div>
              </div>

              {/* Device Check Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Camera Checked</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Microphone Ready</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Network Stable</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Encrypted Stream</span>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleStartOrJoinCall}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <VideoIcon className="w-5 h-5 fill-white" />
                <span>{isDoctor ? "Start Video Consultation" : "Join Video Consultation"}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                By entering, you confirm participation in this clinical telehealth session.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIVE IN-CALL CONSULTATION STAGE
  // =========================================================================
  if (stage === "IN_CALL") {
    return (
      <div className="space-y-3 pb-6">
        {/* Top Floating Control / Status Bar */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Consultation with {isDoctor ? patient.name : doctor.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isDoctor ? "Doctor Mode" : "Patient Mode"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Room: {appointment.id.slice(0, 8)} • Encrypted Peer Connection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Call Duration */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white font-mono text-xs font-bold border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{formatTimer(callDuration)}</span>
            </div>

            {/* Connection Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{networkStatus === "CONNECTED" ? "Live Encrypted" : networkStatus}</span>
            </div>
          </div>
        </div>

        {/* Main Stage Grid: Video Screen + Optional Side Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Video Box (3 cols or 4 cols) */}
          <div className={activeDrawer ? "lg:col-span-3 space-y-3" : "lg:col-span-4 space-y-3"}>
            <div className="relative w-full aspect-video md:aspect-[16/9] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Remote Video Stream / Simulated Interactive Patient Feed */}
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-24 h-24 rounded-full bg-teal-900/60 border-2 border-teal-500 flex items-center justify-center text-teal-300 text-3xl font-extrabold shadow-xl">
                  {isDoctor ? patient.name.charAt(0) : doctor.name.charAt(0)}
                </div>
                <h3 className="text-base font-bold text-white mt-3">
                  {isDoctor ? patient.name : doctor.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isDoctor ? "Patient Connected (Live Audio & Video)" : `${doctor.specialization} (${doctor.clinicName})`}
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Remote WebRTC Stream Active
                </div>
              </div>

              {/* Self Video PIP (Picture-In-Picture) */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-20">
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
                <div className="absolute bottom-1.5 left-2 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                  Self {isMuted && "(Muted)"}
                </div>
              </div>
            </div>

            {/* Bottom Call Control Bar */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isMuted
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              {/* Video Toggle Button */}
              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isVideoOff
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOff ? "Start Cam" : "Stop Cam"}</span>
              </button>

              {/* Flip Camera (Smartphone / iQOO) */}
              <button
                type="button"
                onClick={switchCamera}
                title="Switch Camera (Front/Rear)"
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Flip</span>
              </button>

              {/* In-Call Chat Drawer Toggle */}
              <button
                type="button"
                onClick={() => setActiveDrawer(activeDrawer === "CHAT" ? null : "CHAT")}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeDrawer === "CHAT"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
                {messages.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </button>

              {/* Share Documents Drawer Toggle */}
              <button
                type="button"
                onClick={() => setActiveDrawer(activeDrawer === "DOCUMENTS" ? null : "DOCUMENTS")}
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeDrawer === "DOCUMENTS"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Paperclip className="w-4 h-4" />
                <span>Reports</span>
              </button>

              {/* Doctor Case Info Panel Toggle */}
              {isDoctor && (
                <button
                  type="button"
                  onClick={() => setActiveDrawer(activeDrawer === "CASE_INFO" ? null : "CASE_INFO")}
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeDrawer === "CASE_INFO"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Case Info</span>
                </button>
              )}

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-900/20 transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Side Drawer: Chat / Reports / Case Info */}
          {activeDrawer && (
            <div className="lg:col-span-1 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between min-h-[420px] max-h-[560px]">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  {activeDrawer === "CHAT" && <MessageSquare className="w-4 h-4 text-emerald-500" />}
                  {activeDrawer === "DOCUMENTS" && <Paperclip className="w-4 h-4 text-indigo-500" />}
                  {activeDrawer === "CASE_INFO" && <FileText className="w-4 h-4 text-purple-500" />}
                  <span>
                    {activeDrawer === "CHAT" && "Consultation Chat"}
                    {activeDrawer === "DOCUMENTS" && "Shared Health Reports"}
                    {activeDrawer === "CASE_INFO" && "Patient Medical Summary"}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {/* 1. CHAT DRAWER */}
                {activeDrawer === "CHAT" && (
                  <div className="space-y-2">
                    {messages.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-8">
                        No messages sent yet. Use text chat to communicate during the call.
                      </p>
                    ) : (
                      messages.map((m) => {
                        const isSelf = m.senderUserId === data.currentUserId;
                        return (
                          <div
                            key={m.id}
                            className={`p-2.5 rounded-2xl text-xs space-y-1 ${
                              isSelf
                                ? "bg-emerald-600 text-white ml-auto max-w-[85%]"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mr-auto max-w-[85%]"
                            }`}
                          >
                            <div className="text-[10px] opacity-75 font-semibold flex justify-between gap-2">
                              <span>{m.senderName}</span>
                              <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <p className="leading-snug">{m.message}</p>
                            {m.attachmentUrl && (
                              <a
                                href={m.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] underline opacity-90 pt-1"
                              >
                                <Paperclip className="w-3 h-3" /> {m.attachmentName || "View Report"}
                              </a>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 2. DOCUMENTS DRAWER */}
                {activeDrawer === "DOCUMENTS" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Patient's uploaded reports available for in-consultation review:
                    </p>
                    {documents.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-6">
                        No reports uploaded for this patient.
                      </p>
                    ) : (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                            <span className="line-clamp-1">{doc.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {doc.documentType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Full File
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setActiveDrawer("CHAT");
                                setChatInput(`Sharing report: ${doc.name}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold"
                            >
                              Attach in Chat
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. CASE INFO DRAWER (DOCTOR ONLY) */}
                {activeDrawer === "CASE_INFO" && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {patient.name} ({patient.age} yrs, {patient.gender})
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Phone: {patient.phone} • Blood: {patient.bloodGroup}
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        Allergies: {patient.allergies}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Chief Complaint:
                      </span>
                      <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 italic">
                        "{appointment.reason}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Quick Clinical Notes:
                      </span>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Type observation notes..."
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDoctorNotes}
                        disabled={savingNotes}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px]"
                      >
                        {savingNotes ? "Saving..." : notesSavedSuccess ? "Saved ✓" : "Save In-Call Notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Footer */}
              {activeDrawer === "CHAT" && (
                <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message to doctor..."
                    className="flex-1 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: POST-CALL SUMMARY & NOTES
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Consultation Completed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            The video consultation session between Dr. {doctor.name} and {patient.name} has concluded.
          </p>
        </div>

        {/* Session Stats */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Total Duration</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatTimer(callDuration)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Completed
            </div>
          </div>
        </div>

        {/* Doctor Post-Call Notes Box */}
        {isDoctor ? (
          <div className="text-left space-y-3">
            <label className="font-bold text-xs text-slate-700 dark:text-slate-300">
              Doctor Clinical Notes & Observations:
            </label>
            <textarea
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Record final consultation observations, remedy recommendations, and follow-up guidance..."
              className="w-full p-3 rounded-2xl text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={pushToCaseVisit}
                onChange={(e) => setPushToCaseVisit(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span>Automatically archive notes into Patient's permanent Clinical Case Record</span>
            </label>

            {notesSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" /> Clinical notes saved and archived successfully!
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveDoctorNotes}
                disabled={savingNotes || !doctorNotes.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                {savingNotes ? "Saving Notes..." : "Save Notes to Record"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
            Thank you for participating in your BHMS video consultation. Any prescription updates or follow-up notes from Dr. {doctor.name} will appear in your Health Records.
          </div>
        )}

        {/* Navigation Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
          <Link
            href={isDoctor ? "/doctor/video-calls" : "/patient/appointments"}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
          >
            {isDoctor ? "Back to Doctor Dashboard" : "Back to My Appointments"}
          </Link>
        </div>
      </div>
    </div>
  );
}
