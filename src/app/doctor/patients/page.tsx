"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit,
  Eye,
  FilePlus,
  X,
  AlertTriangle,
} from "lucide-react";
import { LoadingSpinner, EmptyState, ClinicalDisclaimer } from "@/components/common";

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    occupation: "",
    address: "",
    medicalHistorySummary: "",
  });

  const loadPatients = (query = "") => {
    setLoading(true);
    fetch(`/api/doctor/patients?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setPatients(data.patients || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(search);
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/doctor/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          contact: formData.contact,
          occupation: formData.occupation,
          address: formData.address,
          medicalHistorySummary: formData.medicalHistorySummary,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          age: "",
          gender: "Male",
          contact: "",
          occupation: "",
          address: "",
          medicalHistorySummary: "",
        });
        loadPatients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deleteCandidate) return;
    try {
      await fetch(`/api/doctor/patients/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      setDeleteCandidate(null);
      loadPatients();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scoped clinical records isolated strictly to your medical practice.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 shadow-sm transition-colors flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, patient code (e.g. P-1001), or phone..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors shadow-soft"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors border border-slate-800 dark:border-slate-700"
        >
          Search
        </button>
      </form>

      {/* Patient Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Retrieving patient records..." />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description={
              search
                ? `No patients match "${search}".`
                : "No patient records exist yet in your clinic directory."
            }
            actionLabel="Register First Patient"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1A2234] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Latest Case / Complaint</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {p.patientCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/doctor/patients/${p.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {p.occupation || "Occupation unrecorded"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.contact || "—"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {p.clinicalCases?.[0]?.chiefComplaint || "No active case sheet"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/doctor/patients/${p.id}`}
                          title="View Case Sheet"
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/doctor/new-case?patientId=${p.id}`}
                          title="New Case Sheet"
                          className="p-1.5 rounded-lg text-clinical-600 dark:text-clinical-400 hover:bg-clinical-50 dark:hover:bg-clinical-950/60 transition-colors"
                        >
                          <FilePlus className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-elevated border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Register New Patient
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kadam"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="e.g. Civil Engineer"
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, State"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Medical History Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.medicalHistorySummary}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalHistorySummary: e.target.value })
                  }
                  placeholder="Known allergies, chronic pathologies, or previous treatments..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-[#111827] focus:border-cyan-600 dark:focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  {saving ? "Saving..." : "Create Patient Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-elevated border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-800/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Confirm Record Removal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to soft-delete patient record{" "}
                <strong className="text-slate-800 dark:text-slate-200">{deleteCandidate.name}</strong> ({deleteCandidate.patientCode})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      <ClinicalDisclaimer compact />
    </div>
  );
}
