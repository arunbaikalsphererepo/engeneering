"use client";

import { useState } from "react";
import { configurationSections } from "@/lib/data";
import PanelHeader from "@/components/ui/PanelHeader";
import clsx from "clsx";
import {
  Settings2, ChevronRight, Tag, MapPin, Users, ShieldCheck,
  DollarSign, ClipboardList, Info, ChevronLeft,
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ElementType> = {
  "asset-categories": Tag,
  "location-hierarchy": MapPin,
  "vendor-masters": Users,
  "sla-matrix": ShieldCheck,
  "approval-limits": DollarSign,
  "checklist-templates": ClipboardList,
};

type Section = typeof configurationSections[number];

export default function Settings() {
  const [selected, setSelected] = useState<Section | null>(null);

  if (selected) {
    const Icon = SECTION_ICONS[selected.id] ?? Settings2;
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => setSelected(null)}
          >
            <ChevronLeft size={14} /> Configuration
          </button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium capitalize">{selected.title}</span>
        </div>

        {/* Section header */}
        <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Icon size={22} />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold text-slate-900 capitalize">{selected.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{selected.description}</p>
            <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
              <span>Owner: <span className="font-semibold text-slate-600">{selected.owner}</span></span>
              <span>Updated: <span className="font-semibold text-slate-600">{selected.updated}</span></span>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Info size={14} className="text-slate-500" /> Configuration Rules
          </h3>
          <ul className="space-y-2">
            {selected.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Master Data Table */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Master Data</h3>
            <button className="btn btn-sm btn-primary">+ Add Record</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {selected.fields.map((field) => (
                    <th key={field} className="table-head-cell">{field}</th>
                  ))}
                  <th className="table-head-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selected.records.map((row, ri) => (
                  <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className={clsx("table-cell", ci === 0 && "font-semibold text-slate-800")}>
                        {cell}
                      </td>
                    ))}
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn btn-sm text-xs">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button className="btn flex items-center gap-2" onClick={() => setSelected(null)}>
          <ChevronLeft size={14} /> Back to Configuration
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <p className="eyebrow">System administration</p>
          <h2 className="text-xl font-bold text-slate-900">Configuration</h2>
          <p className="text-sm text-slate-500">
            Manage master data, SLA rules, approval limits, vendor masters, asset categories, and checklist templates.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <ShieldCheck size={15} className="text-slate-500 flex-shrink-0" />
          <p className="text-xs text-slate-600 font-medium">Changes require Chief Engineer approval.</p>
        </div>
      </div>

      {/* Config Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configurationSections.map((section) => {
          const Icon = SECTION_ICONS[section.id] ?? Settings2;
          return (
            <button
              key={section.id}
              className="card p-5 text-left space-y-4 hover:border-slate-300 hover:shadow-card-hover transition-all"
              onClick={() => setSelected(section)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <Icon size={18} />
                </div>
                <ChevronRight size={16} className="text-slate-300 mt-1 flex-shrink-0" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 capitalize">{section.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{section.description}</p>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-100">
                <span>{section.records.length} records</span>
                <span>Updated {section.updated}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="card p-5">
        <PanelHeader icon={Settings2} title="System Summary" action="Configuration overview" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {[
            { label: "Asset Categories", value: configurationSections.find((s) => s.id === "asset-categories")?.records.length ?? 0 },
            { label: "Locations Mapped", value: configurationSections.find((s) => s.id === "location-hierarchy")?.records.length ?? 0 },
            { label: "Vendors Registered", value: configurationSections.find((s) => s.id === "vendor-masters")?.records.length ?? 0 },
            { label: "SLA Priority Tiers", value: configurationSections.find((s) => s.id === "sla-matrix")?.records.length ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 p-4 text-center space-y-1">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail Preview */}
      <div className="card p-5">
        <PanelHeader icon={ClipboardList} title="Recent Configuration Changes" action="Audit log" />
        <div className="space-y-2 mt-1">
          {[
            { user: "Arvind Menon", action: "Updated SLA matrix – Critical priority response time", time: "Today, 8:00 AM" },
            { user: "Engineering QA", action: "Added Chiller PM checklist template v2.1", time: "Today, 9:40 AM" },
            { user: "Finance Controller", action: "Updated approval limit for major repairs to Rs 2,00,000", time: "May 06, 2026" },
            { user: "Engineering Planner", action: "Added Tower D – Residences to location hierarchy", time: "Yesterday, 6:30 PM" },
          ].map((entry, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-slate-700">
                  {entry.user.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700"><span className="font-semibold">{entry.user}</span> · {entry.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
