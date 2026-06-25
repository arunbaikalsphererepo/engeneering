"use client";

import { useState } from "react";
import { Zap, Wrench } from "lucide-react";
import ExpenditureSectionPage from "./ExpenditureSectionPage";

const TABS = [
  {
    id: "utility" as const,
    label: "Utility",
    description: "Electricity · Water · Diesel · Fuels",
    icon: Zap,
    barColor: "#0ea5e9",
  },
  {
    id: "repair" as const,
    label: "Repair & Maintenance",
    description: "Contractors · Equipment · Services",
    icon: Wrench,
    barColor: "#10b981",
  },
];

export default function Expenditure() {
  const [activeTab, setActiveTab] = useState<"utility" | "repair">("utility");
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-0">
      {/* Tab navigation */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                activeTab === id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Section content */}
      <ExpenditureSectionPage
        key={activeTab}
        type={tab.id}
        title={tab.label}
        barColor={tab.barColor}
      />
    </div>
  );
}
