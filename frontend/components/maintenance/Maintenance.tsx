"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { pmPlan, vendorJobs, roomImpact } from "@/lib/data";
import {
  Wrench, AlertTriangle, ClipboardCheck, TimerReset,
  ListChecks, Users, ChevronRight, Clock, Zap,
  ArrowUpRight, Shield, Building2,
  Activity, CircleDot, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

const priorityRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// ── palette ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: "#0f172a", text: "#ffffff", border: "#0f172a", dot: "#ef4444" },
  High:     { bg: "#1e293b", text: "#ffffff", border: "#1e293b", dot: "#f59e0b" },
  Medium:   { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0", dot: "#3b82f6" },
  Low:      { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};

const STAGE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "In Progress":       { icon: Loader2,      color: "#0f172a", bg: "#f1f5f9" },
  "Assigned":          { icon: CircleDot,    color: "#334155", bg: "#f8fafc" },
  "Supervisor Review": { icon: Activity,     color: "#1e293b", bg: "#f1f5f9" },
  "Vendor Scheduled":  { icon: TimerReset,   color: "#475569", bg: "#f8fafc" },
  "Material Check":    { icon: ListChecks,   color: "#475569", bg: "#f8fafc" },
  "Pending Approval":  { icon: Clock,        color: "#64748b", bg: "#f8fafc" },
  "Requested":         { icon: ArrowUpRight, color: "#64748b", bg: "#f8fafc" },
  "Completed":         { icon: CheckCircle2, color: "#15803d", bg: "#f0fdf4" },
  "Review":            { icon: Activity,     color: "#475569", bg: "#f8fafc" },
};

const SLA_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "At risk": { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  "On track":{ color: "#334155", bg: "#f1f5f9", border: "#e2e8f0" },
  "Waiting": { color: "#64748b", bg: "#f8fafc",  border: "#e2e8f0" },
  "Met":     { color: "#15803d", bg: "#f0fdf4",  border: "#bbf7d0" },
};

// ── tiny atoms ───────────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 6,
      background: cfg.bg, color: cfg.text,
      border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0, display: "inline-block" }} />
      {priority}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage] ?? { icon: CircleDot, color: "#64748b", bg: "#f8fafc" };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      border: "1px solid #e2e8f0",
      fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      <Icon size={10} />
      {stage}
    </span>
  );
}

function SlaBadge({ sla }: { sla: string }) {
  const cfg = SLA_CONFIG[sla] ?? SLA_CONFIG["On track"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 8px", borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {sla}
    </span>
  );
}

function MiniBar({ value, color = "#0f172a", h = 3 }: { value: number; color?: string; h?: number }) {
  return (
    <div style={{ width: "100%", height: h, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", borderRadius: 99, background: color, transition: "width 600ms ease" }} />
    </div>
  );
}

function CompletionRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 80 ? "#0f172a" : value >= 50 ? "#475569" : "#94a3b8";
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ── work order type ───────────────────────────────────────────────────────────
interface WO {
  id: string; title: string; area: string; priority: string;
  owner: string; eta: string; stage: string; sla: string;
  asset: string; department: string;
}

// ── Priority Queue ───────────────────────────────────────────────────────────
function PriorityQueuePanel({ orders }: { orders: WO[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-2">
      {orders.map((wo) => {
        const isHov = hovered === wo.id;
        return (
          <div
            key={wo.id}
            onMouseEnter={() => setHovered(wo.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push(`/maintenance?detail=work-order&id=${wo.id}`)}
            style={{
              display: "flex", flexDirection: "column",
              padding: "14px 16px", borderRadius: 10,
              border: isHov ? "1px solid #0f172a" : "1px solid #e2e8f0",
              background: isHov ? "#fafafa" : "white",
              cursor: "pointer",
              transition: "border-color 150ms, background 150ms, box-shadow 150ms",
              boxShadow: isHov ? "0 2px 12px rgba(14,19,28,0.07)" : "none",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 3, flexShrink: 0, alignSelf: "stretch", borderRadius: 99,
                background: PRIORITY_CONFIG[wo.priority]?.dot ?? "#94a3b8",
                minHeight: 16,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#94a3b8", letterSpacing: "0.06em" }}>
                    {wo.id}
                  </span>
                  <span style={{ fontSize: 10, color: "#cbd5e1" }}>·</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{wo.department}</span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 13.5, fontWeight: 600, color: "#0f172a", lineHeight: 1.35 }}>
                  {wo.title}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#64748b" }}>{wo.area}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <PriorityBadge priority={wo.priority} />
                <SlaBadge sla={wo.sla} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 15, flexWrap: "wrap" }}>
              <StageBadge stage={wo.stage} />
              <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={10} />
                {wo.owner}
              </span>
              <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} />
                {wo.eta}
              </span>
              {isHov && (
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#334155", fontWeight: 600 }}>
                  View details <ChevronRight size={12} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── PM Plan ───────────────────────────────────────────────────────────────────
function PmPlanPanel() {
  const totalTasks = pmPlan.reduce((s, d) => s + d.tasks, 0);
  const avgComplete = Math.round(pmPlan.reduce((s, d) => s + d.complete, 0) / pmPlan.length);
  const peakDay = pmPlan.reduce((a, b) => a.tasks > b.tasks ? a : b).day;
  const totalManpower = pmPlan.reduce((s, d) => s + parseInt(d.manpower), 0);

  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
        padding: "14px 16px", borderRadius: 10,
        background: "#0f172a", color: "white",
      }}>
        {[
          { label: "Total Tasks", value: totalTasks },
          { label: "Avg Completion", value: `${avgComplete}%` },
          { label: "Peak Day", value: peakDay },
          { label: "Total Manpower", value: `${totalManpower} techs` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>{value}</div>
          </div>
        ))}
      </div>

      {pmPlan.map((day) => (
        <div
          key={day.day}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 16px", borderRadius: 10,
            border: "1px solid #e2e8f0", background: "white",
            transition: "border-color 150ms, box-shadow 150ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,19,28,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <CompletionRing value={day.complete} />
            <span style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#0f172a",
            }}>
              {day.complete}%
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{day.day}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{day.tasks} tasks · {day.manpower}</span>
            </div>
            <MiniBar value={day.complete} h={4} color={day.complete >= 80 ? "#0f172a" : day.complete >= 50 ? "#475569" : "#94a3b8"} />
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748b" }}>{day.focus}</p>
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: day.complete >= 80 ? "#f0fdf4" : day.complete >= 50 ? "#f8fafc" : "#fff7ed",
              color: day.complete >= 80 ? "#15803d" : day.complete >= 50 ? "#334155" : "#c2410c",
              border: `1px solid ${day.complete >= 80 ? "#bbf7d0" : day.complete >= 50 ? "#e2e8f0" : "#fed7aa"}`,
            }}>
              {day.complete >= 80 ? "On target" : day.complete >= 50 ? "In progress" : "Behind"}
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              {Math.round((day.complete / 100) * day.tasks)}/{day.tasks} done
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Vendors ──────────────────────────────────────────────────────────────────
function VendorsPanel() {
  return (
    <div className="space-y-3">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Scheduled Today",  value: vendorJobs.filter(j => j.arrival.startsWith("Today")).length,    icon: Clock    },
          { label: "Tomorrow",          value: vendorJobs.filter(j => j.arrival.startsWith("Tomorrow")).length, icon: TimerReset },
          { label: "Active Permits",    value: vendorJobs.filter(j => j.permit !== "Hot work: No").length,      icon: Shield   },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            padding: "12px 14px", borderRadius: 10,
            border: "1px solid #e2e8f0", background: "white",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={16} color="#0f172a" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{value}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {vendorJobs.map((job) => {
        const isToday = job.arrival.startsWith("Today");
        return (
          <div
            key={job.vendor}
            style={{
              padding: "16px 18px", borderRadius: 10,
              border: isToday ? "1px solid #0f172a" : "1px solid #e2e8f0",
              background: "white", transition: "box-shadow 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,19,28,0.07)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{job.vendor}</span>
                  {isToday && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#0f172a", color: "white", letterSpacing: "0.06em" }}>
                      TODAY
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#475569", margin: "0 0 10px" }}>{job.scope}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {([
                    { icon: Clock,  label: job.arrival },
                    { icon: Shield, label: job.permit },
                    { icon: Users,  label: `Contact: ${job.contact}` },
                  ] as { icon: React.ElementType; label: string }[]).map(({ icon: Icon, label }) => (
                    <span key={label} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, color: "#64748b",
                      padding: "3px 9px", borderRadius: 6,
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                    }}>
                      <Icon size={10} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <span style={{
                padding: "4px 10px", borderRadius: 6,
                background: "#f1f5f9", color: "#334155",
                border: "1px solid #e2e8f0",
                fontSize: 11, fontWeight: 600, flexShrink: 0,
              }}>
                Scheduled
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── All Work Orders ──────────────────────────────────────────────────────────
function WorkOrdersPanel({ orders }: { orders: WO[] }) {
  const [sortKey, setSortKey] = useState<"priority" | "eta" | "stage">("priority");

  const sorted = useMemo(() => {
    if (sortKey === "priority") return [...orders].sort((a, b) => (priorityRank[a.priority] ?? 4) - (priorityRank[b.priority] ?? 4));
    if (sortKey === "stage")    return [...orders].sort((a, b) => a.stage.localeCompare(b.stage));
    return [...orders];
  }, [orders, sortKey]);

  return (
    <div className="space-y-3">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          <strong style={{ color: "#0f172a" }}>{orders.length}</strong> open work orders
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["priority", "eta", "stage"] as const).map(k => (
            <button key={k} onClick={() => setSortKey(k)} style={{
              padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
              background: sortKey === k ? "#0f172a" : "white",
              color: sortKey === k ? "white" : "#64748b",
              fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
            }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["WO #", "Task / Asset", "Area", "Priority", "Stage", "Owner", "SLA", "ETA"].map((h) => (
                <th key={h} style={{
                  padding: "9px 14px", textAlign: "left",
                  fontSize: 10, fontWeight: 700, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((wo, idx) => (
              <tr
                key={wo.id}
                style={{ borderBottom: idx < sorted.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 100ms" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{wo.id}</span>
                </td>
                <td style={{ padding: "12px 14px", maxWidth: 220 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wo.title}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wo.asset}</p>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 11.5, color: "#64748b", whiteSpace: "nowrap" }}>{wo.area}</td>
                <td style={{ padding: "12px 14px" }}><PriorityBadge priority={wo.priority} /></td>
                <td style={{ padding: "12px 14px" }}><StageBadge stage={wo.stage} /></td>
                <td style={{ padding: "12px 14px", fontSize: 11.5, color: "#64748b", whiteSpace: "nowrap" }}>{wo.owner}</td>
                <td style={{ padding: "12px 14px" }}><SlaBadge sla={wo.sla} /></td>
                <td style={{ padding: "12px 14px", fontSize: 11.5, fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>{wo.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Maintenance() {
  const { allWorkOrders, activeRole } = useStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("priority");

  const openOrders = useMemo(() => allWorkOrders.filter((wo) => wo.stage !== "Completed"), [allWorkOrders]);
  const criticalOrders  = useMemo(() => openOrders.filter(wo => wo.priority === "Critical"), [openOrders]);
  const atRiskOrders    = useMemo(() => openOrders.filter(wo => wo.sla === "At risk"),        [openOrders]);

  const priorityOrders = useMemo(
    () => [...openOrders].sort((a, b) => (priorityRank[a.priority] ?? 4) - (priorityRank[b.priority] ?? 4)).slice(0, 12),
    [openOrders]
  );

  const stageDist = useMemo(() => {
    const m: Record<string, number> = {};
    openOrders.forEach(wo => { m[wo.stage] = (m[wo.stage] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [openOrders]);

  const sections = [
    { id: "priority",    label: "Priority Queue",    icon: AlertTriangle  },
    { id: "pm-plan",     label: "PM Plan",            icon: ClipboardCheck },
    { id: "vendors",     label: "Vendors",            icon: TimerReset     },
    { id: "work-orders", label: "All Work Orders",    icon: ListChecks     },
  ];

  return (
    <div className="space-y-5">

      {/* ── Command header ─────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 12, background: "#0f172a", color: "white",
        padding: "20px 24px", overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              Maintenance Control
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Engineering Operations
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 520 }}>
              Live view of work order backlog, PM compliance, vendor coordination, and SLA health for today&apos;s shift.
            </p>
          </div>
          {activeRole.canCreateRequest && (
            <button
              onClick={() => router.push("/maintenance/new")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 8,
                background: "white", color: "#0f172a",
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
                transition: "opacity 150ms",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <ListChecks size={14} />
              New Request
            </button>
          )}
        </div>

        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexWrap: "wrap", gap: 20,
        }}>
          {[
            { icon: Users,    label: "106 technicians · 3 shifts" },
            { icon: Building2, label: "Chief Engineer: Arvind Menon" },
            { icon: Zap,      label: "Occupancy 92%" },
            { icon: ArrowUpRight, label: "VIP arrivals: 18" },
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
        {[
          { label: "Open Work Orders", value: openOrders.length,    sub: "across property",         icon: Wrench,        warn: false },
          { label: "Critical Issues",  value: criticalOrders.length, sub: "guest or safety impact",  icon: AlertTriangle, warn: criticalOrders.length > 0 },
          { label: "SLA At Risk",      value: atRiskOrders.length,   sub: "need immediate action",   icon: XCircle,       warn: atRiskOrders.length > 0 },
          { label: "Vendor Jobs",      value: vendorJobs.length,     sub: "scheduled today & tomorrow", icon: TimerReset, warn: false },
        ].map((kpi, i) => {
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
                {kpi.warn && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", padding: "2px 7px", borderRadius: 5, background: "#fef2f2", border: "1px solid #fecaca" }}>
                    ACTION
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.warn ? "#dc2626" : "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>{kpi.label}</div>
              <div style={{ marginTop: 2, fontSize: 11, color: "#94a3b8" }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Room impact + Stage distribution ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Room impact */}
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Room Impact</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                {roomImpact.reduce((s, r) => s + r.blocked, 0)} rooms currently affected
              </div>
            </div>
            <Building2 size={16} color="#94a3b8" />
          </div>
          <div className="space-y-3">
            {roomImpact.map((r) => (
              <div key={r.tower} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0f172a", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{r.tower}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{r.blocked} blocked</span>
                  </div>
                  <MiniBar value={(r.blocked / 15) * 100} h={3} color="#0f172a" />
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{r.issue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage distribution */}
        <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Pipeline Stages</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Work order distribution</div>
            </div>
            <Activity size={16} color="#94a3b8" />
          </div>
          <div className="space-y-3">
            {stageDist.map(([stage, count]) => {
              const pct = Math.round((count / openOrders.length) * 100);
              const cfg = STAGE_CONFIG[stage] ?? { icon: CircleDot, color: "#64748b", bg: "#f8fafc" };
              const Icon = cfg.icon;
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={11} color={cfg.color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{stage}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{count} · {pct}%</span>
                    </div>
                    <MiniBar value={pct} h={3} color="#0f172a" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section tabs ───────────────────────────────────────────────────── */}
      <div style={{
        padding: "6px", borderRadius: 10,
        border: "1px solid #e2e8f0", background: "white",
        position: "sticky", top: 8, zIndex: 10,
        backdropFilter: "blur(12px)",
        display: "flex", flexWrap: "wrap", gap: 4,
      }}>
        {sections.map((sec) => {
          const Icon = sec.icon;
          const active = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 7, border: "none",
                background: active ? "#0f172a" : "transparent",
                color: active ? "white" : "#64748b",
                fontSize: 12.5, fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "background 150ms, color 150ms",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f1f5f9"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={13} />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* ── Section content ────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", padding: "16px 18px" }}>
        {activeSection === "priority"    && <PriorityQueuePanel orders={priorityOrders as WO[]} />}
        {activeSection === "pm-plan"     && <PmPlanPanel />}
        {activeSection === "vendors"     && <VendorsPanel />}
        {activeSection === "work-orders" && <WorkOrdersPanel orders={openOrders as WO[]} />}
      </div>

    </div>
  );
}
