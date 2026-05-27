"use client";

import { Search, Filter, Bell, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/data";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface TopBarProps {
  title: string;
  eyebrow?: string;
}

export default function TopBar({ title, eyebrow = "Engineering Operations" }: TopBarProps) {
  const { roleId, activeRole, setRoleId } = useStore();
  const router = useRouter();

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Role selector */}
      <div className="min-w-0 flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Role</span>
          <select
            value={roleId}
            onChange={(e) => {
              const role = roleProfiles.find((r) => r.id === e.target.value);
              setRoleId(e.target.value);
              if (role) router.push(`/${role.defaultPage === "dashboard" ? "dashboard" : role.defaultPage}`);
            }}
            className="border-0 outline-none bg-transparent text-slate-700 text-sm font-medium max-w-[200px] cursor-pointer"
          >
            {roleProfiles.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* (role selector removed from right) */}

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 w-64">
          <Search size={15} className="flex-shrink-0" />
          <input
            placeholder="Search assets, work orders…"
            className="border-0 outline-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 min-w-0 w-full"
          />
        </div>

        <button className={clsx("btn btn-icon", "text-slate-500")} aria-label="Filters">
          <Filter size={16} />
        </button>

        <button className={clsx("btn btn-icon", "text-slate-500 relative")} aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

      </div>
    </header>
  );
}
