"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  UserCheck,
  FileSpreadsheet,
  Award,
  HelpCircle,
  TrendingUp,
  Users,
  FilePlus,
  Mic,
  Search,
  BookOpen,
  History,
  Shield,
  Layers,
  Video,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  User,
  Sparkles,
  Settings,
} from "lucide-react";

interface SidebarProps {
  role: "STUDENT" | "DOCTOR" | "ADMIN" | "PATIENT";
}

interface SidebarLinkItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks: SidebarLinkItem[] = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/repertorization", label: "Repertorization Engine", icon: Layers, badge: "Kent" },
    { href: "/student/materia-medica-comparator", label: "Materia Medica Compare", icon: BookOpen, badge: "Diff" },
    { href: "/student/exam-simulator", label: "AIAPGET & Exam Sim", icon: Award, badge: "120m" },
    { href: "/student/logbook", label: "Clinical Logbook", icon: FilePlus, badge: "PDF" },
    { href: "/student/organon-explorer", label: "Organon Explorer", icon: BookOpen, badge: "§ Aphorisms" },
    { href: "/student/posology-miasm", label: "Posology & Miasms", icon: Layers, badge: "Analysis" },
    { href: "/student/mystery-cases", label: "Mystery Cases & Hub", icon: HelpCircle, badge: "Weekly" },
    { href: "/student/ai-tutor", label: "BHMS AI Tutor", icon: Bot, badge: "RAG" },
    { href: "/student/virtual-patient", label: "Virtual Patient", icon: UserCheck, badge: "Sim" },
    { href: "/student/case-simulator", label: "Case Simulator", icon: FileSpreadsheet },
    { href: "/student/viva", label: "AI Viva Exam", icon: Award },
    { href: "/student/quiz", label: "Practice Quiz", icon: HelpCircle },
    { href: "/student/progress", label: "Study Progress", icon: TrendingUp },
  ];

  const doctorLinks: SidebarLinkItem[] = [
    { href: "/doctor/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "Patients Directory", icon: Users },
    { href: "/doctor/video-calls", label: "Video Consultations", icon: Video, badge: "Live" },
    { href: "/doctor/new-case", label: "Digital Case Sheet", icon: FilePlus },
    { href: "/doctor/voice-case", label: "Voice Case Taking", icon: Mic, badge: "STT" },
    { href: "/doctor/repertory", label: "Repertory Assistant", icon: Layers },
    { href: "/doctor/remedy-explorer", label: "Remedy Explorer", icon: BookOpen },
    { href: "/doctor/knowledge-search", label: "Knowledge Search", icon: Search, badge: "Verified" },
    { href: "/doctor/follow-up", label: "Follow-up Analyzer", icon: History },
  ];

  const patientLinks: SidebarLinkItem[] = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/profile", label: "My Profile", icon: User },
    { href: "/patient/appointments", label: "Appointments", icon: Calendar, badge: "Book" },
    { href: "/patient/health-records", label: "Health Records", icon: FileText },
    { href: "/patient/reports", label: "Reports", icon: FilePlus },
    { href: "/patient/follow-ups", label: "Follow-ups", icon: History },
    { href: "/patient/messages", label: "Messages", icon: MessageSquare },
    { href: "/patient/notifications", label: "Notifications", icon: Bell },
    { href: "/patient/ai-assistant", label: "Patient AI Assistant", icon: Sparkles, badge: "AI" },
    { href: "/patient/profile", label: "Settings", icon: Settings },
  ];

  const adminLinks: SidebarLinkItem[] = [
    { href: "/admin", label: "Knowledge Management", icon: Shield },
    { href: "/faculty", label: "Faculty Mentor Hub", icon: Users, badge: "Review" },
    { href: "/doctor/dashboard", label: "Doctor Portal", icon: Users },
    { href: "/student/dashboard", label: "Student Portal", icon: GraduationCapIcon },
  ];

  function GraduationCapIcon(props: any) {
    return <Award {...props} />;
  }

  const links =
    role === "STUDENT"
      ? studentLinks
      : role === "DOCTOR"
      ? doctorLinks
      : role === "PATIENT"
      ? patientLinks
      : adminLinks;

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            {role === "STUDENT"
              ? "Student Learning Module"
              : role === "DOCTOR"
              ? "Doctor Clinical Copilot"
              : role === "PATIENT"
              ? "Patient Health Portal"
              : "Admin Portal"}
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.label + link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-clinical-50 dark:bg-clinical-950/60 text-clinical-800 dark:text-clinical-300 font-semibold shadow-xs border border-clinical-200/60 dark:border-clinical-800/60"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-clinical-600 dark:text-clinical-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-clinical-600 text-white dark:bg-clinical-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            {role === "STUDENT"
              ? "Student Mode"
              : role === "DOCTOR"
              ? "Doctor Mode"
              : role === "PATIENT"
              ? "Patient Mode"
              : "Admin Mode"}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            {role === "STUDENT"
              ? "Grounded in Organon, Boericke, and Kent Repertory"
              : role === "DOCTOR"
              ? "Decision-support with strict practitioner review"
              : role === "PATIENT"
              ? "Secure tenant-isolated patient health records"
              : "Verified knowledge & faculty moderation"}
          </div>
        </div>
      </div>
    </aside>
  );
}
