"use client";

import { useState } from "react";
import { configurationSections } from "@/lib/data";
import {
  Settings2, ChevronRight, ChevronLeft, Tag, MapPin, Users, ShieldCheck,
  DollarSign, ClipboardList, Info, Plus,
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ElementType> = {
  "asset-categories":    Tag,
  "location-hierarchy":  MapPin,
  "vendor-masters":      Users,
  "sla-matrix":          ShieldCheck,
  "approval-limits":     DollarSign,
  "checklist-templates": ClipboardList,
};

const SECTION_COLORS: Record<string, string> = {
  "asset-categories":    "#0f172a",
  "location-hierarchy":  "#1e293b",
  "vendor-masters":      "#334155",
  "sla-matrix":          "#475569",
  "approval-limits":     "#334155",
  "checklist-templates": "#1e293b",
};

type Section = typeof configurationSections[number];

const auditLog = [
  { user: "Arvind Menon",        action: "Updated SLA matrix – Critical priority response time",           time: "Today, 8:00 AM"   },
  { user: "Engineering QA",      action: "Added Chiller PM checklist template v2.1",                       time: "Today, 9:40 AM"   },
  { user: "Finance Controller",  action: "Updated approval limit for major repairs to Rs 2,00,000",        time: "May 06, 2026"     },
  { user: "Engineering Planner", action: "Added Tower D – Residences to location hierarchy",               time: "Yesterday, 6:30 PM"},
];

export default function Settings() {
  const [selected, setSelected] = useState<Section | null>(null);

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selected) {
    const Icon = SECTION_ICONS[selected.id] ?? Settings2;
    const bg   = SECTION_COLORS[selected.id] ?? "#0f172a";
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <ChevronLeft size={14} /> Configuration
        </button>

        {/* Section hero */}
        <div style={{ borderRadius: 12, background: bg, color: "white", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 11, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={22} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", textTransform: "capitalize" }}>{selected.title}</h2>
              <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "rgba(255,255,255,0.55)", maxWidth: 520 }}>{selected.description}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Owner: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{selected.owner}</strong></span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Updated: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{selected.updated}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <Info size={13} color="#94a3b8" />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Configuration Rules</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }} className="space-y-2">
            {selected.rules.map((rule, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#f1f5f9", color: "#334155", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Master data table */}
        <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Master Data</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{selected.records.length} records</div>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "#0f172a", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <Plus size={13} /> Add Record
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {selected.fields.map(f => (
                    <th key={f} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>{f}</th>
                  ))}
                  <th style={{ padding: "9px 14px", textAlign: "right", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selected.records.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{ borderBottom: ri < selected.records.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 100ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "11px 14px", fontSize: 13, color: ci === 0 ? "#0f172a" : "#475569", fontWeight: ci === 0 ? 700 : 400 }}>{cell}</td>
                    ))}
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <button style={{ padding: "4px 10px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  const sysStats = [
    { label: "Asset Categories",    value: configurationSections.find(s => s.id === "asset-categories")?.records.length ?? 0 },
    { label: "Locations Mapped",    value: configurationSections.find(s => s.id === "location-hierarchy")?.records.length ?? 0 },
    { label: "Vendors Registered",  value: configurationSections.find(s => s.id === "vendor-masters")?.records.length ?? 0 },
    { label: "SLA Priority Tiers",  value: configurationSections.find(s => s.id === "sla-matrix")?.records.length ?? 0 },
  ];

  return (
    <div className="space-y-5">

      {/* ── Dark hero ───────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, background: "#0f172a", color: "white", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>System Administration</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Configuration</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 520 }}>
              Manage master data, SLA rules, approval limits, vendor masters, asset categories, and checklist templates.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 9, background: "rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <ShieldCheck size={13} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Changes require Chief Engineer approval</span>
          </div>
        </div>
      </div>

      {/* ── System stats ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {sysStats.map((s, i) => (
          <div key={s.label} style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ marginTop: 4, fontSize: 11.5, fontWeight: 700, color: "#334155" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Config sections grid ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {configurationSections.map(section => {
          const Icon = SECTION_ICONS[section.id] ?? Settings2;
          const bg   = SECTION_COLORS[section.id] ?? "#0f172a";
          return (
            <button
              key={section.id}
              onClick={() => setSelected(section)}
              style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", textAlign: "left", cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,19,28,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="white" />
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", textTransform: "capitalize" }}>{section.title}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {section.description}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{section.records.length} records</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Updated {section.updated}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Audit trail ────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Audit Log</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Recent configuration changes</div>
        </div>
        <div style={{ padding: "10px 14px" }} className="space-y-1">
          {auditLog.map((entry, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 8, transition: "background 100ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#334155" }}>
                  {entry.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#334155" }}>
                  <strong style={{ color: "#0f172a" }}>{entry.user}</strong> · {entry.action}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
