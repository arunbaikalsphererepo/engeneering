"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import clsx from "clsx";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, ChevronLeft, MessageSquare, User, Building2,
  Wrench, FileText, IndianRupee, ArrowUpRight,
} from "lucide-react";
import type { Approval, MaintenanceRequest } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: "#0f172a", text: "#ffffff", border: "#0f172a", dot: "#ef4444" },
  High:     { bg: "#1e293b", text: "#ffffff", border: "#1e293b", dot: "#f59e0b" },
  Medium:   { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0", dot: "#3b82f6" },
  Low:      { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};
const STATUS_CFG: Record<string, { bg: string; text: string; border: string }> = {
  "Awaiting GM":      { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  "Finance Review":   { bg: "#fefce8", text: "#854d0e", border: "#fef08a" },
  "Awaiting Finance": { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  "Supervisor Review":{ bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  "Approved":         { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "Rejected":         { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
};

function PBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CFG[priority] ?? PRIORITY_CFG.Medium;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {priority}
    </span>
  );
}
function SBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 6,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function FieldRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Icon size={11} color="#94a3b8" />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8" }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{value || "—"}</span>
    </div>
  );
}

// ── Request detail ────────────────────────────────────────────────────────────
function RequestDetail({ request, onBack, onApprove }: {
  request: MaintenanceRequest;
  onBack: () => void;
  onApprove: () => void;
}) {
  const [comment, setComment] = useState("");
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
        <ChevronLeft size={14} /> Back to Approvals
      </button>

      <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wrench size={18} color="#0f172a" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{request.title}</h2>
              <PBadge priority={request.priority} />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{request.id} · Maintenance Request</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <FieldRow icon={User}         label="Reported By"  value={request.reportedBy}  />
          <FieldRow icon={Building2}    label="Location"     value={request.location}     />
          <FieldRow icon={Building2}    label="Department"   value={request.department}   />
          <FieldRow icon={Clock}        label="Submitted"    value={request.submitted}    />
          <FieldRow icon={AlertTriangle}label="Guest Impact" value={request.guestImpact}  />
          <FieldRow icon={ShieldCheck}  label="Approver"     value={request.approver}     />
        </div>
        {request.description && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>{request.description}</p>
          </div>
        )}
      </div>

      <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 12 }}>Decision</div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
          <MessageSquare size={12} /> Comment (optional)
        </label>
        <textarea
          rows={2}
          placeholder="Add a note for the team..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={onApprove} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 8, background: "#0f172a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <CheckCircle2 size={15} /> Approve & Create Work Order
          </button>
          <button onClick={onBack} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 8, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <XCircle size={15} /> Defer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Approval detail ───────────────────────────────────────────────────────────
function ApprovalDetail({ a, onBack }: { a: Approval; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
        <ChevronLeft size={14} /> Back to Approvals
      </button>

      <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{a.item}</h2>
              <SBadge status={a.status} />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{a.id} · {a.category}</p>
          </div>
        </div>

        {/* Value highlight */}
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#0f172a", color: "white", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>Requested Value</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{a.value}</div>
          </div>
          <PBadge priority={a.priority} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FieldRow icon={User}          label="Requested By" value={a.requester} />
          <FieldRow icon={ShieldCheck}   label="Approver"     value={a.approver}  />
          <FieldRow icon={Clock}         label="Submitted"    value={a.submitted} />
          <FieldRow icon={Clock}         label="Due By"       value={a.due}       />
          <FieldRow icon={AlertTriangle} label="Risk"         value={a.risk}      />
          <FieldRow icon={Wrench}        label="Asset"        value={a.asset}     />
        </div>
      </div>

      <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 8 }}>Justification</div>
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>{a.justification}</p>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 8 }}>Impact If Deferred</div>
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>{a.impact}</p>
      </div>

      {a.documents.length > 0 && (
        <div style={{ padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#94a3b8", marginBottom: 10 }}>Supporting Documents</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {a.documents.map(doc => (
              <span key={doc} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#334155" }}>
                <FileText size={11} color="#64748b" /> {doc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Approvals() {
  const { maintenanceRequests, approveMaintenanceRequest, approvals } = useStore();
  const [selectedApproval, setSelectedApproval]   = useState<Approval | null>(null);
  const [selectedRequest,  setSelectedRequest]    = useState<MaintenanceRequest | null>(null);
  const [actionDone, setActionDone]               = useState<string | null>(null);
  const [filter, setFilter]                       = useState<"pending" | "all">("pending");

  const pendingRequests = useMemo(() => maintenanceRequests.filter(r => r.status === "Pending Approval"), [maintenanceRequests]);
  const shownApprovals  = filter === "pending" ? approvals.filter((a: Approval) => a.status !== "Approved") : approvals;
  const pendingCount    = approvals.filter((a: Approval) => a.status !== "Approved" && a.status !== "Rejected").length + pendingRequests.length;
  const approvedCount   = approvals.filter((a: Approval) => a.status === "Approved").length;

  const handleApproveRequest = (request: MaintenanceRequest) => {
    approveMaintenanceRequest(request);
    setSelectedRequest(null);
    setActionDone(`Work order raised: ${request.title}`);
  };

  if (selectedRequest) return (
    <RequestDetail
      request={selectedRequest}
      onBack={() => setSelectedRequest(null)}
      onApprove={() => handleApproveRequest(selectedRequest)}
    />
  );

  if (selectedApproval) return (
    <ApprovalDetail a={selectedApproval} onBack={() => setSelectedApproval(null)} />
  );

  return (
    <div className="space-y-5">

      {/* ── Dark hero header ───────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, background: "#0f172a", color: "white", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Authorization Queue</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Approvals Center</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 520 }}>
          Review and authorize maintenance, capex, and vendor requests before execution.
        </p>
        {actionDone && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={14} color="#4ade80" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{actionDone}</span>
          </div>
        )}
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Pending Review",  value: pendingCount,                                            icon: Clock,        warn: pendingCount > 0 },
          { label: "Approved",        value: approvedCount,                                           icon: CheckCircle2, warn: false },
          { label: "Total This Week", value: approvals.length + pendingRequests.length,           icon: ShieldCheck,  warn: false },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 10,
              border: kpi.warn ? "1px solid #fed7aa" : "1px solid #e2e8f0",
              background: kpi.warn ? "#fffbeb" : "white",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: kpi.warn ? "#fef3c7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={kpi.warn ? "#c2410c" : "#0f172a"} />
                </div>
                {kpi.warn && <span style={{ fontSize: 10, fontWeight: 700, color: "#c2410c", padding: "2px 7px", borderRadius: 5, background: "#fef3c7", border: "1px solid #fed7aa" }}>ACTION</span>}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Pending maintenance requests ───────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid #fed7aa", background: "#fffbeb", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: 8 }}>
            <Wrench size={14} color="#c2410c" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#c2410c" }}>Pending Maintenance Requests</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "#c2410c", color: "white", marginLeft: 2 }}>{pendingRequests.length}</span>
          </div>
          <div style={{ padding: "10px 14px" }} className="space-y-2">
            {pendingRequests.map(r => (
              <div
                key={r.id}
                onClick={() => { setSelectedRequest(r); setActionDone(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 9,
                  background: "white", border: "1px solid #fed7aa",
                  cursor: "pointer", transition: "box-shadow 150ms",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(194,65,12,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{r.id} · By {r.reportedBy} · {r.submitted}</div>
                </div>
                <PBadge priority={r.priority} />
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: "#fef3c7", color: "#c2410c", border: "1px solid #fed7aa", whiteSpace: "nowrap" }}>Needs Approval</span>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approval queue ─────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Approval Queue</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{shownApprovals.length} items</div>
          </div>
          <button
            onClick={() => setFilter(f => f === "pending" ? "all" : "pending")}
            style={{
              padding: "5px 12px", borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
              background: filter === "pending" ? "#0f172a" : "#f8fafc",
              color: filter === "pending" ? "white" : "#64748b",
              border: filter === "pending" ? "1px solid #0f172a" : "1px solid #e2e8f0",
            }}
          >
            {filter === "pending" ? "Show all" : "Pending only"}
          </button>
        </div>

        <div style={{ padding: "10px 14px" }} className="space-y-2">
          {shownApprovals.map(a => (
            <div
              key={a.id}
              onClick={() => { setSelectedApproval(a); setActionDone(null); }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 9,
                border: "1px solid #e2e8f0", background: "white",
                cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(14,19,28,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Priority accent */}
              <div style={{ width: 3, flexShrink: 0, alignSelf: "stretch", borderRadius: 99, background: PRIORITY_CFG[a.priority]?.dot ?? "#94a3b8", minHeight: 14 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{a.item}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{a.id} · {a.category} · {a.requester} · {a.submitted}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                      <IndianRupee size={11} /> {a.value.replace("Rs ", "")}
                    </span>
                    <PBadge priority={a.priority} />
                    <SBadge status={a.status} />
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
