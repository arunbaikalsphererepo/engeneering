"use client";

import { useStore } from "@/lib/store";
import { categoryStats } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  Building2, ClipboardCheck, HardHat, TimerReset,
  Activity, AlertTriangle, FileBarChart, Wrench,
  Clock, TrendingUp, TrendingDown, ArrowRight,
  Zap, Users, ChevronRight, Shield, BarChart3,
} from "lucide-react";
import type { WorkOrder } from "@/lib/types";

const financialMetrics = [
  { label: "Total Asset Value",   value: "Rs 48.6 Cr", delta: "211 registered assets",    icon: Building2,    trend: "up"      },
  { label: "Maintenance Spend",   value: "Rs 42.8 L",  delta: "month to date",             icon: Wrench,       trend: "neutral" },
  { label: "Avoidable Loss (PM)", value: "Rs 8.7 L",   delta: "missed maintenance",        icon: AlertTriangle,trend: "down"    },
  { label: "Downtime Exposure",   value: "Rs 15.4 L",  delta: "critical assets at risk",   icon: TimerReset,   trend: "down"    },
];

const costBreakdown = [
  { label: "Preventive maintenance", value: "Rs 12.6 L", percent: 29 },
  { label: "Corrective maintenance", value: "Rs 18.4 L", percent: 43 },
  { label: "Vendor / AMC visits",    value: "Rs 7.9 L",  percent: 18 },
  { label: "Spares consumption",     value: "Rs 3.9 L",  percent: 10 },
];

const lossDrivers = [
  { area: "Guest room FCU repeat issues", loss: "Rs 2.8 L", detail: "room blocking, guest recovery, repeat labor" },
  { area: "Chiller efficiency drift",     loss: "Rs 2.4 L", detail: "excess energy from delayed condenser cleaning" },
  { area: "Lift sensor repeat callouts",  loss: "Rs 1.9 L", detail: "vendor revisit and lobby disruption exposure" },
  { area: "Kitchen equipment downtime",   loss: "Rs 1.6 L", detail: "banquet readiness and emergency repair premium" },
];

const immediateRisks = [
  { label: "Fire pump controller inspection is due",  type: "Critical" },
  { label: "DG set warranty expired; AMC active",     type: "High"     },
  { label: "Kitchen oven calibration due in 4 days",  type: "Medium"   },
  { label: "Lift A door sensor repeat faults noted",  type: "High"     },
];

const upcomingServices = [
  { date: "May 08", title: "Fire Pump Controller service",  detail: "Johnson Controls visit confirmed" },
  { date: "May 14", title: "Chiller Plant 1 PM",            detail: "Quarterly condenser and vibration checks" },
  { date: "Jun 02", title: "Boiler AMC renewal",            detail: "Commercial approval required" },
  { date: "Jul 16", title: "Guest Lift A safety audit",     detail: "Statutory certificate renewal" },
];

// ── palette helpers ───────────────────────────────────────────────────────────
const RISK_CFG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Critical: { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", border: "#fecaca" },
  High:     { bg: "#fff7ed", text: "#c2410c", dot: "#f59e0b", border: "#fed7aa" },
  Medium:   { bg: "#f8fafc", text: "#475569", dot: "#94a3b8", border: "#e2e8f0" },
  "On track":{ bg: "#f0fdf4", text: "#15803d", dot: "#4ade80", border: "#bbf7d0" },
};

const CAT_MONO = ["#0f172a","#1e293b","#334155","#475569","#64748b","#94a3b8"];

function MiniBar({ value, color = "#0f172a", h = 3 }: { value: number; color?: string; h?: number }) {
  return (
    <div style={{ width: "100%", height: h, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", borderRadius: 99, background: color }} />
    </div>
  );
}

function RiskRow({ label, type }: { label: string; type: string }) {
  const cfg = RISK_CFG[type] ?? RISK_CFG.Medium;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 12px", borderRadius: 8,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      marginBottom: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: 5 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{label}</span>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
        background: "white", color: cfg.text, border: `1px solid ${cfg.border}`,
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {type}
      </span>
    </div>
  );
}

// Half-arc gauge for a single category
function ArcGauge({ value, size = 72 }: { value: number; size?: number }) {
  const cx = size / 2;
  const cy = size * 0.62; // arc baseline sits lower than center
  const r  = size * 0.4;
  // Arc spans 180° from 9 o'clock (left) to 3 o'clock (right) via top
  const startAngle = Math.PI;   // 180° — left
  const endAngle   = 0;         // 0°   — right
  const fillAngle  = Math.PI - (value / 100) * Math.PI; // fill from left to value
  const toXY = (a: number) => ({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
  const s  = toXY(startAngle);
  const e  = toXY(endAngle);
  const f  = toXY(fillAngle);
  const trackD = `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
  const fillD  = `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${f.x} ${f.y}`;
  const color  = value >= 85 ? "#0f172a" : value >= 65 ? "#c2410c" : "#dc2626";
  return (
    <svg width={size} height={size * 0.68} style={{ display: "block", flexShrink: 0 }}>
      <path d={trackD} fill="none" stroke="#f1f5f9" strokeWidth={6} strokeLinecap="round" />
      <path d={fillD}  fill="none" stroke={color}   strokeWidth={6} strokeLinecap="round" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.23} fontWeight="800" fill={color}>{value}</text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize={size * 0.13} fontWeight="600" fill="#94a3b8">%</text>
    </svg>
  );
}

function AssetHealthPanel() {
  const cats = categoryStats;
  const maxCount = Math.max(...cats.map(c => c.count));
  const avgHealth = Math.round(cats.reduce((s, c) => s + c.health, 0) / cats.length);
  const totalAssets = cats.reduce((s, c) => s + c.count, 0);
  const atRisk = cats.filter(c => c.health < 80).length;

  return (
    <div style={{ paddingTop: 4 }}>
      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Avg Health",    value: `${avgHealth}%`, sub: "across all categories" },
          { label: "Total Assets",  value: totalAssets,      sub: `${cats.length} categories tracked` },
          { label: "Categories At Risk", value: atRisk,     sub: "health below 80%", warn: atRisk > 0 },
        ].map(({ label, value, sub, warn }) => (
          <div key={label} style={{ padding: "10px 12px", borderRadius: 9, border: `1px solid ${warn ? "#fecaca" : "#f1f5f9"}`, background: warn ? "#fff5f5" : "#f8fafc" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: warn ? "#dc2626" : "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: warn ? "#dc2626" : "#334155", marginTop: 3 }}>{label}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Category rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cats.map((cat) => {
          const healthColor = cat.health >= 85 ? "#0f172a" : cat.health >= 65 ? "#c2410c" : "#dc2626";
          const statusLabel = cat.health >= 85 ? "Good" : cat.health >= 65 ? "Attention" : "Critical";
          const statusBg    = cat.health >= 85 ? "#f0fdf4" : cat.health >= 65 ? "#fff7ed" : "#fef2f2";
          const statusBorder= cat.health >= 85 ? "#bbf7d0" : cat.health >= 65 ? "#fed7aa" : "#fecaca";

          return (
            <div
              key={cat.label}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 14px", borderRadius: 10,
                border: "1px solid #e2e8f0", background: "white",
                transition: "border-color 150ms, box-shadow 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = healthColor; e.currentTarget.style.boxShadow = "0 2px 10px rgba(14,19,28,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Half-arc gauge */}
              <ArcGauge value={cat.health} size={68} />

              {/* Name + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{cat.count} assets</span>
                </div>
                {/* Volume bar */}
                <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{
                    width: `${(cat.count / maxCount) * 100}%`,
                    height: "100%", borderRadius: 99,
                    background: healthColor,
                    transition: "width 600ms ease",
                  }} />
                </div>
                <div style={{ marginTop: 5, fontSize: 10.5, color: "#94a3b8" }}>
                  {Math.round((cat.count / totalAssets) * 100)}% of fleet · {cat.count} registered
                </div>
              </div>

              {/* Status chip */}
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: statusBg, color: healthColor, border: `1px solid ${statusBorder}`,
                flexShrink: 0, whiteSpace: "nowrap",
              }}>
                {statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostDonut() {
  const size = 200;
  const radius = 64;
  const stroke = 20;
  const center = size / 2;
  const circ = 2 * Math.PI * radius;
  let cursor = 0;

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ display: "block", width: "100%", maxWidth: 200, margin: "0 auto" }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {costBreakdown.map((item, i) => {
          const dash = (item.percent / 100) * circ;
          const off = -cursor;
          cursor += dash;
          return (
            <circle key={i} cx={center} cy={center} r={radius}
              fill="none" stroke={CAT_MONO[i % CAT_MONO.length]} strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={off} transform={`rotate(-90 ${center} ${center})`} />
          );
        })}
        <circle cx={center} cy={center} r={radius - 26} fill="white" />
        <text x={center} y={center - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">Total Spend</text>
        <text x={center} y={center + 12} textAnchor="middle" fontSize="18" fill="#0f172a" fontWeight="800">Rs 67.9 L</text>
        <text x={center} y={center + 26} textAnchor="middle" fontSize="8" fill="#94a3b8">+ risk exposure</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        {costBreakdown.map((item, i) => (
          <div key={item.label} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: CAT_MONO[i], flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>{item.label}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
            <div style={{ marginTop: 4, fontSize: 10, color: "#94a3b8" }}>{item.percent}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WORow({ wo, onClick }: { wo: WorkOrder; onClick: () => void }) {
  const pDot: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#94a3b8" };
  const slaColor: Record<string, string> = { "At risk": "#dc2626", "On track": "#334155", Waiting: "#64748b", Met: "#15803d" };
  return (
    <tr
      onClick={onClick}
      style={{ cursor: "pointer", transition: "background 100ms" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{wo.id}</span>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", maxWidth: 240 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wo.title}</p>
        <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wo.area}</p>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: wo.priority === "Critical" || wo.priority === "High" ? "#0f172a" : "#f1f5f9",
          color: wo.priority === "Critical" || wo.priority === "High" ? "white" : "#334155",
          border: "1px solid transparent", whiteSpace: "nowrap" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: pDot[wo.priority] ?? "#94a3b8", display: "inline-block" }} />
          {wo.priority}
        </span>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 11.5, color: "#64748b", whiteSpace: "nowrap" }}>{wo.owner}</td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 11, color: "#334155", fontWeight: 500, whiteSpace: "nowrap" }}>{wo.stage}</td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: slaColor[wo.sla] ?? "#334155" }}>{wo.sla}</span>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 11.5, fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>{wo.eta}</td>
    </tr>
  );
}

export default function Dashboard() {
  const { equipmentAssets, allWorkOrders } = useStore();
  const router = useRouter();

  const openOrders = allWorkOrders.filter(wo => wo.stage !== "Completed");
  const criticalCount = openOrders.filter(wo => wo.priority === "Critical").length;
  const recentOrders = allWorkOrders.slice(0, 8);

  const kpis = [
    { label: "Registered Assets",  value: equipmentAssets.length, sub: "+1 ready for QR tagging",   icon: Building2,     warn: false },
    { label: "PM Compliance",      value: "94%",                  sub: "6 tasks due today",          icon: ClipboardCheck,warn: false },
    { label: "Open Work Orders",   value: openOrders.length,      sub: `${criticalCount} critical`,  icon: HardHat,       warn: criticalCount > 0 },
    { label: "AMC / Warranty Risk",value: 14,                     sub: "expiring in 45 days",        icon: TimerReset,    warn: true  },
  ];

  return (
    <div className="space-y-5">

      {/* ── Dark hero header ───────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 12, background: "#0f172a", color: "white",
        padding: "20px 24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              Engineering HQ
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Operations Dashboard
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              1000-room luxury property · 3 active shifts · Occupancy 92%
            </p>
          </div>
          <button
            onClick={() => router.push("/maintenance")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 8,
              background: "white", color: "#0f172a",
              border: "none", fontSize: 13, fontWeight: 700,
              cursor: "pointer", flexShrink: 0, transition: "opacity 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Activity size={14} /> Live Operations
          </button>
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexWrap: "wrap", gap: 20 }}>
          {[
            { icon: Users,    label: "106 technicians · 3 shifts" },
            { icon: Zap,      label: "Chief Engineer: Arvind Menon" },
            { icon: Shield,   label: "PM compliance: 94%" },
            { icon: BarChart3,label: "VIP arrivals: 18 today" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              <Icon size={12} style={{ opacity: 0.6 }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 10,
              border: kpi.warn ? "1px solid #fecaca" : "1px solid #e2e8f0",
              background: kpi.warn ? "#fff5f5" : "white",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: kpi.warn ? "#fef2f2" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={kpi.warn ? "#dc2626" : "#0f172a"} />
                </div>
                {kpi.warn && <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", padding: "2px 7px", borderRadius: 5, background: "#fef2f2", border: "1px solid #fecaca" }}>RISK</span>}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.warn ? "#dc2626" : "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>{kpi.label}</div>
              <div style={{ marginTop: 2, fontSize: 11, color: "#94a3b8" }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Radar + Risks ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Asset Health</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Health & volume by category</div>
          </div>
          <AssetHealthPanel />
        </div>

        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Immediate Risks</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Action required</div>
            </div>
            <AlertTriangle size={15} color="#94a3b8" />
          </div>
          {immediateRisks.map((r, i) => <RiskRow key={i} label={r.label} type={r.type} />)}
        </div>
      </div>

      {/* ── Cost analysis ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Cost Analysis</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>End-to-end breakdown</div>
          </div>
          <CostDonut />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Financial metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {financialMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <Icon size={14} color="#94a3b8" />
                    {m.trend === "up"   ? <TrendingUp size={12} color="#15803d" />   :
                     m.trend === "down" ? <TrendingDown size={12} color="#dc2626" /> : null}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{m.value}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", marginTop: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>{m.delta}</div>
                </div>
              );
            })}
          </div>

          {/* Loss drivers */}
          <div style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #fecaca", background: "#fff5f5", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <AlertTriangle size={13} color="#dc2626" />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>Loss From Missed Maintenance</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {lossDrivers.map((d) => (
                <div key={d.area} style={{ padding: "10px 12px", borderRadius: 8, background: "white", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#dc2626", letterSpacing: "-0.02em" }}>{d.loss}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", margin: "3px 0 2px" }}>{d.area}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{d.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Work Orders ─────────────────────────────────────────────── */}
      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Active Work Orders</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Live engineering backlog</div>
          </div>
          <button
            onClick={() => router.push("/maintenance")}
            style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
              color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 7, padding: "5px 11px", cursor: "pointer",
            }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["WO #","Task","Priority","Owner","Stage","SLA","ETA"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(wo => <WORow key={wo.id} wo={wo} onClick={() => router.push("/maintenance")} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Timeline + Shift ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Upcoming services */}
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Upcoming Services</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Next 90 days</div>
          </div>
          {upcomingServices.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < upcomingServices.length - 1 ? 14 : 0, position: "relative" }}>
              {i < upcomingServices.length - 1 && (
                <div style={{ position: "absolute", left: 19, top: 28, bottom: -14, width: 1, background: "#f1f5f9" }} />
              )}
              <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.date.split(" ")[0]}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.date.split(" ")[1]}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Shift status */}
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Shift Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Today · On track</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "#0f172a", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Current shift</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Chief Engineer: Arvind Menon</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>106 technicians · 3 shifts · Occupancy 92% · VIP arrivals 18</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["Morning", "48", "Active"],["Evening", "36", "Handover"],["Night", "22", "Standby"]].map(([s, n, status]) => (
              <div key={s} style={{ padding: "12px", borderRadius: 9, border: "1px solid #e2e8f0", background: "white", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{n}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#334155", marginTop: 2 }}>{s}</div>
                <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 1 }}>{status}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => router.push("/maintenance")}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px", borderRadius: 8, background: "#0f172a", color: "white",
                border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              <FileBarChart size={13} /> View Full Maintenance Control
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
