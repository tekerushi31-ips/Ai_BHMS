"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Search, Filter, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    // Demo data query
    setLoading(true);
    setTimeout(() => {
      setAppointments([
        {
          id: "app-1",
          patientName: "Rajesh V. Patel",
          doctorName: "Dr. Vikram Sharma",
          date: "2026-09-02",
          time: "10:30 AM",
          status: "CONFIRMED",
          type: "Video Consultation",
        },
        {
          id: "app-2",
          patientName: "Meera K. Kulkarni",
          doctorName: "Dr. Ananya Patil",
          date: "2026-09-02",
          time: "11:45 AM",
          status: "PENDING",
          type: "Clinic Visit",
        },
        {
          id: "app-3",
          patientName: "Sanjay Joshi",
          doctorName: "Dr. Vikram Sharma",
          date: "2026-09-01",
          time: "02:15 PM",
          status: "COMPLETED",
          type: "Video Consultation",
        },
      ]);
      setLoading(false);
    }, 300);
  }, [statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Appointment Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor and manage consultation appointments across all registered doctors.
          </p>
        </div>

        <Link
          href="/admin/clinical"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← Clinical Hub
        </Link>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Status:
        </span>
        {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === st
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading appointments..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Consultation Type</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{app.patientName}</td>
                    <td className="p-4 text-cyan-600 font-medium">{app.doctorName}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {app.date} • {app.time}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{app.type}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : app.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
