"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  User,
  Stethoscope,
  Building,
  FileText,
  Clock,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Globe,
  Check,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

interface DoctorProfileData {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string;
  dateOfBirth: string;
  gender: string;
  qualification: string;
  degree: string;
  specialization: string;
  registrationNumber: string;
  yearsOfPractice: number;
  languages: string;
  consultationType: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  state: string;
  pincode: string;
  clinicPhone: string;
  clinicEmail: string;
  shortBio: string;
  areasOfPractice: string;
  consultationDays: string;
  availableStartTime: string;
  availableEndTime: string;
  isOnlineConsultation: boolean;
  isOfflineConsultation: boolean;
}

interface ProfileCompletionData {
  percentage: number;
  missingFields: string[];
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [formData, setFormData] = useState<DoctorProfileData | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/doctor/profile");
      if (!res.ok) throw new Error("Unable to load profile data");
      const data = await res.json();
      setProfile(data.profile);
      setFormData(data.profile);
      setCompletion(data.completion);
    } catch (err: any) {
      setStatusMessage({ type: "error", message: err.message || "Failed to load doctor profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: keyof DoctorProfileData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Valid email is required";
    if (!formData.qualification.trim()) errors.qualification = "Qualification is required";
    if (!formData.specialization.trim()) errors.specialization = "Specialization is required";
    if (!formData.registrationNumber.trim()) errors.registrationNumber = "Registration number is required";
    if (!formData.clinicName.trim()) errors.clinicName = "Clinic name is required";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) errors.pincode = "Pincode must be 6 digits";
    if (formData.clinicEmail && !/\S+@\S+\.\S+/.test(formData.clinicEmail.trim()))
      errors.clinicEmail = "Valid clinic email format required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !formData) return;

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to save profile. Please try again.");
      }

      setProfile(data.profile);
      setFormData(data.profile);
      setCompletion(data.completion);
      setIsEditing(false);
      setStatusMessage({ type: "success", message: "Profile updated successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", message: err.message || "Unable to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setFieldErrors({});
    setStatusMessage(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setStatusMessage({ type: "error", message: "File format must be JPG, PNG, or WEBP." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", message: "Profile photo size must be less than 5MB." });
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploadingPhoto(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");

      if (formData) {
        setFormData({ ...formData, avatar: data.avatarUrl });
      }
      if (profile) {
        setProfile({ ...profile, avatar: data.avatarUrl });
      }

      setStatusMessage({ type: "success", message: "Profile photo updated successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", message: err.message || "Failed to upload photo." });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading doctor profile..." />;
  if (!formData || !profile) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-400 font-semibold text-xs">
        Failed to load profile data. Please refresh the page.
      </div>
    );
  }

  const completionPct = completion?.percentage ?? 100;

  return (
    <div className="space-y-6 pb-12 transition-colors max-w-6xl mx-auto">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-4">
          {/* Profile Photo Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-clinical-100 dark:bg-clinical-950/80 border-2 border-clinical-500 text-clinical-800 dark:text-clinical-300 font-bold text-xl flex items-center justify-center overflow-hidden shadow-inner">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                formData.name.slice(0, 2).toUpperCase()
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-1.5 bg-clinical-600 text-white rounded-full shadow-md hover:bg-clinical-700 transition-colors"
                title="Change Photo"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {formData.name}
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-full">
                {formData.registrationNumber}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formData.qualification} • {formData.specialization}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {formData.clinicName} • {formData.city || "Pune"}
            </p>
          </div>
        </div>

        {/* Edit / Save Action Buttons */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Profile Completion Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            Profile Completion
          </span>
          <span className="font-bold text-clinical-600 dark:text-clinical-400">{completionPct}%</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-clinical-600 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {completion?.missingFields && completion.missingFields.length > 0 && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Missing information: </span>
            {completion.missingFields.slice(0, 4).join(", ")}
            {completion.missingFields.length > 4 && ` +${completion.missingFields.length - 4} more`}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-clinical-600 dark:text-clinical-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.name
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">{formData.name}</p>
              )}
              {fieldErrors.name && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.email
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">{formData.email}</p>
              )}
              {fieldErrors.email && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.phone || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.dateOfBirth || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">{formData.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Professional Information */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Professional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Qualification <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                  placeholder="e.g. B.H.M.S., M.D. (Hom.)"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.qualification
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.qualification}
                </p>
              )}
              {fieldErrors.qualification && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.qualification}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Degree / Sub-specialty
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => handleChange("degree", e.target.value)}
                  placeholder="e.g. M.D. in Homoeopathic Philosophy"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.degree || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specialization <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                  placeholder="e.g. Classical Homoeopathy & Chronic Diseases"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.specialization
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.specialization}
                </p>
              )}
              {fieldErrors.specialization && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.specialization}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registration Number <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="CCH-2018-9482"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.registrationNumber
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 font-mono">
                  {formData.registrationNumber}
                </p>
              )}
              {fieldErrors.registrationNumber && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.registrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={formData.yearsOfPractice}
                  onChange={(e) => handleChange("yearsOfPractice", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.yearsOfPractice} years
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Languages Spoken
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => handleChange("languages", e.target.value)}
                  placeholder="English, Hindi, Marathi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 font-sans">
                  {formData.languages || "English, Hindi"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Consultation Type
              </label>
              {isEditing ? (
                <select
                  value={formData.consultationType}
                  onChange={(e) => handleChange("consultationType", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                >
                  <option value="Online & Offline">Online & Offline</option>
                  <option value="Online Only">Online Only</option>
                  <option value="In-Clinic Only">In-Clinic Only</option>
                </select>
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5 font-sans">
                  {formData.consultationType || "Online & Offline"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Clinic Information */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Clinic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Name <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => handleChange("clinicName", e.target.value)}
                  placeholder="Homoeopathic Healing Centre"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.clinicName
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.clinicName}
                </p>
              )}
              {fieldErrors.clinicName && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.clinicName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.clinicPhone}
                  onChange={(e) => handleChange("clinicPhone", e.target.value)}
                  placeholder="+91 20 2612 3456"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.clinicPhone || "Not specified"}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.clinicAddress}
                  onChange={(e) => handleChange("clinicAddress", e.target.value)}
                  placeholder="Suite 402, Medical Enclave, MG Road"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.clinicAddress || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Pune"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.city || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.state || "Not specified"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="411001"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.pincode
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.pincode || "Not specified"}
                </p>
              )}
              {fieldErrors.pincode && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.pincode}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.clinicEmail}
                  onChange={(e) => handleChange("clinicEmail", e.target.value)}
                  placeholder="contact@homoeohealing.com"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    fieldErrors.clinicEmail
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500`}
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.clinicEmail || "Not specified"}
                </p>
              )}
              {fieldErrors.clinicEmail && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.clinicEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Professional Bio */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Professional Bio & Focus
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Practitioner Bio
              </label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={formData.shortBio}
                  onChange={(e) => handleChange("shortBio", e.target.value)}
                  placeholder="Summarize your clinical background and Homoeopathic approach..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed py-1">
                  {formData.shortBio || "No bio added yet."}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Key Areas of Practice & Clinical Expertise
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.areasOfPractice}
                  onChange={(e) => handleChange("areasOfPractice", e.target.value)}
                  placeholder="e.g. Asthma, Eczema, Psoriasis, Migraine, Autoimmune Conditions"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 py-1">
                  {formData.areasOfPractice || "Not specified"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Availability & Practice Hours */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Consultation Availability & Hours
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Consultation Days
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.consultationDays}
                  onChange={(e) => handleChange("consultationDays", e.target.value)}
                  placeholder="Mon, Tue, Wed, Thu, Fri, Sat"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.consultationDays || "Mon - Sat"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.availableStartTime}
                  onChange={(e) => handleChange("availableStartTime", e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.availableStartTime || "09:00 AM"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.availableEndTime}
                  onChange={(e) => handleChange("availableEndTime", e.target.value)}
                  placeholder="06:00 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
                />
              ) : (
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 py-1.5">
                  {formData.availableEndTime || "06:00 PM"}
                </p>
              )}
            </div>

            <div className="sm:col-span-3 flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isOnlineConsultation}
                  disabled={!isEditing}
                  onChange={(e) => handleChange("isOnlineConsultation", e.target.checked)}
                  className="w-4 h-4 text-clinical-600 rounded border-slate-300 focus:ring-clinical-500"
                />
                Online Video Consultation Enabled
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isOfflineConsultation}
                  disabled={!isEditing}
                  onChange={(e) => handleChange("isOfflineConsultation", e.target.checked)}
                  className="w-4 h-4 text-clinical-600 rounded border-slate-300 focus:ring-clinical-500"
                />
                In-Clinic Offline Appointments Enabled
              </label>
            </div>
          </div>
        </div>
      </form>

      <ClinicalDisclaimer compact />
    </div>
  );
}
