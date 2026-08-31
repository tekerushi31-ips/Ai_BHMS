"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Sparkles } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      title={isDark ? "Switch to Light Mode ☀️" : "Switch to Dark Mode 🌙"}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 group shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
      )}
    </button>
  );
}
