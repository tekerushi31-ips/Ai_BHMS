"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Search, Loader2 } from "lucide-react";
import { LoadingSpinner, ClinicalDisclaimer } from "@/components/common";

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?role=ADMIN&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const toggleStatus = async (user: any) => {
    setUpdatingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: !user.isActive }),
      });
      if (res.ok) {
        fetchAdmins();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Central Admin Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage platform administrator accounts and security permissions.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          ← All Users
        </Link>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins by name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading admin accounts..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Admin Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {admins.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      <div>{ad.name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{ad.email}</div>
                    </td>
                    <td className="p-4 font-bold text-purple-600">
                      Platform Administrator
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ad.isActive
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {ad.isActive ? "ACTIVE" : "DEACTIVATED"}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] text-slate-500">{new Date(ad.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatus(ad)}
                        disabled={updatingId === ad.id}
                        className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                      >
                        {updatingId === ad.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : ad.isActive ? "Deactivate" : "Activate"}
                      </button>
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
