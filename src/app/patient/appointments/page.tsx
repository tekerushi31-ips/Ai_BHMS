"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Stethoscope,
  History,
  Video,
} from "lucide-react";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Booking Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
  const [reason, setReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [appRes, docRes] = await Promise.all([
        fetch("/api/patient/appointments"),
        fetch("/api/patient/doctors"),
      ]);

      const appData = await appRes.json();
      const docData = await docRes.json();

      if (appData.appointments) setAppointments(appData.appointments);
      if (docData.doctors && docData.doctors.length > 0) {
        setDoctors(docData.doctors);
        setSelectedDoctorId(docData.doctors[0].id);
      }
    } catch {
      alert("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot || !reason.trim()) {
      alert("Please fill in all booking fields.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Your appointment request has been submitted to the doctor!");
        setIsBookingOpen(false);
        setReason("");
        fetchData();
      } else {
        alert(data.error || "Failed to book appointment.");
      }
    } catch {
      alert("Network error booking appointment.");
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this appointment request?")) return;

    try {
      const res = await fetch(`/api/patient/appointments/${id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("Appointment cancelled.");
        fetchData();
      }
    } catch {
      alert("Failed to cancel appointment.");
    }
  }

  const upcomingList = appointments.filter(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED"
  );
  const pastList = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Appointments & Consultations
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book consultations with certified homoeopathic physicians and track confirmation status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading appointments...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Upcoming Appointments */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" /> Upcoming & Active Requests ({upcomingList.length})
            </h2>

            {upcomingList.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500 space-y-2">
                <p>No upcoming appointments scheduled.</p>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  + Request Appointment with Doctor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingList.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            app.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : app.status === "IN_PROGRESS"
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800 animate-pulse"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          Status: {app.status === "IN_PROGRESS" ? "Live In-Call" : app.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ⏰ {app.timeSlot}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {app.doctorName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {app.specialization} • {app.clinicName}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                        <div className="text-slate-600 dark:text-slate-300">
                          <strong>Date:</strong>{" "}
                          {new Date(app.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          <strong>Reason for visit:</strong> {app.reason}
                        </div>
                      </div>

                      {/* Video Consultation Callout for Confirmed/In-Progress Appointments */}
                      {(app.status === "CONFIRMED" || app.status === "IN_PROGRESS") && (
                        <div className="pt-2">
                          <Link
                            href={`/consultation/${app.id}`}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                              app.status === "IN_PROGRESS"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 animate-pulse"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            <Video className="w-4 h-4 fill-white" />
                            <span>
                              {app.status === "IN_PROGRESS"
                                ? "Doctor is Online • Join Consultation"
                                : "Join Video Consultation"}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Requested: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {app.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(app.id)}
                          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Previous & Completed Consultations */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" /> Past Appointments & Consultations ({pastList.length})
            </h2>

            {pastList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-center text-xs text-slate-400">
                No past consultations recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastList.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs space-y-2 opacity-90"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {app.doctorName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      {new Date(app.appointmentDate).toLocaleDateString()} • {app.timeSlot}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      "{app.reason}"
                    </p>
                    {app.consultationSession?.durationSeconds ? (
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Video consultation:{" "}
                        {Math.round(app.consultationSession.durationSeconds / 60)} min (
                        {app.consultationSession.durationSeconds}s)
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" /> Book Clinical Consultation
              </h2>
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              {/* 1. Select Doctor */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Homoeopathic Doctor *
                </label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization} ({d.clinicName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Select Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* 3. Time Slot */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Available Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:30 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM", "05:00 PM"].map(
                    (slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all ${
                          selectedSlot === slot
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 4. Reason for Visit */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Chief Complaint / Reason for Consultation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your current symptoms, flare-ups, or follow-up needs..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {bookingLoading ? "Submitting..." : "Confirm Booking Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
