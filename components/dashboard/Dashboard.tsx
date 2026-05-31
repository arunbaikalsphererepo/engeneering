"use client";

import { useStore } from "@/lib/store";
import { categoryStats } from "@/lib/data";
import StatusPill from "@/components/ui/StatusPill";
import PanelHeader from "@/components/ui/PanelHeader";
import Risk from "@/components/ui/Risk";
import TimelineItem from "@/components/ui/TimelineItem";
import { useRouter } from "next/navigation";
import {
  Building2, ClipboardCheck, HardHat, TimerReset,
  Activity, AlertTriangle, FileBarChart, Wrench,
  Clock3, LayoutDashboard, TrendingUp, TrendingDown,
} from "lucide-react";
import type { WorkOrder } from "@/lib/types";

const financialMetrics = [
  { label: "Total Asset Value", value: "Rs 48.6 Cr", delta: "211 registered assets", icon: Building2, trend: "up" },
  { label: "Maintenance Spend", value: "Rs 42.8 L", delta: "month to date", icon: Wrench, trend: "neutral" },
  { label: "Avoidable Loss (PM)", value: "Rs 8.7 L", delta: "missed maintenance", icon: AlertTriangle, trend: "down" },
  { label: "Downtime Exposure", value: "Rs 15.4 L", delta: "critical assets at risk", icon: TimerReset, trend: "down" },
];

const costBreakdown = [
  { label: "Preventive maintenance", value: "Rs 12.6 L", percent: 29, status: "On track" },
  { label: "Corrective maintenance", value: "Rs 18.4 L", percent: 43, status: "High" },
  { label: "Vendor / AMC visits", value: "Rs 7.9 L", percent: 18, status: "Medium" },
  { label: "Spares consumption", value: "Rs 3.9 L", percent: 10, status: "On track" },
];

const lossDrivers = [
  { area: "Guest room FCU repeat issues", loss: "Rs 2.8 L", detail: "room blocking, guest recovery, repeat labor" },
  { area: "Chiller efficiency drift", loss: "Rs 2.4 L", detail: "excess energy due to delayed condenser cleaning" },
  { area: "Lift sensor repeat callouts", loss: "Rs 1.9 L", detail: "vendor revisit and lobby disruption exposure" },
  { area: "Kitchen equipment downtime", loss: "Rs 1.6 L", detail: "banquet readiness and emergency repair premium" },
];

function MetricCard({ label, value, delta, icon: Icon }: {
  label: string; value: string; delta: string; icon: React.ElementType; color?: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-slate-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-[13px] font-medium text-slate-500 mt-1.5">{label}</p>
      </div>
      <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">{delta}</p>
    </div>
  );
}

function WorkOrderRow({ wo, onClick }: { wo: WorkOrder; onClick: () => void }) {
  return (
    <tr className="table-row-hover border-b border-slate-100 last:border-0" onClick={onClick}>
      <td className="table-cell font-semibold text-black whitespace-nowrap">{wo.id}</td>
      <td className="table-cell max-w-[260px]">
        <p className="font-medium text-black truncate">{wo.title}</p>
        <p className="text-xs text-slate-500 truncate">{wo.area}</p>
      </td>
      <td className="table-cell"><StatusPill text={wo.priority} /></td>
      <td className="table-cell text-slate-600 whitespace-nowrap">{wo.owner}</td>
      <td className="table-cell"><StatusPill text={wo.stage} /></td>
      <td className="table-cell"><StatusPill text={wo.sla} /></td>
      <td className="table-cell font-medium text-slate-600 whitespace-nowrap">{wo.eta}</td>
    </tr>
  );
}

function EngineeringRadar() {
  const size = 280;
  const center = size / 2;
  const ring = 92;
  const maxCount = Math.max(...categoryStats.map((cat) => cat.count), 1);
  const categories = categoryStats.slice(0, 6);
  const angleStep = (Math.PI * 2) / categories.length;
  const palette = ["#0ea5e9", "#14b8a6", "#f59e0b", "#fb7185", "#8b5cf6", "#22c55e"];

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category health radar</p>
          <p className="text-sm text-slate-400 mt-1">Visual health, volume, and balance by category.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
          Live snapshot
        </span>
      </div>

      <div className="relative mx-auto w-fit">
        <svg viewBox={`0 0 ${size} ${size}`} className="block w-[280px] h-[280px]">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </radialGradient>
            <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
            </linearGradient>
            <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          <circle cx={center} cy={center} r={118} fill="url(#radarGlow)" />
          {[28, 58, 88].map((r) => (
            <circle key={r} cx={center} cy={center} r={r} fill="none" stroke="#f1f5f9" strokeDasharray="3 5" />
          ))}

          {categories.map((cat, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const x = center + Math.cos(angle) * 100;
            const y = center + Math.sin(angle) * 100;
            const barLength = 30 + (cat.health / 100) * 72;
            const bx = center + Math.cos(angle) * (18 + barLength / 2);
            const by = center + Math.sin(angle) * (18 + barLength / 2);
            const rotate = (angle * 180) / Math.PI + 90;
            return (
              <g key={cat.label}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="#f1f5f9" strokeWidth={1.25} />
                <rect
                  x={bx - 8}
                  y={by - barLength / 2}
                  width={16}
                  height={barLength}
                  rx={8}
                  fill={cat.health >= 85 ? palette[index % palette.length] : "#fb7185"}
                  opacity={0.92}
                  transform={`rotate(${rotate} ${bx} ${by})`}
                  filter="url(#radarShadow)"
                />
                <circle cx={x} cy={y} r={5.5} fill="#ffffff" stroke={cat.health >= 85 ? palette[index % palette.length] : "#fb7185"} strokeWidth={2} />
                <circle cx={x} cy={y} r={2.2} fill={cat.health >= 85 ? palette[index % palette.length] : "#fb7185"} />
                <text x={center + Math.cos(angle) * 132} y={center + Math.sin(angle) * 132 + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">
                  {cat.label}
                </text>
                <text x={center + Math.cos(angle) * 132} y={center + Math.sin(angle) * 132 + 18} textAnchor="middle" fontSize="9" fill="#64748b">
                  {cat.health}% · {cat.count}
                </text>
              </g>
            );
          })}

          <circle cx={center} cy={center} r={38} fill="#ffffff" stroke="#f1f5f9" />
          <text x={center} y={center - 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">
            Property
          </text>
          <text x={center} y={center + 14} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">
            Health
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {categories.map((cat, index) => (
          <div key={cat.label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: palette[index % palette.length] }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-black truncate">{cat.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{cat.count} assets</p>
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(cat.count / maxCount) * 100}%`, background: palette[index % palette.length] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostDonut() {
  const size = 230;
  const stroke = 22;
  const radius = 74;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const palette = ["#0ea5e9", "#14b8a6", "#f59e0b", "#fb7185"];

  let cursor = 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 shadow-sm">
      <div className="relative mx-auto w-fit">
        <svg viewBox={`0 0 ${size} ${size}`} className="block w-[230px] h-[230px]">
          <defs>
            <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
          </defs>
          <circle cx={center} cy={center} r={radius + stroke / 2 + 2} fill="#fff" filter="url(#donutGlow)" />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />

          {costBreakdown.map((item, index) => {
            const dash = (item.percent / 100) * circumference;
            const gap = circumference - dash;
            const dashOffset = -cursor;
            cursor += dash;
            return (
              <circle
                key={item.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}

          <circle cx={center} cy={center} r={radius - 28} fill="#fff" />
          <text x={center} y={center - 6} textAnchor="middle" className="fill-slate-500" fontSize="11" fontWeight="600">
            Total engineering
          </text>
          <text x={center} y={center + 14} textAnchor="middle" className="fill-slate-900" fontSize="24" fontWeight="800">
            Rs 67.9 L
          </text>
          <text x={center} y={center + 34} textAnchor="middle" className="fill-slate-400" fontSize="10" fontWeight="600">
            spend + risk impact
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {costBreakdown.map((item, index) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: palette[index % palette.length] }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-black truncate">{item.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.value}</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.percent}%`, background: palette[index % palette.length] }} />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">{item.percent}% of total</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { equipmentAssets, allWorkOrders } = useStore();
  const router = useRouter();

  const metrics = [
    { label: "Registered Assets", value: String(equipmentAssets.length), delta: "+1 ready for QR tagging", icon: Building2, color: "sky" },
    { label: "PM Compliance", value: "94%", delta: "6 tasks due today", icon: ClipboardCheck, color: "emerald" },
    { label: "Open Work Orders", value: "37", delta: "8 high priority", icon: HardHat, color: "amber" },
    { label: "AMC / Warranty Risk", value: "14", delta: "expiring in 45 days", icon: TimerReset, color: "red" },
  ];

  const recentOrders = allWorkOrders.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Command Center + Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <PanelHeader icon={Activity} title="Live Engineering Command Center" action="Today" />
          <EngineeringRadar />
        </div>
        <div className="card p-5">
          <PanelHeader icon={AlertTriangle} title="Immediate Risks" action="Prioritized" />
          <div className="space-y-1">
            <Risk label="Fire pump controller inspection is due" type="Critical" />
            <Risk label="DG set warranty expired; AMC active" type="High" />
            <Risk label="Kitchen oven calibration due in 4 days" type="Medium" />
            <Risk label="Lift A door sensor repeat faults noted" type="High" />
          </div>
        </div>
      </div>

      {/* Finance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost Analysis */}
        <div className="card p-5 space-y-4">
          <PanelHeader icon={FileBarChart} title="Cost Analysis" action="End to end" />
          <CostDonut />
        </div>

        {/* Financial Metrics + Loss Drivers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {financialMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="card p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon size={15} className="text-slate-500" />
                    </div>
                    {m.trend === "up" ? <TrendingUp size={13} className="text-slate-400" /> :
                     m.trend === "down" ? <TrendingDown size={13} className="text-slate-400" /> : null}
                  </div>
                  <p className="text-[17px] font-bold text-slate-900 leading-none tracking-tight">{m.value}</p>
                  <p className="text-[12px] font-medium text-slate-500">{m.label}</p>
                  <p className="text-[11px] text-slate-400">{m.delta}</p>
                </div>
              );
            })}
          </div>
          <div className="card p-5">
            <PanelHeader icon={AlertTriangle} title="Loss From Missed Maintenance" action="Avoidable impact" />
              <div className="grid grid-cols-2 gap-3">
                {lossDrivers.map((driver) => (
                  <div key={driver.area} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black leading-snug">{driver.area}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{driver.detail}</p>
                    </div>
                    <span className="text-sm font-bold text-black flex-shrink-0">{driver.loss}</span>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>

      {/* Active Work Orders */}
      <div className="card p-5">
        <PanelHeader icon={Clock3} title="Active Work Orders" action="View all" onAction={() => router.push("/maintenance")} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-head-cell">WO</th>
                <th className="table-head-cell">Task</th>
                <th className="table-head-cell">Priority</th>
                <th className="table-head-cell">Owner</th>
                <th className="table-head-cell">Stage</th>
                <th className="table-head-cell">SLA</th>
                <th className="table-head-cell">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((wo) => (
                <WorkOrderRow key={wo.id} wo={wo} onClick={() => router.push("/maintenance")} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <PanelHeader icon={LayoutDashboard} title="Upcoming Services" action="Next 90 days" />
          <div>
            <TimelineItem date="May 08" title="Fire Pump Controller service" detail="Johnson Controls visit confirmed" />
            <TimelineItem date="May 14" title="Chiller Plant 1 PM" detail="Quarterly condenser and vibration checks" />
            <TimelineItem date="Jun 02" title="Boiler AMC renewal" detail="Commercial approval required" />
            <TimelineItem date="Jul 16" title="Guest Lift A safety audit" detail="Statutory certificate renewal" />
          </div>
        </div>
        <div className="card p-5">
          <PanelHeader icon={Activity} title="Shift Status" action="Today" />
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between">
              <p className="text-sm font-semibold text-slate-800">Today's Shift</p>
              <StatusPill text="On track" />
            </div>
            <p className="text-xs text-slate-500">106 technicians · 3 shifts</p>
            <p className="text-xs text-slate-500">Chief Engineer: Arvind Menon · Occupancy 92% · VIP arrivals 18</p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[["Morning", "48"], ["Evening", "36"], ["Night", "22"]].map(([s, n]) => (
                <div key={s} className="rounded bg-white border border-slate-200 p-2 text-center">
                  <p className="text-base font-bold text-black">{n}</p>
                  <p className="text-[10px] text-slate-500">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
