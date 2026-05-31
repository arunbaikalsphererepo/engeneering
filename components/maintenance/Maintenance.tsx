"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { pmPlan, vendorJobs } from "@/lib/data";
import StatusPill from "@/components/ui/StatusPill";
import Meter from "@/components/ui/Meter";
import PanelHeader from "@/components/ui/PanelHeader";
import clsx from "clsx";
import {
  Wrench, AlertTriangle, ClipboardCheck, TimerReset,
  ListChecks, Users,
} from "lucide-react";

const priorityRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function Maintenance() {
  const { allWorkOrders, activeRole } = useStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("priority");

  const openOrders = useMemo(() => allWorkOrders.filter((wo) => wo.stage !== "Completed"), [allWorkOrders]);

  const priorityOrders = useMemo(
    () => [...openOrders].sort((a, b) => (priorityRank[a.priority] ?? 4) - (priorityRank[b.priority] ?? 4)).slice(0, 10),
    [openOrders]
  );

  const sections = [
    { id: "priority", label: "Priority Queue" },
    { id: "pm-plan", label: "PM Plan" },
    { id: "vendors", label: "Vendors" },
    { id: "work-orders", label: "Work Orders" },
  ];

  const activePanel = (() => {
    if (activeSection === "pm-plan") {
      return (
        <div className="card p-5">
          <PanelHeader icon={ClipboardCheck} title="Preventive Maintenance Plan" action="Weekly progress" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pmPlan.map((day) => (
              <div key={day.day} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 hover:shadow-card-hover transition-all cursor-pointer">
                <p className="text-sm font-bold text-slate-800">{day.day}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{day.tasks} tasks</span>
                  <span className="text-xs font-bold text-slate-700">{day.complete}%</span>
                </div>
                <Meter value={day.complete} />
                <p className="text-xs text-slate-400 leading-snug">{day.focus}</p>
                <p className="text-xs font-medium text-slate-600">{day.manpower}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === "vendors") {
      return (
        <div className="card p-5">
          <PanelHeader icon={TimerReset} title="Vendor & Permit Schedule" action="Next 24 hours" />
          <div className="grid grid-cols-1 gap-4">
            {vendorJobs.map((job) => (
              <div key={job.vendor} className="rounded-xl border border-slate-200 p-4 space-y-2.5 hover:border-slate-300 hover:shadow-card-hover transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{job.vendor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{job.scope}</p>
                  </div>
                  <StatusPill text="Scheduled" />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{job.arrival}</span>
                  <span>·</span>
                  <span>{job.permit}</span>
                  <span>·</span>
                  <span>Contact: {job.contact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === "work-orders") {
      return (
        <div className="card p-5">
          <PanelHeader icon={ListChecks} title="Active Work Order Register" action={`${openOrders.length} open`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-head-cell">WO</th>
                  <th className="table-head-cell">Task</th>
                  <th className="table-head-cell">Area</th>
                  <th className="table-head-cell">Priority</th>
                  <th className="table-head-cell">Owner</th>
                  <th className="table-head-cell">Stage</th>
                  <th className="table-head-cell">SLA</th>
                  <th className="table-head-cell">ETA</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((wo) => (
                  <tr key={wo.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="table-cell font-semibold font-mono text-slate-900">{wo.id}</td>
                    <td className="table-cell max-w-[200px]">
                      <p className="font-medium text-slate-800 truncate">{wo.title}</p>
                      <p className="text-xs text-slate-400 truncate">{wo.asset}</p>
                    </td>
                    <td className="table-cell text-xs text-slate-600">{wo.area}</td>
                    <td className="table-cell"><StatusPill text={wo.priority} /></td>
                    <td className="table-cell text-xs text-slate-600">{wo.owner}</td>
                    <td className="table-cell"><StatusPill text={wo.stage} /></td>
                    <td className="table-cell"><StatusPill text={wo.sla} /></td>
                    <td className="table-cell font-medium text-slate-700 whitespace-nowrap">{wo.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="card p-5">
        <PanelHeader icon={AlertTriangle} title="Priority Queue" action="Guest & safety first" />
        <div className="space-y-2">
          {priorityOrders.map((wo) => (
            <div
              key={wo.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              onClick={() => router.push(`/maintenance?detail=work-order&id=${wo.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{wo.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{wo.id} · {wo.area}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill text={wo.priority} />
                <span className="text-xs text-slate-500">{wo.owner}</span>
                <span className="text-xs font-semibold text-slate-700">{wo.eta}</span>
                <StatusPill text={wo.sla} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })();

  const stats = [
    { label: "Open Work Orders", value: openOrders.length, delta: "across property", icon: Wrench, color: "text-slate-600 bg-slate-100" },
    { label: "Critical Live Issues", value: openOrders.filter((wo) => wo.priority === "Critical").length, delta: "guest or safety impact", icon: AlertTriangle, color: "text-slate-600 bg-slate-100" },
    { label: "PM Tasks This Week", value: pmPlan.reduce((s, d) => s + d.tasks, 0), delta: "7-star service standard", icon: ClipboardCheck, color: "text-slate-600 bg-slate-100" },
    { label: "Vendor Jobs Scheduled", value: vendorJobs.length, delta: "next 24 hours", icon: TimerReset, color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <div className="space-y-5">
      {/* Command Header */}
      <div className="card p-5 flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="eyebrow">1000-room luxury property</p>
            <h2 className="text-xl font-bold text-slate-900">Maintenance Control Center</h2>
            <p className="text-sm text-slate-500 max-w-2xl">
              Focused view for today&apos;s engineering operation: guest impact, life safety, PM compliance, vendor coordination, and SLA risk.
            </p>
          </div>

          {activeRole.canCreateRequest && (
            <div className="w-full lg:w-[280px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Quick Action</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Need a new maintenance request?</p>
              <p className="mt-1 text-xs text-slate-500">Open the request form directly from here.</p>
              <button className="btn btn-primary mt-4 w-full justify-center" onClick={() => router.push("/maintenance/new") }>
                <ListChecks size={15} />
                New Request
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Today&apos;s Shift</p>
              <Users size={16} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">106 technicians · 3 shifts</p>
            <p className="text-xs text-slate-400">Chief Engineer: Arvind Menon · Occupancy 92% · VIP arrivals 18</p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icon size={17} className="text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="text-xs text-slate-400">{s.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-3 sticky top-4 z-10 bg-white/95 backdrop-blur border border-slate-200">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Maintenance sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              onClick={() => {
                setActiveSection(section.id);
              }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeSection === section.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {activePanel}
    </div>
  );
}
