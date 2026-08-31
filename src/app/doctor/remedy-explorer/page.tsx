"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  ShieldAlert,
  Layers,
  Thermometer,
  Brain,
  Clock,
} from "lucide-react";
import { ClinicalDisclaimer } from "@/components/common";

interface RemedyProfile {
  name: string;
  commonName: string;
  family: string;
  thermal: "Chilly" | "Hot" | "Ambithermal";
  triadKeynotes: string[];
  mind: string;
  modalities: {
    agg: string;
    amel: string;
  };
  relationships: string;
  authoritativeSource: string;
}

const REMEDY_DATABASE: RemedyProfile[] = [
  {
    name: "Arsenicum Album",
    commonName: "White Oxide of Arsenic",
    family: "Mineral",
    thermal: "Chilly",
    triadKeynotes: [
      "Intense restlessness with physical weakness & rapid prostration.",
      "Burning pains paradoxically relieved by warm applications & hot drinks.",
      "Nocturnal periodicity peaking between 1:00 AM and 3:00 AM.",
    ],
    mind: "Great anguish with fear of death; fastidious, demanding exact order and tidiness even during severe illness; fears being left alone.",
    modalities: {
      agg: "Midnight (1–3 AM), cold air, cold drinks, wet weather, seaside.",
      amel: "Heat in general, warm drinks, head elevated with hot towels.",
    },
    relationships: "Complementary: Allium Cepa, Phosphorus, Pyrogenium, Thuja.",
    authoritativeSource: "Dr. William Boericke's Materia Medica & Kent's Lectures",
  },
  {
    name: "Lycopodium Clavatum",
    commonName: "Club Moss",
    family: "Lycopodiaceae",
    thermal: "Chilly",
    triadKeynotes: [
      "Directionality: Symptoms travel distinctly from Right to Left.",
      "Digestive Triad: Fullness and distension after a few mouthfuls of food.",
      "Time Modality: Characteristic aggravation between 4:00 PM and 8:00 PM.",
    ],
    mind: "Anticipatory anxiety before public speaking yet performs with great ability; dictatorial at home, timid in public; irritable on waking.",
    modalities: {
      agg: "4:00 PM to 8:00 PM, right side, pressure of clothes, cold drinks.",
      amel: "Warm food and warm drinks, motion, passing flatus, cool air to head.",
    },
    relationships: "Complementary: Calcarea Carb, Sulphur, Iodium, Chelidonium.",
    authoritativeSource: "Dr. H.C. Allen's Keynotes & Boericke",
  },
  {
    name: "Pulsatilla Pratensis",
    commonName: "Wind Flower / Pasque Flower",
    family: "Ranunculaceae",
    thermal: "Hot",
    triadKeynotes: [
      "Mild, gentle, yielding disposition; weeps easily and craves sympathy/consolation.",
      "Ever changeable and wandering symptoms; no two stools alike, no two chills alike.",
      "Complete thirstlessness with almost all complaints, even with dry mouth.",
    ],
    mind: "Highly emotional, seeks affection and consolation; weeps when narrating symptoms; timid, indecisive.",
    modalities: {
      agg: "Warm closed room, evening, rich fatty foods (pastries, butter, pork), resting.",
      amel: "Open cool air, gentle continuous walking, cold wash, consolation.",
    },
    relationships: "Complementary: Lycopodium, Silicea, Kali Sulphuricum.",
    authoritativeSource: "Dr. E.B. Nash's Leaders in Homoeopathic Therapeutics",
  },
  {
    name: "Natrum Muriaticum",
    commonName: "Chloride of Sodium",
    family: "Mineral",
    thermal: "Hot",
    triadKeynotes: [
      "Sun headache: from sunrise to sunset, throbbing as of little hammers.",
      "Great craving for extra salt; mapped tongue; losing flesh while eating well.",
      "Ailments from unresolved grief, disappointed love, or mortification.",
    ],
    mind: "Reserved, introverted, dwells on past disagreeable memories; consolation intensely aggravates; irritable when consoled.",
    modalities: {
      agg: "10:00 AM to 3:00 PM, heat of sun, mental exertion, seaside.",
      amel: "Open air, lying on right side, cold bathing, dark quiet room.",
    },
    relationships: "Complementary: Sepia, Ignatia, Thuja.",
    authoritativeSource: "Dr. J.T. Kent's Materia Medica",
  },
  {
    name: "Nux Vomica",
    commonName: "Poison Nut",
    family: "Loganiaceae",
    thermal: "Chilly",
    triadKeynotes: [
      "Hyper-sensitivity to light, noise, odors, and drafts; highly irritable & impatient.",
      "Constant ineffectual urging to stool; passes small quantity with temporary relief.",
      "Toxic states from modern sedentary life, alcohol, coffee, and mental strain.",
    ],
    mind: "Fiery temperament, ambitious, workaholic, fault-finding, cannot tolerate contradiction or noise.",
    modalities: {
      agg: "Early morning (3–4 AM), cold air, mental work, after eating, stimulants.",
      amel: "Unbroken short nap, damp wet weather, warmth of bed.",
    },
    relationships: "Complementary: Sulphur, Sepia, Kali Carbonicum.",
    authoritativeSource: "Dr. William Boericke & H.C. Allen",
  },
];

export default function RemedyExplorerPage() {
  const [search, setSearch] = useState("");
  const [selectedRemedy, setSelectedRemedy] = useState<RemedyProfile>(REMEDY_DATABASE[0]);

  const filteredRemedies = REMEDY_DATABASE.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.commonName.toLowerCase().includes(search.toLowerCase()) ||
      r.triadKeynotes.some((k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-clinical-600 dark:text-clinical-400" />
            Remedy Knowledge Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative homoeopathic Materia Medica profiles with keynotes, thermal modalities, and remedy relationships.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search remedy name, keynote (e.g. 'Arsenicum', 'sun headache', 'burning', '4-8 PM')..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:border-clinical-600 dark:focus:border-clinical-400 shadow-soft transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Remedy List */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Remedies ({filteredRemedies.length})
          </h2>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredRemedies.map((rem) => {
              const isSelected = selectedRemedy.name === rem.name;
              return (
                <button
                  key={rem.name}
                  onClick={() => setSelectedRemedy(rem)}
                  className={`w-full p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-clinical-50 dark:bg-clinical-950/60 border-clinical-500 dark:border-clinical-600 text-clinical-950 dark:text-clinical-200 font-semibold shadow-xs"
                      : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{rem.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        rem.thermal === "Chilly"
                          ? "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50"
                          : rem.thermal === "Hot"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {rem.thermal}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                    {rem.commonName} • {rem.family}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Detailed Remedy Profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-card space-y-5">
            {/* Title & Authoritative Reference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRemedy.name}
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedRemedy.commonName} ({selectedRemedy.family})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Thermal: {selectedRemedy.thermal}
                </span>
              </div>
            </div>

            {/* Cardinal Keynote Triad */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-clinical-600 dark:text-clinical-400" />
                Cardinal Keynote Triad
              </h3>
              <div className="space-y-1.5">
                {selectedRemedy.triadKeynotes.map((keynote, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-clinical-100 dark:bg-clinical-950/80 text-clinical-800 dark:text-clinical-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-clinical-200/50 dark:border-clinical-800/50">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{keynote}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mind & Mental Generals */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Mental Disposition & Generals
              </h3>
              <p className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedRemedy.mind}
              </p>
            </div>

            {/* Modalities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-300 uppercase text-[10px]">
                  Aggravation (&lt;)
                </span>
                <p className="text-slate-800 dark:text-slate-300 leading-snug">{selectedRemedy.modalities.agg}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase text-[10px]">
                  Amelioration (&gt;)
                </span>
                <p className="text-slate-800 dark:text-slate-300 leading-snug">{selectedRemedy.modalities.amel}</p>
              </div>
            </div>

            {/* Remedy Relationships & Source */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Relationships:</strong> {selectedRemedy.relationships}
              </div>
              <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                {selectedRemedy.authoritativeSource}
              </div>
            </div>
          </div>

          <ClinicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
