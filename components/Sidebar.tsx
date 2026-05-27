"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge, LayoutDashboard, Wrench, ListChecks, ShieldCheck,
  Banknote, FileBarChart, Settings2, LifeBuoy, ChevronLeft,
  ChevronRight, HardHat,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { useStore } from "@/lib/store";
import { navItems } from "@/lib/data";
import clsx from "clsx";

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  equipment: HardHat,
  maintenance: Wrench,
  workflow: ListChecks,
  approvals: ShieldCheck,
  insights: Banknote,
  reports: FileBarChart,
  settings: Settings2,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { activeRole } = useStore();

  const visibleNav = navItems.filter((item) => activeRole.nav.includes(item.id));

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/" || pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        "flex flex-col bg-white border-r border-slate-100 h-full transition-all duration-200 ease-in-out flex-shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className={clsx("flex items-center gap-3 px-4 py-5 border-b border-slate-100 min-h-[72px]", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Gauge size={18} className="text-black" />
          </div>
        ) : (
          <div className="min-w-0">
            <Wordmark size={18} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = iconMap[item.id] ?? LayoutDashboard;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-slate-50 text-black border border-slate-100"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                )}
              >
                <Icon size={18} className="flex-shrink-0 text-black" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2 border-t border-slate-100">
        <button
          onClick={onToggle}
          className={clsx(
            "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors duration-150",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {collapsed ? <ChevronRight size={18} className="text-black" /> : <><ChevronLeft size={18} className="text-black" /><span>Collapse</span></>}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-navy-800">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5">
            <LifeBuoy size={16} className="text-black flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black truncate">24/7 Escalation</p>
              <p className="text-xs text-slate-500 truncate">Critical assets monitored</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
