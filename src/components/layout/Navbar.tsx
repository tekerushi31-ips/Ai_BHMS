"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types";
import { ThemeToggle } from "@/components/theme";
import {
  Stethoscope,
  GraduationCap,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Navbar({ user }: { user: UserSession | null }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoSwitchOpen, setIsDemoSwitchOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const handleDemoSwitch = async (preset: string) => {
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (e) {
      console.error("Demo switch failed:", e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-clinical-700 to-clinical-500 flex items-center justify-center text-white shadow-md shadow-clinical-600/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                BHMS AI
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-clinical-50 dark:bg-clinical-950/60 text-clinical-700 dark:text-clinical-400 border border-clinical-200 dark:border-clinical-800 rounded">
                  Copilot
                </span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
                Clinical & Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Theme Toggle */}
          <ThemeToggle />

          {/* Quick Demo Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setIsDemoSwitchOpen(!isDemoSwitchOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden md:inline">Switch Role</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {isDemoSwitchOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  1-Click Demo Accounts
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleDemoSwitch("student1")}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-clinical-600 dark:text-clinical-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Aarav Sharma</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Student (4th Year BHMS)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("doctor1")}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Dr. Vikram Sharma</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Doctor (Classical Homoeopath)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("doctor2")}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Dr. Ananya Patil</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Doctor (Pediatric / Skin)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("admin")}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Central Admin</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Platform Administrator</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch("patient")}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Amit Deshmukh</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Patient (Health Portal)</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown or Sign in button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-clinical-100 dark:bg-clinical-950 text-clinical-800 dark:text-clinical-300 font-semibold text-xs flex items-center justify-center border border-clinical-200 dark:border-clinical-800">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {user.role === "STUDENT" && (
                      <span className="text-clinical-700 dark:text-clinical-300 bg-clinical-50 dark:bg-clinical-950/60 px-1 rounded border border-clinical-200/50 dark:border-clinical-800/50">
                        Student 🎓
                      </span>
                    )}
                    {user.role === "DOCTOR" && (
                      <span className="text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-1 rounded border border-cyan-200/50 dark:border-cyan-800/50">
                        Doctor 👨‍⚕️
                      </span>
                    )}
                    {user.role === "PATIENT" && (
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                        Patient 🏥
                      </span>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1 rounded border border-purple-200/50 dark:border-purple-800/50">
                        Admin 🛡️
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={
                        user.role === "STUDENT"
                          ? "/student/dashboard"
                          : user.role === "DOCTOR"
                          ? "/doctor/dashboard"
                          : user.role === "PATIENT"
                          ? "/patient/dashboard"
                          : "/admin"
                      }
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      Dashboard
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {loggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 rounded-lg shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
