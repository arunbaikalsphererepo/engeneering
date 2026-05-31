"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/data";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  eyebrow?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { roleId, activeRole, setRoleId } = useStore();
  const router = useRouter();

  const initials = activeRole.label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Page title */}
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-slate-900 truncate leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Engineering Operations</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-xl border border-slate-200 bg-slate-50 w-52 focus-within:bg-white focus-within:border-slate-300 transition-all">
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <input
            placeholder="Search…"
            className="border-0 outline-none bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 min-w-0 w-full"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 ring-2 ring-white" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Role selector */}
        <div className="hidden lg:flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white">{initials}</span>
          </div>
          <select
            value={roleId}
            onChange={(e) => {
              const role = roleProfiles.find((r) => r.id === e.target.value);
              setRoleId(e.target.value);
              if (role) router.push(`/${role.defaultPage === "dashboard" ? "dashboard" : role.defaultPage}`);
            }}
            className="border-0 outline-none bg-transparent text-slate-700 text-[13px] font-medium cursor-pointer max-w-[160px] appearance-none"
          >
            {roleProfiles.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <ChevronDown size={11} className="text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </header>
  );
}
