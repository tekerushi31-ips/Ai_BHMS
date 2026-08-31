"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  User,
  Activity,
  History,
  Heart,
  Stethoscope,
  FlaskConical,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

export default function NewStudentLogbookPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State across all 7 steps
  const [formData, setFormData] = useState({
    // Step 1: Patient Information
    patientIdOrOpd: "",
    patientAge: "28",
    patientGender: "Female",
    department: "Medicine OPD",
    visitDate: new Date().toISOString().split("T")[0],

    // Step 2: Chief Complaint
    chiefComplaint: "",
    duration: "3 weeks",
    location: "",
    sensation: "",
    modalities: "",

    // Step 3: History
    historyPresentIllness: "",
    pastHistory: "",
    familyHistory: "",
    personalHistory: "",
    treatmentHistory: "",

    // Step 4: Generals
    generalsPhysical: "",
    generalsMental: "",
    appetite: "Normal, craves sweets",
    thirst: "Thirstless with dry mouth",
    sleep: "Restless after midnight",
    thermalPreference: "Chilly patient (worse cold, craves warmth)",

    // Step 5: Examination
    examinationDetails: "BP: 120/80 mmHg, Pulse: 78 bpm regular. Tongue clean with moist coat. Systemic: CVS S1S2 heard, Chest clear.",

    // Step 6: Investigations
    investigations: [
      { name: "Complete Blood Count (CBC)", result: "Hb 12.4 g/dL, TLC 7,200/cumm", date: "", notes: "Within normal biological reference ranges." },
    ],

    // Step 7: Totality & Prescribing
    remedyPrescribed: "Pulsatilla Pratensis",
    potencyPosology: "200C single dose in water, SL morning/evening",
    caseTotalityNotes: "Totality based on mild yielding mental disposition, complete thirstlessness, thermal warmth, and shifting joint pains.",
  });

  function updateField(field: string, val: any) {
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave(status: "DRAFT" | "SUBMITTED") {
    if (!formData.patientIdOrOpd || !formData.chiefComplaint) {
      alert("Please fill in Patient ID / OPD No. and Chief Complaint.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      });
      const data = await res.json();
      if (data.success && data.logbook) {
        router.push(`/student/logbook/${data.logbook.id}`);
      } else {
        alert(data.error || "Failed to save case record.");
      }
    } catch {
      alert("Network error while saving case.");
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    { number: 1, label: "Patient Info", icon: User },
    { number: 2, label: "Chief Complaint", icon: Activity },
    { number: 3, label: "History", icon: History },
    { number: 4, label: "Generals", icon: Heart },
    { number: 5, label: "Examination", icon: Stethoscope },
    { number: 6, label: "Investigations", icon: FlaskConical },
    { number: 7, label: "Case Totality", icon: CheckCircle },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student/logbook"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Logbook
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            New Student Clinical Case Record
          </h1>
          <p className="text-xs text-slate-500">
            Standardized BHMS clinical rotation case record builder (Step {currentStep} of 7)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("DRAFT")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
        </div>
      </div>

      {/* Step Progress Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;

          return (
            <button
              key={s.number}
              type="button"
              onClick={() => setCurrentStep(s.number)}
              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-100 font-bold"
                  : isDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Step {s.number}</span>
              </div>
              <span className="text-[11px] truncate max-w-[90px]">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* STEP 1: PATIENT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <User className="w-4 h-4 text-teal-500" /> Step 1: Patient Demographics & OPD Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Patient ID / OPD Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.patientIdOrOpd}
                  onChange={(e) => updateField("patientIdOrOpd", e.target.value)}
                  placeholder="e.g. OPD-2026-8491"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Clinical Department / Unit
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="e.g. Practice of Medicine OPD / Gynecology"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Patient Age (Years)
                </label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => updateField("patientAge", e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Gender
                </label>
                <select
                  value={formData.patientGender}
                  onChange={(e) => updateField("patientGender", e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHIEF COMPLAINT */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-teal-500" /> Step 2: Chief Complaint & Symptom Dimensions
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Chief Complaint (In patient's exact words) *
                </label>
                <textarea
                  rows={3}
                  value={formData.chiefComplaint}
                  onChange={(e) => updateField("chiefComplaint", e.target.value)}
                  placeholder="e.g. Throbbing frontal headache with nausea and wandering knee joint pains since 3 weeks."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Duration & Onset
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                    placeholder="e.g. 3 weeks, acute onset after cold rain"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Location & Radiation
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Right frontal eminence radiating to occiput"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Sensation
                  </label>
                  <input
                    type="text"
                    value={formData.sensation}
                    onChange={(e) => updateField("sensation", e.target.value)}
                    placeholder="e.g. Hammering, stitching, heaviness"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Modalities (Aggravation & Amelioration)
                </label>
                <textarea
                  rows={2}
                  value={formData.modalities}
                  onChange={(e) => updateField("modalities", e.target.value)}
                  placeholder="e.g. Worse: warm room, evening, fatty foods. Better: cool open fresh air, gentle slow walking."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: HISTORY */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <History className="w-4 h-4 text-teal-500" /> Step 3: Medical, Personal & Family History
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  History of Present Illness (HPI)
                </label>
                <textarea
                  rows={3}
                  value={formData.historyPresentIllness}
                  onChange={(e) => updateField("historyPresentIllness", e.target.value)}
                  placeholder="Chronological progression of symptoms, triggering factors, previous episodes..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Past Medical & Surgical History
                  </label>
                  <textarea
                    rows={2}
                    value={formData.pastHistory}
                    onChange={(e) => updateField("pastHistory", e.target.value)}
                    placeholder="Childhood illnesses, suppressed skin eruptions, previous treatments..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Family History (Miasmatic Diathesis)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.familyHistory}
                    onChange={(e) => updateField("familyHistory", e.target.value)}
                    placeholder="Hypertension, diabetes, asthma, malignancy, tuberculosis in lineage..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Treatment History & Current Medications
                </label>
                <input
                  type="text"
                  value={formData.treatmentHistory}
                  onChange={(e) => updateField("treatmentHistory", e.target.value)}
                  placeholder="Previous allopathic/ayurvedic drugs taken, analgesics, suppressive lotions..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: GENERALS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Heart className="w-4 h-4 text-teal-500" /> Step 4: Physical & Mental Generals
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Mental Generals & Emotional Disposition
                  </label>
                  <textarea
                    rows={3}
                    value={formData.generalsMental}
                    onChange={(e) => updateField("generalsMental", e.target.value)}
                    placeholder="e.g. Mild, yielding, weeps while narrating symptoms, craves sympathy/consolation..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Physical Generals & Body Constitution
                  </label>
                  <textarea
                    rows={3}
                    value={formData.generalsPhysical}
                    onChange={(e) => updateField("generalsPhysical", e.target.value)}
                    placeholder="e.g. Fair, pale, venous engorgement, perspiration on face only..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Appetite & Cravings
                  </label>
                  <input
                    type="text"
                    value={formData.appetite}
                    onChange={(e) => updateField("appetite", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Thirst
                  </label>
                  <input
                    type="text"
                    value={formData.thirst}
                    onChange={(e) => updateField("thirst", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Sleep & Dreams
                  </label>
                  <input
                    type="text"
                    value={formData.sleep}
                    onChange={(e) => updateField("sleep", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Thermal State
                  </label>
                  <input
                    type="text"
                    value={formData.thermalPreference}
                    onChange={(e) => updateField("thermalPreference", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: EXAMINATION */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Stethoscope className="w-4 h-4 text-teal-500" /> Step 5: Physical & Systemic Clinical Examination
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                General Physical & Systemic Examination Findings
              </label>
              <textarea
                rows={5}
                value={formData.examinationDetails}
                onChange={(e) => updateField("examinationDetails", e.target.value)}
                placeholder="Vitals (BP, Pulse, RR, Temp), Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema. Respiratory, CVS, Abdomen, CNS findings."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>
        )}

        {/* STEP 6: INVESTIGATIONS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FlaskConical className="w-4 h-4 text-teal-500" /> Step 6: Diagnostic Investigations & Pathology
            </h2>

            <div className="space-y-3">
              {formData.investigations.map((inv, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Investigation Name
                      </label>
                      <input
                        type="text"
                        value={inv.name}
                        onChange={(e) => {
                          const updated = [...formData.investigations];
                          updated[idx].name = e.target.value;
                          updateField("investigations", updated);
                        }}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Result / Finding
                      </label>
                      <input
                        type="text"
                        value={inv.result}
                        onChange={(e) => {
                          const updated = [...formData.investigations];
                          updated[idx].result = e.target.value;
                          updateField("investigations", updated);
                        }}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: CASE SUMMARY & PRESCRIBING */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <CheckCircle className="w-4 h-4 text-teal-500" /> Step 7: Totality of Symptoms & Prescription
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Selected Homoeopathic Similimum *
                  </label>
                  <input
                    type="text"
                    value={formData.remedyPrescribed}
                    onChange={(e) => updateField("remedyPrescribed", e.target.value)}
                    placeholder="e.g. Pulsatilla Pratensis / Lycopodium Clavatum"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm font-bold text-teal-600 dark:text-teal-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Potency, Posology & Repetition
                  </label>
                  <input
                    type="text"
                    value={formData.potencyPosology}
                    onChange={(e) => updateField("potencyPosology", e.target.value)}
                    placeholder="e.g. 200C Single dose in water, Sac Lac TDS"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Case Totality Summary & Organon Justification
                </label>
                <textarea
                  rows={4}
                  value={formData.caseTotalityNotes}
                  onChange={(e) => updateField("caseTotalityNotes", e.target.value)}
                  placeholder="Explain why this remedy was chosen over other differentials based on Kent's hierarchy and Hahnemannian principles (§153)..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("SUBMITTED")}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit to Professor for Evaluation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
