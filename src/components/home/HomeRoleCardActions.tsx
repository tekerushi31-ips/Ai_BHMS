"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { UserSession } from "@/types";

interface RoleCardActionProps {
  targetRole: "STUDENT" | "DOCTOR" | "PATIENT";
  user: UserSession | null;
}

export function HomeRoleCardAction({ targetRole, user }: RoleCardActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isCurrentRole = user?.role === targetRole;
  const isOppositeRole = user && user.role !== targetRole && user.role !== "ADMIN";

  const getDashboardUrl = (role: "STUDENT" | "DOCTOR" | "PATIENT") => {
    if (role === "STUDENT") return "/student/dashboard";
    if (role === "DOCTOR") return "/doctor/dashboard";
    return "/patient/dashboard";
  };

  const getPortalLabel = (role: "STUDENT" | "DOCTOR" | "PATIENT") => {
    if (role === "STUDENT") return "Student Portal";
    if (role === "DOCTOR") return "Doctor Portal";
    return "Patient Portal";
  };

  const handleAction = async () => {
    if (isCurrentRole) {
      router.push(getDashboardUrl(targetRole));
      return;
    }

    // If user is in a different role or not logged in, perform quick demo switch/login
    setLoading(true);
    try {
      const preset =
        targetRole === "STUDENT" ? "student1" : targetRole === "DOCTOR" ? "doctor1" : "patient";
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = getDashboardUrl(targetRole);
      }
    } catch {
      window.location.href = getDashboardUrl(targetRole);
    }
  };

  const isStudent = targetRole === "STUDENT";
  const isDoctor = targetRole === "DOCTOR";
  const isPatient = targetRole === "PATIENT";

  const portalName = getPortalLabel(targetRole);

  const buttonStyle = isStudent
    ? "bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-clinical-600/20"
    : isDoctor
    ? "bg-slate-900 hover:bg-slate-800 dark:bg-cyan-700 dark:hover:bg-cyan-600 shadow-slate-900/20"
    : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-emerald-600/20";

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleAction}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.99] ${buttonStyle}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening {portalName}...</span>
          </>
        ) : (
          <>
            <span>
              {isOppositeRole
                ? `Switch & Enter ${portalName}`
                : `Enter ${portalName}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {isCurrentRole ? (
        <p className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 font-medium">
          Currently in {targetRole.toLowerCase()} mode
        </p>
      ) : isOppositeRole ? (
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
          Currently in {user.role.toLowerCase()} mode • 1-click auto switch
        </p>
      ) : null}
    </div>
  );
}
