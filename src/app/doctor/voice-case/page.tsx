"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle,
  Save,
  RotateCcw,
  Languages,
  Edit,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { VoiceNormalizationResult } from "@/types";
import { ClinicalDisclaimer } from "@/components/common";

export default function VoiceCaseTakingPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [normalizedResult, setNormalizedResult] = useState<VoiceNormalizationResult | null>(null);
  const [savingCase, setSavingCase] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Sample Multilingual Dialogues for instant testing
  const sampleDialogues = [
    {
      label: "Marathi Anamnesis",
      text: "Patient la sakali doke dukhte ani thok thok hotat. Unhat gele ki doke jast dukhte ani thandi havet pan tras hoto. Sakali uthlyavar tras jast ahe.",
    },
    {
      label: "Hindi / Hinglish Anamnesis",
      text: "Subah pet mein bohot jalan aur gas hoti hai. 4 baje se 8 baje sham ko pet phool jata hai. Garam chai aur garam khane se thoda aaram milta hai.",
    },
    {
      label: "English Clinical Dialogue",
      text: "Patient complains of throbbing frontal migraine since 3 months. Pain starts at 10 AM, reaches peak at noon, aggravated by direct sunlight, with craving for salty food.",
    },
  ];

  useEffect(() => {
    fetch("/api/doctor/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        if (data.patients && data.patients.length > 0) {
          setSelectedPatientId(data.patients[0].id);
        }
      });

    if (
      typeof window !== "undefined" &&
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setSpeechSupported(false);
    }
  }, []);

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript;
        }
        setTranscriptText(interim);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } else {
      // Fallback message
      alert("Browser Speech Recognition not supported in this browser. You can type or use the sample multilingual dialogues below.");
    }
  };

  const handleNormalizeVoice = async (textToNormalize?: string) => {
    const raw = textToNormalize || transcriptText;
    if (!raw.trim()) {
      alert("Please provide or record speech audio transcription first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/doctor/voice/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: raw }),
      });
      const data = await res.json();
      if (data.result) {
        setNormalizedResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSaveCase = async () => {
    if (!selectedPatientId || !normalizedResult) {
      alert("Please select a patient to associate with this case sheet.");
      return;
    }

    setSavingCase(true);
    try {
      const res = await fetch("/api/doctor/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          chiefComplaint: normalizedResult.normalizedEnglish.chiefComplaint,
          duration: normalizedResult.normalizedEnglish.duration,
          location: normalizedResult.normalizedEnglish.location,
          sensation: normalizedResult.normalizedEnglish.sensation,
          modalities: normalizedResult.normalizedEnglish.modalities,
          concomitants: normalizedResult.normalizedEnglish.concomitants,
          mentalGenerals: normalizedResult.normalizedEnglish.mentalGenerals,
          physicalGenerals: normalizedResult.normalizedEnglish.physicalGenerals,
          rawNotes: `[Voice STT: ${normalizedResult.detectedLanguage}]\n${normalizedResult.originalTranscript}`,
          status: "ANALYZED",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/doctor/patients/${selectedPatientId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Multilingual Voice Case Taking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dictate clinical cases in English, Marathi, Hindi, or Hinglish with side-by-side doctor review and verification.
          </p>
        </div>

        {/* Patient Selection */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Assign Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:border-cyan-600 dark:focus:border-cyan-400"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recording & Input Area */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleRecord}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? "Stop Recording (Listening...)" : "Start Voice Recording"}</span>
            </button>

            {!speechSupported && (
              <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                Browser STT unavailable. Type below or use sample dialogues.
              </span>
            )}
          </div>

          {/* Preset Buttons for Quick Testing */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Test Presets:</span>
            {sampleDialogues.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscriptText(sample.text);
                  handleNormalizeVoice(sample.text);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-800 dark:hover:text-cyan-300 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Audio Transcription Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
            <span>Original Audio Transcription / Dictation:</span>
            {transcriptText && (
              <button
                onClick={() => {
                  setTranscriptText("");
                  setNormalizedResult(null);
                }}
                className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </label>
          <textarea
            rows={3}
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Click 'Start Voice Recording' and speak in Marathi, Hindi, Hinglish, or English (or paste raw clinical conversation here)..."
            className="w-full p-3.5 text-xs bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors leading-relaxed font-sans"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleNormalizeVoice()}
            disabled={loading || !transcriptText.trim()}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 border border-slate-800 dark:border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {loading ? "Normalizing..." : "Normalize into Clinical Anamnesis"}
          </button>
        </div>
      </div>

      {/* Side-by-Side Review Section */}
      {normalizedResult && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Languages className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Side-by-Side Doctor Verification
              <span className="text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-300 px-2 py-0.5 rounded border border-cyan-200/50 dark:border-cyan-800/50">
                Detected: {normalizedResult.detectedLanguage}
              </span>
            </h2>

            <button
              onClick={handleConfirmAndSaveCase}
              disabled={savingCase}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              {savingCase ? "Persisting..." : "Confirm & Save into Case Sheet"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Transcription */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
              <div className="font-bold text-xs text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Original Recorded Dialogue ({normalizedResult.detectedLanguage})</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Unmodified</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{normalizedResult.originalTranscript}"
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {normalizedResult.clinicalNotes}
              </div>
            </div>

            {/* Right: Normalized English Clinical Fields */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-cyan-200 dark:border-cyan-900/60 shadow-soft space-y-3">
              <div className="font-bold text-xs text-cyan-900 dark:text-cyan-300 pb-2 border-b border-cyan-100 dark:border-cyan-900/60 flex items-center justify-between">
                <span>Normalized English Homoeopathic Anamnesis</span>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 rounded font-semibold border border-cyan-200/50 dark:border-cyan-800/50">
                  Verified Structure
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Chief Complaint & Duration
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {normalizedResult.normalizedEnglish.chiefComplaint} (
                    {normalizedResult.normalizedEnglish.duration})
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Location & Sensation
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                    {[
                      normalizedResult.normalizedEnglish.location,
                      normalizedResult.normalizedEnglish.sensation,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Modalities (Time / Thermal / Positional)
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                    {normalizedResult.normalizedEnglish.modalities}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Constitutional Generals
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                    {[
                      normalizedResult.normalizedEnglish.mentalGenerals,
                      normalizedResult.normalizedEnglish.physicalGenerals,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
