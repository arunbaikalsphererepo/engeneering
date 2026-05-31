"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { workOrdersSeed } from "@/lib/data";
import StatusPill from "@/components/ui/StatusPill";
import Meter from "@/components/ui/Meter";
import PanelHeader from "@/components/ui/PanelHeader";
import AssetQr from "@/components/ui/AssetQr";
import DetailBox from "@/components/ui/DetailBox";
import TimelineItem from "@/components/ui/TimelineItem";
import Risk from "@/components/ui/Risk";
import {
  ChevronLeft, Download, Activity, CalendarClock, History,
  ListChecks, HardHat, Pencil,
} from "lucide-react";
import type { Equipment, WorkOrder } from "@/lib/types";

function getHistory(asset: Equipment, linkedOrders: WorkOrder[]) {
  const fromOrders = linkedOrders.slice(0, 4).map((wo, i) => ({
    date: ["May 08, 2026", "May 06, 2026", "Apr 28, 2026", "Apr 12, 2026"][i] ?? "Apr 01, 2026",
    title: wo.title, detail: `${wo.owner} · ${wo.stage} · ${wo.area}`,
    status: wo.stage === "Completed" ? "Met" : wo.sla, cost: ["Rs 8,500", "Rs 2,400", "Rs 0", "Rs 14,200"][i] ?? "Rs 0",
  }));
  return [
    ...fromOrders,
    { date: "Mar 31, 2026", title: "Preventive maintenance completed", detail: "Checklist signed by supervisor with QR scan validation.", status: "Met", cost: "Rs 0" },
    { date: "Feb 26, 2026", title: "Condition monitoring review", detail: `Health trend reviewed for ${asset.category}; no shutdown required.`, status: "On track", cost: "Rs 0" },
    { date: "Jan 18, 2026", title: "Vendor service visit", detail: `${asset.amc} completed routine inspection and handover notes.`, status: "Met", cost: "Rs 5,800" },
  ];
}

export default function EquipmentDetail({ assetId }: { assetId: string }) {
  const { equipmentAssets, activeRole } = useStore();
  const router = useRouter();
  const asset = equipmentAssets.find((a) => a.id === assetId);

  if (!asset) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="text-slate-500">Asset not found: <span className="font-mono">{assetId}</span></p>
        <button className="btn" onClick={() => router.push("/equipment")}>Back to Registry</button>
      </div>
    );
  }

  const linked = workOrdersSeed.filter(
    (wo) => wo.asset === asset.id || wo.area === asset.location || wo.title.toLowerCase().includes(asset.name.toLowerCase().split(" ")[0])
  );
  const history = getHistory(asset, linked);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button className="btn" onClick={() => router.push("/equipment")}>
          <ChevronLeft size={16} /> Equipment Registry
        </button>
        <div className="flex gap-2">
          {activeRole.canManageEquipment && (
            <button className="btn" onClick={() => router.push(`/equipment/${asset.id}/edit`)}>
              <Pencil size={15} /> Edit Asset
            </button>
          )}
          <button className="btn"><Download size={15} /> Export Asset File</button>
        </div>
      </div>

      {/* Hero */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-3">
            <p className="eyebrow">{asset.category} asset</p>
            <h2 className="text-2xl font-bold text-slate-900">{asset.name}</h2>
            <p className="text-sm text-slate-500">
              <span className="font-mono">{asset.id}</span> · {asset.location} · {asset.criticality ?? "Medium"} criticality
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <StatusPill text={asset.status ?? "Healthy"} />
              <StatusPill text={asset.warranty ?? "Active"} />
              <StatusPill text={asset.health >= 85 ? "On track" : "At risk"} />
            </div>
          </div>
          <AssetQr asset={asset} size={160} />
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailBox label="Manufacturer" value={asset.manufacturer ?? "—"} />
        <DetailBox label="Model" value={asset.model ?? "—"} />
        <DetailBox label="Serial Number" value={asset.serialNumber ?? "—"} />
        <DetailBox label="Responsible Owner" value={asset.owner ?? "Duty Engineer"} />
        <DetailBox label="Warranty Expiry" value={asset.warrantyExpiry ?? "—"} />
        <DetailBox label="AMC Vendor" value={asset.amc ?? "—"} />
        <DetailBox label="AMC Expiry" value={asset.amcExpiry ?? "—"} />
        <DetailBox label="Next Service" value={asset.nextService ?? "—"} />
      </div>

      {/* Health & AMC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <PanelHeader icon={Activity} title="Asset Health" action={`${asset.health}%`} />
          <div className="space-y-3">
            <Meter value={asset.health} />
            <div className="grid grid-cols-2 gap-3">
              <DetailBox label="Uptime" value={`${asset.uptime ?? 98.2}%`} />
              <DetailBox label="Open Work Orders" value={linked.filter((wo) => wo.stage !== "Completed").length} />
            </div>
            <Risk
              label="Health score is calculated from downtime, PM compliance, open issues, and service age."
              type={asset.health >= 85 ? "On track" : "High"}
            />
          </div>
        </div>
        <div className="card p-5">
          <PanelHeader icon={CalendarClock} title="Warranty & AMC" action="Commercial view" />
          <div className="space-y-1">
            <Risk label={`Warranty status: ${asset.warranty ?? "Active"}`} type={asset.warranty === "Expired" ? "High" : "On track"} />
            <Risk label={`AMC vendor: ${asset.amc ?? "Not assigned"}`} type={asset.amc ? "On track" : "Medium"} />
            <Risk label={`Next planned service: ${asset.nextService ?? "Not scheduled"}`} type="Medium" />
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="card p-5">
        <PanelHeader icon={History} title="Maintenance History" action={`${history.length} events`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="table-head-cell">Date</th>
                <th className="table-head-cell">Event</th>
                <th className="table-head-cell">Status</th>
                <th className="table-head-cell">Cost</th>
              </tr>
            </thead>
            <tbody>
              {history.map((ev) => (
                <tr key={`${ev.date}-${ev.title}`} className="border-b border-slate-100 last:border-0">
                  <td className="table-cell text-slate-700 font-bold text-xs whitespace-nowrap">{ev.date}</td>
                  <td className="table-cell">
                    <p className="font-semibold text-slate-800 text-sm">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.detail}</p>
                  </td>
                  <td className="table-cell"><StatusPill text={ev.status} /></td>
                  <td className="table-cell font-semibold text-slate-700 text-sm">{ev.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Work Orders */}
      <div className="card p-5">
        <PanelHeader icon={ListChecks} title="Linked Work Orders" action={`${linked.length} records`} />
        {linked.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-head-cell">WO</th>
                  <th className="table-head-cell">Task</th>
                  <th className="table-head-cell">Priority</th>
                  <th className="table-head-cell">Owner</th>
                  <th className="table-head-cell">Stage</th>
                  <th className="table-head-cell">SLA</th>
                </tr>
              </thead>
              <tbody>
                {linked.map((wo) => (
                  <tr key={wo.id} className="border-b border-slate-100 last:border-0">
                    <td className="table-cell font-semibold font-mono text-slate-900">{wo.id}</td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-800">{wo.title}</p>
                      <p className="text-xs text-slate-400">{wo.department} · {wo.source}</p>
                    </td>
                    <td className="table-cell"><StatusPill text={wo.priority} /></td>
                    <td className="table-cell text-slate-600 text-sm">{wo.owner}</td>
                    <td className="table-cell"><StatusPill text={wo.stage} /></td>
                    <td className="table-cell"><StatusPill text={wo.sla} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4">No linked work orders for this asset yet.</p>
        )}
      </div>
    </div>
  );
}
