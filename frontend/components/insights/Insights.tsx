"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { categoryStats } from "@/lib/data";
import PanelHeader from "@/components/ui/PanelHeader";
import Meter from "@/components/ui/Meter";
import clsx from "clsx";
import {
  BarChart3, TrendingUp, TrendingDown, Wrench, AlertTriangle,
  Building2, Clock, CheckCircle2, Download, Activity,
  Users, Zap, ShieldCheck,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Live Dashboard", icon: Activity },
];

const MTTR_DATA = [
  { label: "HVAC", hours: 3.2, target: 4 },
  { label: "Electrical", hours: 1.8, target: 2 },
  { label: "Plumbing", hours: 2.5, target: 3 },
  { label: "Civil", hours: 6.1, target: 8 },
  { label: "IT / AV", hours: 1.2, target: 2 },
  { label: "Elevator", hours: 4.8, target: 6 },
];

const SLA_WEEKLY = [
  { day: "Mon", met: 94 }, { day: "Tue", met: 97 }, { day: "Wed", met: 91 },
  { day: "Thu", met: 88 }, { day: "Fri", met: 95 }, { day: "Sat", met: 82 }, { day: "Sun", met: 90 },
];

const TECH_UTIL = [
  { name: "Suresh Kumar", role: "HVAC Lead", jobs: 12, utilization: 91 },
  { name: "Rajesh Nair", role: "Electrical", jobs: 9, utilization: 78 },
  { name: "Priya Iyer", role: "Plumbing", jobs: 8, utilization: 72 },
  { name: "Vikram Singh", role: "Civil", jobs: 6, utilization: 65 },
  { name: "Amina Khan", role: "Multi-trade", jobs: 11, utilization: 88 },
];

export default function Insights() {
  const { allWorkOrders } = useStore();
  const [tab, setTab] = useState("dashboard");

  const openOrders = useMemo(() => allWorkOrders.filter((w) => w.stage !== "Completed"), [allWorkOrders]);
  const criticalCount = openOrders.filter((w) => w.priority === "Critical").length;
  const avgSla = Math.round(SLA_WEEKLY.reduce((s, d) => s + d.met, 0) / SLA_WEEKLY.length);
  const avgMttr = (MTTR_DATA.reduce((s, d) => s + d.hours, 0) / MTTR_DATA.length).toFixed(1);
  const maxCatCount = Math.max(...categoryStats.map((c) => c.count));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <p className="eyebrow">Engineering intelligence</p>
          <h2 className="text-xl font-bold text-slate-900">Insights & Analytics</h2>
          <p className="text-sm text-slate-500">KPIs, SLA compliance, team utilization, and downloadable reports.</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          Last refreshed: Today, 08:00 AM
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-2">
        <div className="flex gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  tab === t.id ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "dashboard" && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Open Work Orders", value: openOrders.length, sub: "across property", icon: Wrench, color: "text-slate-600 bg-slate-100", trend: -3, good: true },
              { label: "Critical Issues", value: criticalCount, sub: "guest / safety impact", icon: AlertTriangle, color: "text-slate-600 bg-slate-100", trend: +1, good: false },
              { label: "SLA Compliance", value: `${avgSla}%`, sub: "7-day rolling", icon: ShieldCheck, color: "text-slate-600 bg-slate-100", trend: +2, good: true },
              { label: "Avg MTTR (hrs)", value: avgMttr, sub: "mean time to resolve", icon: Clock, color: "text-slate-600 bg-slate-100", trend: -0.3, good: true },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-4 space-y-2">
                  <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", s.color)}>
                    <Icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs font-medium text-slate-500">{s.label}</p>
                  <div className="flex items-center gap-1">
                    {s.good
                      ? <TrendingDown size={13} className="text-slate-400" />
                      : <TrendingUp size={13} className="text-slate-600" />}
                    <span className="text-xs font-medium text-slate-400">
                      {s.trend > 0 ? "+" : ""}{s.trend} vs last week
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Breakdown — uses CategoryStat: { label, count, health } */}
            <div className="card p-5 space-y-4">
              <PanelHeader icon={BarChart3} title="Asset Health by Category" action="Equipment register" />
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.label} className="space-y-1.5 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{cat.count} assets</span>
                        <span className="font-semibold text-slate-700">
                          {cat.health}% health
                        </span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          cat.health >= 85 ? "bg-slate-900" : "bg-slate-400"
                        )}
                        style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Volume share</span>
                      <span>{Math.round((cat.count / maxCatCount) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Compliance Weekly */}
            <div className="card p-5 space-y-4">
              <PanelHeader icon={ShieldCheck} title="SLA Compliance" action="7-day trend" />
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-3">
                <div className="grid grid-cols-7 gap-2 items-end h-40">
                  {SLA_WEEKLY.map((d) => (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-600 bg-slate-100">{d.met}%</span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={clsx(
                            "w-full rounded-t-xl rounded-b-md transition-all",
                            d.met >= 90 ? "bg-slate-900" : d.met >= 85 ? "bg-slate-600" : "bg-slate-400"
                          )}
                          style={{ height: `${d.met}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />≥90%</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-600" />85–89%</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-400" />&lt;85%</div>
              </div>
            </div>

            {/* MTTR by Category */}
            <div className="card p-5 space-y-4">
              <PanelHeader icon={Clock} title="MTTR by Category" action="Hours · vs target" />
              <div className="space-y-3">
                {MTTR_DATA.map((d) => (
                  <div key={d.label} className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{d.label}</span>
                      <span className="font-semibold text-xs text-slate-700">
                        {d.hours}h <span className="text-slate-400 font-normal">/ {d.target}h target</span>
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                      <div
                        className={clsx(
                          "h-full rounded-full",
                          d.hours <= d.target ? "bg-slate-900" : "bg-slate-400"
                        )}
                        style={{ width: `${Math.min(100, (d.hours / d.target) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Actual duration</span>
                      <span>{Math.round((d.hours / d.target) * 100)}% of target</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Utilization */}
            <div className="card p-5 space-y-4">
              <PanelHeader icon={Users} title="Technician Utilization" action="Today's shift" />
              <div className="space-y-3">
                {TECH_UTIL.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-700">{t.name.split(" ").map((n) => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-slate-800 truncate">{t.name}</span>
                        <span className="text-xs font-bold text-slate-700">
                          {t.utilization}%
                        </span>
                      </div>
                      <Meter value={t.utilization} />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 w-12 text-right">{t.jobs} jobs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Energy Indicators */}
          <div className="card p-5">
            <PanelHeader icon={Zap} title="Energy & Sustainability Indicators" action="This month" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: "Energy Consumption", value: "142,800 kWh", change: "-4.2%", good: true },
                { label: "Water Usage", value: "18,450 kL", change: "-1.8%", good: true },
                { label: "Preventive Compliance", value: "96%", change: "+3%", good: true },
                { label: "Emergency Calls", value: "7", change: "+2", good: false },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">{m.label}</p>
                  <p className="text-xl font-bold text-slate-900">{m.value}</p>
                  <div className="flex items-center gap-1">
                    {m.good ? <TrendingDown size={13} className="text-slate-400" /> : <TrendingUp size={13} className="text-slate-600" />}
                    <span className="text-xs font-medium text-slate-400">{m.change} vs last month</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Work Order Open/Closed Summary */}
      <div className="card p-5">
        <PanelHeader icon={CheckCircle2} title="Work Order Summary" action="All time" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: "Total Open", value: openOrders.length, color: "text-slate-600 bg-slate-100", icon: Wrench },
            { label: "Critical", value: openOrders.filter((w) => w.priority === "Critical").length, color: "text-slate-600 bg-slate-100", icon: AlertTriangle },
            { label: "High", value: openOrders.filter((w) => w.priority === "High").length, color: "text-slate-600 bg-slate-100", icon: TrendingUp },
            { label: "Completed", value: allWorkOrders.filter((w) => w.stage === "Completed").length, color: "text-slate-600 bg-slate-100", icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 p-4 space-y-2">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", s.color)}>
                  <Icon size={16} />
                </div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rooms Summary */}
      <div className="card p-5">
        <PanelHeader icon={Building2} title="Room & Property Status" action="Live" />
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="rounded-xl border border-slate-200 p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-slate-900">92%</p>
            <p className="text-xs text-slate-500">Occupancy</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-slate-900">28</p>
            <p className="text-xs text-slate-500">Rooms Blocked</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-slate-900">972</p>
            <p className="text-xs text-slate-500">Ready for Sale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
