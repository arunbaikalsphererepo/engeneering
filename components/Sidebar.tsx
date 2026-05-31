"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wrench, ListChecks, ShieldCheck,
  Banknote, Settings2, HardHat, ChevronLeft, ChevronRight, LifeBuoy,
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
        "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex-shrink-0",
        collapsed ? "w-[68px]" : "w-[256px]"
      )}
    >
      {/* Brand */}
      <div
        className={clsx(
          "flex items-center min-h-[60px] border-b border-slate-100",
          collapsed ? "justify-center px-0" : "px-5 gap-3"
        )}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={15} className="text-white" />
          </div>
        ) : (
          <Wordmark size={17} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-thin">
        <div className="space-y-0.5">
          {visibleNav.map((item) => {
            const Icon = iconMap[item.id] ?? LayoutDashboard;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  "flex items-center rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-150",
                  collapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100">
        {!collapsed && (
          <div className="px-2.5 pt-3 pb-1">
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <LifeBuoy size={14} className="text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">24/7 Escalation</p>
                <p className="text-[11px] text-slate-400 truncate">Critical assets monitored</p>
              </div>
            </div>
          </div>
        )}
        <div className="px-2.5 py-3">
          <button
            onClick={onToggle}
            className={clsx(
              "w-full flex items-center rounded-xl px-2.5 py-2.5 text-[13px] font-medium text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
          </button>
        </div>
      </div>
    </aside>
  );
}
