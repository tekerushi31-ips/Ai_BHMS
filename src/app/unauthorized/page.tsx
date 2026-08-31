"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Sparkles,
  Loader2,
} from "lucide-react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requiredRole = searchParams.get("required") || "student";
  const currentRole = searchParams.get("current") || "";

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle1ClickSwitch = async (preset: string, redirectPath: string) => {
    setLoadingAction(preset);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to switch role");
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.message || "Failed to switch account");
      setLoadingAction(null);
    }
  };

  const handleLogoutAndLogin = async () => {
    setLoadingAction("logout");
    setError(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login?switch=true";
    } catch {
      window.location.href = "/login?switch=true";
    }
  };

  const isStudentRequired = requiredRole.toLowerCase() === "student";
  const isDoctorRequired = requiredRole.toLowerCase() === "doctor";
  const isAdminRequired = requiredRole.toLowerCase() === "admin";

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-8rem)] transition-colors">
      <div className="max-w-lg w-full space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-elevated text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Titles */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isStudentRequired
              ? "Student Portal Access"
              : isDoctorRequired
              ? "Doctor Portal Access"
              : "Access Restricted"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isStudentRequired ? (
              <>
                You are currently signed in as{" "}
                <span className="font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-200/40 dark:border-cyan-800/40">
                  {currentRole.toUpperCase() || "DOCTOR"}
                </span>
                . The BHMS Learning Portal requires a{" "}
                <strong className="text-clinical-700 dark:text-clinical-400">Student Account</strong>.
              </>
            ) : isDoctorRequired ? (
              <>
                You are currently signed in as{" "}
                <span className="font-semibold text-clinical-800 dark:text-clinical-300 bg-clinical-50 dark:bg-clinical-950/60 px-1.5 py-0.5 rounded border border-clinical-200/40 dark:border-clinical-800/40">
                  {currentRole.toUpperCase() || "STUDENT"}
                </span>
                . The Clinical Copilot requires a{" "}
                <strong className="text-cyan-700 dark:text-cyan-400">Doctor Account</strong>.
              </>
            ) : (
              "You do not have the required permissions to view this section. Please switch accounts."
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Primary 1-Click Fast Switch CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white border border-slate-800 shadow-card space-y-3 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              1-Click Fast Switch
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Instant Demo Access</span>
          </div>

          {isStudentRequired && (
            <button
              type="button"
              id="switch-to-student-btn"
              onClick={() => handle1ClickSwitch("student1", "/student/dashboard")}
              disabled={loadingAction !== null}
              className="w-full py-3 px-4 rounded-xl bg-clinical-600 hover:bg-clinical-500 active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                {loadingAction === "student1" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-clinical-200 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-left">
                  <div className="font-bold">Switch to Aarav Sharma (Student)</div>
                  <div className="text-[10px] text-clinical-100 font-normal">
                    Open BHMS Student Learning Dashboard
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {isDoctorRequired && (
            <button
              type="button"
              id="switch-to-doctor-btn"
              onClick={() => handle1ClickSwitch("doctor1", "/doctor/dashboard")}
              disabled={loadingAction !== null}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                {loadingAction === "doctor1" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Stethoscope className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-left">
                  <div className="font-bold">Switch to Dr. Vikram Sharma</div>
                  <div className="text-[10px] text-cyan-100 font-normal">
                    Open Clinical Doctor Dashboard
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {isAdminRequired && (
            <button
              type="button"
              id="switch-to-admin-btn"
              onClick={() => handle1ClickSwitch("admin", "/admin")}
              disabled={loadingAction !== null}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                {loadingAction === "admin" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-left">
                  <div className="font-bold">Switch to Admin Officer</div>
                  <div className="text-[10px] text-purple-100 font-normal">
                    Open Admin Verification Panel
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Alternative Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={handleLogoutAndLogin}
            disabled={loadingAction !== null}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            {loadingAction === "logout" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            )}
            Sign In with Other Email
          </button>

          <Link
            href={
              currentRole.toLowerCase() === "doctor"
                ? "/doctor/dashboard"
                : currentRole.toLowerCase() === "student"
                ? "/student/dashboard"
                : "/"
            }
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            {currentRole.toLowerCase() === "doctor"
              ? "Back to Doctor Dashboard"
              : currentRole.toLowerCase() === "student"
              ? "Back to Student Dashboard"
              : "Return Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-clinical-600 dark:text-clinical-400" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
