"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateDOMTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage on mount
  useEffect(() => {
    let initialTheme: Theme = "system";
    try {
      const stored = localStorage.getItem("bhms-theme") as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        initialTheme = stored;
      }
    } catch {}

    const resolved: ResolvedTheme =
      initialTheme === "system" ? getSystemTheme() : (initialTheme as ResolvedTheme);

    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    updateDOMTheme(resolved);
    setMounted(true);
  }, []);

  // Listen to system changes when in 'system' mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const nextResolved: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(nextResolved);
        updateDOMTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const resolved: ResolvedTheme =
      newTheme === "system" ? getSystemTheme() : (newTheme as ResolvedTheme);

    setThemeState(newTheme);
    setResolvedTheme(resolved);
    updateDOMTheme(resolved);

    try {
      localStorage.setItem("bhms-theme", newTheme);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    // If currently dark (either via dark or system), switch directly to light
    // If currently light, switch directly to dark
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
