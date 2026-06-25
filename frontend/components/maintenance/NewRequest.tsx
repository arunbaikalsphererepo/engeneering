"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wrench, AlertTriangle, Building2 } from "lucide-react";

const CATEGORIES = ["HVAC", "Electrical", "Plumbing", "Civil", "Mechanical", "IT/AV", "Fire Safety", "Elevator", "Housekeeping Equipment", "Kitchen Equipment", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
const DEPARTMENTS = ["Rooms", "F&B", "Banquets", "Spa", "Engineering", "Housekeeping", "Front Office", "IT", "Life Safety", "Culinary", "Utilities", "Recreation"];
const LOCATIONS = [
  "Lobby", "Restaurant – Spice Garden", "Restaurant – The Terrace", "Banquet Hall A", "Banquet Hall B",
  "Spa & Wellness", "Fitness Center", "Pool Deck", "Business Center",
  "Tower A – Floors 1–10", "Tower A – Floors 11–20", "Tower A – Floors 21–30",
  "Tower B – Floors 1–10", "Tower B – Floors 11–20", "Tower B – Floors 21–30",
  "Tower C – Floors 1–10", "Tower C – Floors 11–20",
  "Back-of-House", "Engineering Basement", "Roof", "Parking",
];

export default function NewRequest() {
  const { submitMaintenanceRequest, activeRole } = useStore();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requestType: "Corrective",
    priority: "Medium" as typeof PRIORITIES[number],
    location: "",
    roomNumber: "",
    department: "Engineering",
    assetId: "",
    reportedBy: activeRole?.label ?? "",
    guestImpact: "No",
    targetTime: "",
  });

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMaintenanceRequest({
      title: form.title,
      description: form.description,
      requestType: form.requestType,
      priority: form.priority,
      location: form.location + (form.roomNumber ? ` – Room ${form.roomNumber}` : ""),
      department: form.department,
      assetId: form.assetId,
      reportedBy: form.reportedBy,
      guestImpact: form.guestImpact,
      targetTime: form.targetTime,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-slate-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Request Submitted</h2>
            <p className="text-slate-500 text-sm">
              Your maintenance request has been logged and is pending engineering approval. A work order will be generated once approved.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button className="btn btn-primary" onClick={() => router.push("/maintenance")}>
              <Wrench size={15} /> View Maintenance
            </button>
            <button className="btn" onClick={() => setSubmitted(false)}>Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="eyebrow">Engineering team</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">New Maintenance Request</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Flags */}
        {form.guestImpact === "Yes" && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium">
            <Building2 size={15} /> Guest-impacting issue flagged
          </div>
        )}

        {/* Issue Details */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Issue Details</h3>
          <div className="space-y-1">
            <label className="label">Issue Title <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. AC not cooling in Room 1204" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea className="textarea" rows={3} placeholder="Provide additional context, symptoms, or observations..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select className="select" value={form.requestType} onChange={(e) => set("requestType", e.target.value)} required>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={(e) => set("priority", e.target.value as typeof PRIORITIES[number])}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Guest Impact</label>
              <select className="select" value={form.guestImpact} onChange={(e) => set("guestImpact", e.target.value)}>
                <option>No</option>
                <option>Yes</option>
                <option>Potential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Location & Asset</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label">Area / Zone <span className="text-red-500">*</span></label>
              <select className="select" value={form.location} onChange={(e) => set("location", e.target.value)} required>
                <option value="">Select location</option>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Room / Unit Number</label>
              <input className="input" placeholder="e.g. 1204, B-17" value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="label">Department</label>
              <select className="select" value={form.department} onChange={(e) => set("department", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Asset ID</label>
              <input className="input" placeholder="e.g. EQ-AC-0118" value={form.assetId} onChange={(e) => set("assetId", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Reporter */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Reporter & Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label">Reported By <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Name / department" value={form.reportedBy} onChange={(e) => set("reportedBy", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="label">Target Completion</label>
              <input className="input" type="datetime-local" value={form.targetTime} onChange={(e) => set("targetTime", e.target.value)} />
            </div>
          </div>
          {form.priority === "Critical" && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">Critical requests auto-escalate to the Chief Engineer and require immediate action.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">
            <Wrench size={15} /> Submit Request
          </button>
          <button type="button" className="btn" onClick={() => router.push("/maintenance")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
