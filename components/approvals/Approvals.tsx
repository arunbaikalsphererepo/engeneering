"use client";

import { useState, useMemo } from "react";
import { approvalsSeed } from "@/lib/data";
import { useStore } from "@/lib/store";
import PanelHeader from "@/components/ui/PanelHeader";
import StatusPill from "@/components/ui/StatusPill";
import clsx from "clsx";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, MessageSquare, User, Building2, Wrench, FileText,
} from "lucide-react";
import type { Approval, MaintenanceRequest } from "@/lib/types";

export default function Approvals() {
  const { maintenanceRequests, approveMaintenanceRequest } = useStore();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [comment, setComment] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

  const pendingRequests = useMemo(
    () => maintenanceRequests.filter((r) => r.status === "Pending Approval"),
    [maintenanceRequests]
  );

  const shownApprovals = filter === "pending"
    ? approvalsSeed.filter((a) => a.status !== "Approved")
    : approvalsSeed;

  const pendingCount = approvalsSeed.filter((a) => a.status !== "Approved" && a.status !== "Rejected").length + pendingRequests.length;
  const approvedCount = approvalsSeed.filter((a) => a.status === "Approved").length;

  const handleApproveRequest = (request: MaintenanceRequest) => {
    approveMaintenanceRequest(request);
    setSelectedRequest(null);
    setActionDone(`Work order raised for: ${request.title}`);
    setComment("");
  };

  /* ── MAINTENANCE REQUEST DETAIL ── */
  if (selectedRequest) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button className="hover:text-slate-900 transition-colors" onClick={() => setSelectedRequest(null)}>Approvals</button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium">{selectedRequest.id}</span>
        </div>
        <div className="card p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <Wrench size={20} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedRequest.title}</h2>
                <StatusPill text={selectedRequest.priority} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedRequest.id} · Maintenance Request</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Reported By", value: selectedRequest.reportedBy, icon: User },
              { label: "Location", value: selectedRequest.location, icon: Building2 },
              { label: "Department", value: selectedRequest.department, icon: Building2 },
              { label: "Submitted", value: selectedRequest.submitted, icon: Clock },
              { label: "Guest Impact", value: selectedRequest.guestImpact, icon: AlertTriangle },
              { label: "Approver", value: selectedRequest.approver, icon: ShieldCheck },
            ].map(({ label, value, icon: FieldIcon }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <FieldIcon size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
              </div>
            ))}
          </div>
          {selectedRequest.description && (
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedRequest.description}</p>
            </div>
          )}
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Decision</h3>
          <div className="space-y-1">
            <label className="label flex items-center gap-1.5"><MessageSquare size={13} />Comment (optional)</label>
            <textarea className="textarea" rows={2} placeholder="Add a note for the team..." value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 btn btn-primary justify-center" onClick={() => handleApproveRequest(selectedRequest)}>
              <CheckCircle2 size={15} /> Approve & Create Work Order
            </button>
            <button className="flex-1 btn btn-danger justify-center" onClick={() => { setSelectedRequest(null); setComment(""); }}>
              <XCircle size={15} /> Defer
            </button>
          </div>
        </div>
        <button className="btn" onClick={() => setSelectedRequest(null)}>Back to Queue</button>
      </div>
    );
  }

  /* ── APPROVAL DETAIL ── */
  if (selectedApproval) {
    const a = selectedApproval;
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button className="hover:text-slate-900 transition-colors" onClick={() => setSelectedApproval(null)}>Approvals</button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium">{a.id}</span>
        </div>
        <div className="card p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-slate-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{a.item}</h2>
                <StatusPill text={a.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{a.id} · {a.category}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Requested By", value: a.requester, icon: User },
              { label: "Priority", value: a.priority, icon: AlertTriangle },
              { label: "Value", value: a.value, icon: Building2 },
              { label: "Approver", value: a.approver, icon: ShieldCheck },
              { label: "Submitted", value: a.submitted, icon: Clock },
              { label: "Due By", value: a.due, icon: Clock },
              { label: "Risk", value: a.risk, icon: AlertTriangle },
              { label: "Asset", value: a.asset, icon: Wrench },
            ].map(({ label, value, icon: FieldIcon }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <FieldIcon size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Justification</p>
            <p className="text-sm text-slate-700 leading-relaxed">{a.justification}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Impact if Deferred</p>
            <p className="text-sm text-slate-700 leading-relaxed">{a.impact}</p>
          </div>
          {a.documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Documents</p>
              <div className="flex flex-wrap gap-2">
                {a.documents.map((doc) => (
                  <span key={doc} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                    <FileText size={12} /> {doc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="btn" onClick={() => setSelectedApproval(null)}>Back to Queue</button>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <p className="eyebrow">Authorization queue</p>
          <h2 className="text-xl font-bold text-slate-900">Approvals Center</h2>
          <p className="text-sm text-slate-500">Review and authorize maintenance, capex, and vendor requests before execution.</p>
        </div>
        {actionDone && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium">
            <CheckCircle2 size={15} /> {actionDone}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-slate-600 bg-slate-100" },
          { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-slate-600 bg-slate-100" },
          { label: "Total This Week", value: approvalsSeed.length + pendingRequests.length, icon: ShieldCheck, color: "text-slate-600 bg-slate-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 space-y-2">
              <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", s.color)}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Maintenance Requests */}
      {pendingRequests.length > 0 && (
        <div className="card p-5">
          <PanelHeader icon={Wrench} title="Pending Maintenance Requests" action={`${pendingRequests.length} awaiting approval`} />
          <div className="space-y-2 mt-1">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => { setSelectedRequest(r); setActionDone(null); }}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Wrench size={16} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{r.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.id} · By {r.reportedBy} · {r.submitted}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill text={r.priority} />
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">Needs Approval</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Approval Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <PanelHeader icon={ShieldCheck} title="Approval Queue" action={`${shownApprovals.length} items`} />
          <button
            className={clsx("btn btn-sm", filter === "pending" && "bg-slate-900 border-slate-900 text-white")}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          >
            {filter === "pending" ? "Show all" : "Pending only"}
          </button>
        </div>
        <div className="space-y-2">
          {shownApprovals.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 transition-all cursor-pointer"
              onClick={() => { setSelectedApproval(a); setActionDone(null); }}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{a.item}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {a.id} · {a.category} · By {a.requester} · {a.submitted}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill text={a.priority} />
                <span className="text-xs font-semibold text-slate-700">{a.value}</span>
                <StatusPill text={a.status} />
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
