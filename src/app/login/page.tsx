"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  User,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.href = data.redirectUrl || "/";
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (preset: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-clinical-600 dark:bg-clinical-700 text-white shadow-md shadow-clinical-600/20 mb-1">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to BHMS AI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your student learning portal or doctor clinical copilot.
          </p>
        </div>

        {/* 1-Click Demo Logins Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-900/90 text-white border border-slate-800 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              1-Click Demo Evaluation Accounts
            </span>
            <span className="text-[10px] text-slate-400 font-mono">No Password Needed</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("student1")}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-clinical-400 flex-shrink-0" />
              <div className="truncate">
                <div className="font-medium text-white truncate text-[11px]">Aarav</div>
                <div className="text-[9px] text-slate-400">Student</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("doctor1")}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <div className="truncate">
                <div className="font-medium text-white truncate text-[11px]">Dr. Sharma</div>
                <div className="text-[9px] text-slate-400">Doctor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("patient")}
              disabled={loading}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="truncate">
                <div className="font-medium text-white truncate text-[11px]">Amit</div>
                <div className="text-[9px] text-emerald-400">Patient</div>
              </div>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@bhms.ai or dr.sharma@bhms.ai"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-clinical-600 dark:focus:border-clinical-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-clinical-600 dark:text-clinical-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
