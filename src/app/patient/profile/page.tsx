"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Heart, Shield, CheckCircle, Save, Calendar, AlertCircle } from "lucide-react";

export default function PatientProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "Male",
    dob: "",
    phone: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "B+",
    allergies: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/patient/profile");
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          age: data.profile?.age ? String(data.profile.age) : "32",
          gender: data.profile?.gender || "Male",
          dob: data.profile?.dob ? data.profile.dob.split("T")[0] : "",
          phone: data.profile?.phone || "",
          address: data.profile?.address || "",
          emergencyContact: data.profile?.emergencyContact || "",
          bloodGroup: data.profile?.bloodGroup || "B+",
          allergies: data.profile?.allergies || "",
        });
      }
    } catch {
      alert("Failed to load patient profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Your profile information has been saved successfully!");
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch {
      alert("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Patient Profile
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal demographics, emergency contacts, and medical baseline information.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Personal Demographics */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> Personal Demographics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-70 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Primary Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Address */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-500" /> Address & Emergency Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Apartment, City, State, PIN"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Emergency Contact Number & Relation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContact: e.target.value })
                  }
                  placeholder="+91 98765 00000 (Spouse)"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Sensitivities */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> Allergies & Sensitivities
            </h2>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Known Drug / Environmental Allergies
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Dust mites, Pollen, NSAIDs, Penicillin..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
