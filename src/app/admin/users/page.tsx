"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ShieldCheck,
  GraduationCap,
  Stethoscope,
  User,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "DOCTOR" | "PATIENT" | "ADMIN";
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  doctorProfile?: { specialization?: string; registrationNumber?: string; clinicName?: string } | null;
  studentProfile?: { yearOfStudy?: number; college?: string } | null;
  patientProfile?: { phone?: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/users?role=${selectedRole}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: "error", message: e.message || "Failed to load user accounts" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, search]);

  const handleToggleStatus = async (user: UserRecord) => {
    const newActiveState = !user.isActive;
    setUpdatingId(user.id);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: newActiveState }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user status");

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newActiveState } : u))
      );
      setStatusMessage({ type: "success", message: `Account for ${user.name} is now ${newActiveState ? "ACTIVE" : "DEACTIVATED"}` });
    } catch (e: any) {
      setStatusMessage({ type: "error", message: e.message || "Failed to update account status" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeRole = async (user: UserRecord, newRole: string) => {
    setUpdatingId(user.id);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user role");

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u))
      );
      setStatusMessage({ type: "success", message: `Role for ${user.name} updated to ${newRole}` });
    } catch (e: any) {
      setStatusMessage({ type: "error", message: e.message || "Failed to update user role" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-clinical-600 dark:text-clinical-400" />
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Student, Doctor, Faculty, Patient, and Admin accounts and active platform access.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-clinical-500"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {["ALL", "STUDENT", "DOCTOR", "PATIENT", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedRole === role
                  ? "bg-clinical-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {role === "ALL" ? "All Users" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner label="Searching platform accounts..." />
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No user accounts found matching query.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isProcessing = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-clinical-100 dark:bg-clinical-950 text-clinical-800 dark:text-clinical-300 font-bold text-xs flex items-center justify-center overflow-hidden border border-clinical-200 dark:border-clinical-800 shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={isProcessing}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-clinical-500"
                        >
                          <option value="STUDENT">STUDENT 🎓</option>
                          <option value="DOCTOR">DOCTOR 👨‍⚕️</option>
                          <option value="PATIENT">PATIENT 🏥</option>
                          <option value="ADMIN">ADMIN OFFICER 🛡️</option>
                        </select>
                      </td>

                      <td className="p-4 text-[11px] text-slate-600 dark:text-slate-400">
                        {u.role === "DOCTOR" && u.doctorProfile && (
                          <span>
                            {u.doctorProfile.specialization || "Homoeopath"} • Reg: {u.doctorProfile.registrationNumber || "CCH"}
                          </span>
                        )}
                        {u.role === "STUDENT" && u.studentProfile && (
                          <span>
                            Year {u.studentProfile.yearOfStudy || 1} • {u.studentProfile.college || "BHMS College"}
                          </span>
                        )}
                        {u.role === "PATIENT" && u.patientProfile && (
                          <span>Phone: {u.patientProfile.phone || "No phone"}</span>
                        )}
                        {u.role === "ADMIN" && <span className="font-mono text-purple-600 dark:text-purple-400">Platform Admin</span>}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {u.isActive ? "ACTIVE" : "DEACTIVATED"}
                        </span>
                      </td>

                      <td className="p-4 text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isProcessing}
                          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                            u.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : u.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
