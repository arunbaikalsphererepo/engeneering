"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import AssetQr from "@/components/ui/AssetQr";
import {
  ChevronLeft, Download, Activity, CalendarClock, History,
  ListChecks, Pencil, AlertTriangle, CheckCircle2, Clock,
  Wrench, Building2, Shield,
} from "lucide-react";
import type { Equipment, WorkOrder } from "@/lib/types";

function getHistory(asset: Equipment, linkedOrders: WorkOrder[]) {
  const fromOrders = linkedOrders.slice(0, 4).map((wo, i) => ({
    date: ["May 08, 2026","May 06, 2026","Apr 28, 2026","Apr 12, 2026"][i] ?? "Apr 01, 2026",
    title: wo.title, detail: `${wo.owner} · ${wo.stage} · ${wo.area}`,
    status: wo.stage === "Completed" ? "Met" : wo.sla, cost: ["Rs 8,500","Rs 2,400","Rs 0","Rs 14,200"][i] ?? "Rs 0",
  }));
  return [
    ...fromOrders,
    { date: "Mar 31, 2026", title: "Preventive maintenance completed",  detail: "Checklist signed by supervisor with QR scan validation.", status: "Met",      cost: "Rs 0"    },
    { date: "Feb 26, 2026", title: "Condition monitoring review",        detail: `Health trend reviewed for ${asset.category}; no shutdown required.`, status: "On track", cost: "Rs 0"    },
    { date: "Jan 18, 2026", title: "Vendor service visit",              detail: `${asset.amc} completed routine inspection and handover notes.`, status: "Met",       cost: "Rs 5,800" },
  ];
}

function MiniBar({ value, color = "#0f172a" }: { value: number; color?: string }) {
  return (
    <div style={{ width: "100%", height: 4, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", borderRadius: 99, background: color }} />
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 9, border: "1px solid #e2e8f0", background: "white" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{value || "—"}</div>
    </div>
  );
}

const PRIORITY_DOT: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#94a3b8" };
const SLA_COLOR: Record<string, string> = { "At risk": "#dc2626", "On track": "#334155", Waiting: "#64748b", Met: "#15803d" };

export default function EquipmentDetail({ assetId }: { assetId: string }) {
  const { equipmentAssets, activeRole, allWorkOrders } = useStore();
  const router = useRouter();
  const asset = equipmentAssets.find(a => a.id === assetId);

  if (!asset) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: 13 }}>Asset not found: <span style={{ fontFamily: "monospace" }}>{assetId}</span></p>
        <button onClick={() => router.push("/equipment")} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, background: "#0f172a", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Back to Registry</button>
      </div>
    );
  }

  const linked  = allWorkOrders.filter(wo => wo.asset === asset.id || wo.area === asset.location || wo.title.toLowerCase().includes(asset.name.toLowerCase().split(" ")[0]));
  const history = getHistory(asset, linked);
  const healthColor = asset.health >= 85 ? "#0f172a" : asset.health >= 60 ? "#c2410c" : "#dc2626";

  return (
    <div className="space-y-5">

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={() => router.push("/equipment")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <ChevronLeft size={13} /> Equipment Registry
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {activeRole.canManageEquipment && (
            <button onClick={() => router.push(`/equipment/${asset.id}/edit`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Pencil size={13} /> Edit Asset
            </button>
          )}
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, background: "#0f172a", color: "white", padding: "22px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              {asset.category} Asset
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{asset.name}</h1>
            <div style={{ margin: "8px 0 0", display: "flex", flexWrap: "wrap", gap: 14 }}>
              {[
                { icon: Building2, label: asset.id },
                { icon: Wrench,    label: asset.location },
                { icon: Shield,    label: `${asset.criticality ?? "Medium"} criticality` },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  <Icon size={11} style={{ opacity: 0.6 }} /> {label}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[asset.status ?? "Healthy", asset.warranty ?? "Active", asset.health >= 85 ? "On track" : "At risk"].map(badge => {
                const isGood = badge === "Healthy" || badge === "Active" || badge === "On track";
                return (
                  <span key={badge} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: isGood ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.14)",
                    color: isGood ? "#4ade80" : "#f87171",
                    border: `1px solid ${isGood ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}>{badge}</span>
                );
              })}
            </div>
          </div>
          <div style={{ flexShrink: 0, background: "white", borderRadius: 10, padding: 8 }}>
            <AssetQr asset={asset} size={128} />
          </div>
        </div>
      </div>

      {/* ── Detail grid ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <InfoCell label="Manufacturer"   value={asset.manufacturer    ?? "—"} />
        <InfoCell label="Model"          value={asset.model           ?? "—"} />
        <InfoCell label="Serial Number"  value={asset.serialNumber    ?? "—"} />
        <InfoCell label="Owner"          value={asset.owner           ?? "Duty Engineer"} />
        <InfoCell label="Warranty Expiry"value={asset.warrantyExpiry  ?? "—"} />
        <InfoCell label="AMC Vendor"     value={asset.amc             ?? "—"} />
        <InfoCell label="AMC Expiry"     value={asset.amcExpiry       ?? "—"} />
        <InfoCell label="Next Service"   value={asset.nextService     ?? "—"} />
      </div>

      {/* ── Health + Warranty ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Health */}
        <div style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Asset Health</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Composite condition score</div>
            </div>
            <Activity size={16} color="#94a3b8" />
          </div>

          {/* Big health number */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: healthColor, letterSpacing: "-0.05em", lineHeight: 1 }}>{asset.health}</div>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#94a3b8" }}>%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: asset.health >= 85 ? "#15803d" : "#c2410c" }}>
                {asset.health >= 85 ? "Good condition" : asset.health >= 60 ? "Needs attention" : "Critical"}
              </div>
            </div>
          </div>

          {/* Health bar */}
          <div style={{ height: 8, borderRadius: 99, background: "#f1f5f9", overflow: "hidden", marginBottom: 14 }}>
            <div style={{ width: `${asset.health}%`, height: "100%", borderRadius: 99, background: healthColor, transition: "width 600ms ease" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Uptime</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{asset.uptime ?? 98.2}%</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Open WOs</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{linked.filter(wo => wo.stage !== "Completed").length}</div>
            </div>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>Health score calculated from downtime, PM compliance, open issues, and service age.</p>
        </div>

        {/* Warranty & AMC */}
        <div style={{ padding: "18px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Warranty & AMC</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Commercial view</div>
            </div>
            <CalendarClock size={16} color="#94a3b8" />
          </div>
          <div className="space-y-3">
            {[
              { label: "Warranty status",    value: asset.warranty ?? "Active",           warn: asset.warranty === "Expired" },
              { label: "AMC vendor",         value: asset.amc ?? "Not assigned",          warn: !asset.amc },
              { label: "Next service",       value: asset.nextService ?? "Not scheduled", warn: !asset.nextService },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: 9,
                background: item.warn ? "#fff5f5" : "#f8fafc",
                border: `1px solid ${item.warn ? "#fecaca" : "#e2e8f0"}`,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.warn ? "#dc2626" : "#334155" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Maintenance History ────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Maintenance History</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{history.length} events</div>
          </div>
          <History size={15} color="#94a3b8" />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date","Event","Status","Cost"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((ev, i) => {
                const slaColor = SLA_COLOR[ev.status] ?? "#334155";
                return (
                  <tr key={i} style={{ borderBottom: i < history.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 100ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{ev.date}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{ev.title}</div>
                      <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1 }}>{ev.detail}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: slaColor, padding: "3px 8px", borderRadius: 5, background: ev.status === "At risk" ? "#fef2f2" : "#f8fafc", border: "1px solid #e2e8f0" }}>{ev.status}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>{ev.cost}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Linked Work Orders ─────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Linked Work Orders</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{linked.length} records</div>
          </div>
          <ListChecks size={15} color="#94a3b8" />
        </div>
        {linked.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["WO #","Task","Priority","Owner","Stage","SLA"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linked.map((wo, i) => (
                  <tr key={wo.id} style={{ borderBottom: i < linked.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 100ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#334155" }}>{wo.id}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{wo.title}</div>
                      <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1 }}>{wo.department} · {wo.source}</div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                        background: wo.priority === "Critical" || wo.priority === "High" ? "#0f172a" : "#f1f5f9",
                        color: wo.priority === "Critical" || wo.priority === "High" ? "white" : "#334155", whiteSpace: "nowrap" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: PRIORITY_DOT[wo.priority] ?? "#94a3b8", display: "inline-block" }} />
                        {wo.priority}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{wo.owner}</td>
                    <td style={{ padding: "11px 14px", fontSize: 11.5, color: "#334155", whiteSpace: "nowrap" }}>{wo.stage}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: SLA_COLOR[wo.sla] ?? "#334155" }}>{wo.sla}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No linked work orders for this asset.</div>
        )}
      </div>
    </div>
  );
}
