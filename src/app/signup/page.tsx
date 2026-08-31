"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  GraduationCap,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  FileBadge,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "DOCTOR" | "PATIENT">("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeOrClinic, setCollegeOrClinic] = useState("");
  const [yearOrReg, setYearOrReg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          collegeOrClinic,
          yearOrReg,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      window.location.href = data.redirectUrl || "/";
    } catch (err: any) {
      setError(err.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your BHMS AI Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join the modern homoeopathic clinical and learning platform.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === "STUDENT"
                ? "bg-white dark:bg-slate-900 text-clinical-800 dark:text-clinical-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("DOCTOR")}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === "DOCTOR"
                ? "bg-white dark:bg-slate-900 text-cyan-800 dark:text-cyan-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("PATIENT")}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === "PATIENT"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>
        </div>

        {/* Signup Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "STUDENT"
                      ? "Aarav Sharma"
                      : role === "DOCTOR"
                      ? "Dr. Vikram Sharma"
                      : "Amit Deshmukh"
                  }
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@bhms.ai"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>

            {role === "STUDENT" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Homoeopathic College
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={collegeOrClinic}
                      onChange={(e) => setCollegeOrClinic(e.target.value)}
                      placeholder="e.g. National Homoeopathic Medical College"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={yearOrReg}
                    onChange={(e) => setYearOrReg(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                  >
                    <option value="1">1st Year BHMS</option>
                    <option value="2">2nd Year BHMS</option>
                    <option value="3">3rd Year BHMS</option>
                    <option value="4">4th / Final Year BHMS</option>
                    <option value="5">Internship</option>
                  </select>
                </div>
              </>
            ) : role === "DOCTOR" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Clinic / Hospital Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={collegeOrClinic}
                      onChange={(e) => setCollegeOrClinic(e.target.value)}
                      placeholder="e.g. Aura Homoeopathic Clinic"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    State Council / CCH Registration Number
                  </label>
                  <div className="relative">
                    <FileBadge className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={yearOrReg}
                      onChange={(e) => setYearOrReg(e.target.value)}
                      placeholder="e.g. CCH-MH-2020-1928"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={collegeOrClinic}
                      onChange={(e) => setCollegeOrClinic(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Age (Years)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={yearOrReg}
                      onChange={(e) => setYearOrReg(e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 ${
                role === "STUDENT"
                  ? "bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500"
                  : role === "DOCTOR"
                  ? "bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-700 dark:hover:bg-cyan-600"
                  : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              }`}
            >
              {loading
                ? "Creating Account..."
                : `Register as ${
                    role === "STUDENT" ? "Student" : role === "DOCTOR" ? "Doctor" : "Patient"
                  }`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="text-clinical-600 dark:text-clinical-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
