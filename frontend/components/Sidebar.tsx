"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wrench, ListChecks, ShieldCheck,
  Banknote, Settings2, HardHat, MessageSquare,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { navItems } from "@/lib/data";

const NAVBAR_H = 47;
const W_OPEN   = 260;
const W_CLOSED = 52;

const iconMap: Record<string, React.ElementType> = {
  dashboard:   LayoutDashboard,
  equipment:   HardHat,
  maintenance: Wrench,
  workflow:    ListChecks,
  approvals:   ShieldCheck,
  insights:    Banknote,
  settings:    Settings2,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ── Floating collapse button ──────────────────────────────────────────────────
function CollapseBtn({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onToggle}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute",
        right: -14,
        top: NAVBAR_H + 24,
        zIndex: 100,
        width: 28, height: 28,
        borderRadius: "50%",
        border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        background: hov ? "#0E131C" : "#ffffff",
        color: hov ? "#ffffff" : "#8E99AB",
        boxShadow: hov
          ? "0 2px 12px rgba(14,19,28,0.22), 0 0 0 3px rgba(14,19,28,0.08)"
          : "0 1px 4px rgba(14,19,28,0.14), 0 0 0 1.5px rgba(220,227,236,0.9)",
        transition: "background 150ms, color 150ms, box-shadow 150ms, transform 150ms",
        transform: hov ? "scale(1.12)" : "scale(1)",
      }}
    >
      <svg
        width={11} height={11}
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
        style={{
          transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 280ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavBtn({
  href, label, active, collapsed, icon, index,
}: {
  href: string; label: string;
  active: boolean; collapsed: boolean; icon: React.ReactNode; index: number;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      className="sb-item-enter"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link
        href={href}
        title={collapsed ? label : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 8,
          padding: collapsed ? "8px 0" : "6px 9px",
          borderRadius: 7,
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          whiteSpace: "nowrap",
          background: active
            ? "rgba(255,255,255,0.95)"
            : hov
            ? "rgba(255,255,255,0.6)"
            : "transparent",
          boxShadow: active
            ? "0 1px 6px rgba(14,19,28,0.09), 0 0 0 1px rgba(14,19,28,0.06)"
            : "none",
          transition: "background 150ms ease, box-shadow 150ms ease",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Active accent bar */}
        {active && !collapsed && (
          <span style={{
            position: "absolute", left: 0,
            top: "50%", transform: "translateY(-50%)",
            width: 3, height: "58%",
            borderRadius: "0 2px 2px 0",
            background: "var(--accent)",
            boxShadow: "0 0 6px rgba(14,19,28,0.25)",
          }} />
        )}
        {active && collapsed && (
          <span style={{
            position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)",
            width: 3, height: 16, borderRadius: 2,
            background: "var(--accent)",
          }} />
        )}

        {/* Icon */}
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          color: active ? "var(--accent)" : hov ? "var(--fg-2)" : "var(--fg-3)",
          flexShrink: 0,
          transition: "color 150ms ease",
        }}>
          {icon}
        </span>

        {/* Label */}
        {!collapsed && (
          <span style={{
            flex: 1,
            fontSize: 13,
            fontWeight: active ? 600 : 450,
            color: active ? "var(--fg-1)" : hov ? "var(--fg-1)" : "var(--fg-2)",
            transition: "color 150ms ease",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {label}
          </span>
        )}
      </Link>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname    = usePathname();
  const { activeRole } = useStore();
  const [msgHov, setMsgHov] = useState(false);
  const [expandKey, setExpandKey] = useState(0);
  const prevCollapsed = useRef(collapsed);

  useEffect(() => {
    if (prevCollapsed.current && !collapsed) setExpandKey(k => k + 1);
    prevCollapsed.current = collapsed;
  }, [collapsed]);

  const visibleNav = navItems.filter(item => activeRole.nav.includes(item.id));

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/" || pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        position: "fixed", left: 0, top: 0, zIndex: 40,
        height: "100vh",
        width: collapsed ? W_CLOSED : W_OPEN,
        flexShrink: 0,
        borderRight: "1px solid rgba(220,227,236,0.9)",
        background: "linear-gradient(168deg, #f5f7fa 0%, #eef1f6 100%)",
        display: "flex", flexDirection: "column",
        overflow: "visible",
        transition: "width 300ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <CollapseBtn collapsed={collapsed} onToggle={onToggle} />

      {/* Scrollable content */}
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: "auto", overflowX: "hidden",
        display: "flex", flexDirection: "column",
        paddingTop: NAVBAR_H + 6,
      }}>

        {/* Profile strip */}
        <div style={{
          padding: collapsed ? "6px 0 8px" : "0 10px 10px 10px",
          flexShrink: 0,
          borderBottom: "1px solid var(--border-1)",
          marginBottom: 8,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          {!collapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "white",
                border: "2px solid var(--border-1)",
              }}>
                {activeRole.label.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeRole.label}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 1 }}>
                  Hotel Engineering
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "white",
              border: "2px solid var(--border-1)",
            }}>
              {activeRole.label.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Section label */}
        {!collapsed && (
          <div style={{
            padding: "0 12px 2px 12px",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.20em",
            textTransform: "uppercase", color: "var(--fg-4)", flexShrink: 0,
          }}>
            Menu
          </div>
        )}

        {/* Nav items */}
        <div
          key={expandKey}
          style={{
            padding: collapsed ? "2px 6px" : "0 7px",
            display: "flex", flexDirection: "column", gap: 1,
            flexShrink: 0,
          }}
        >
          {visibleNav.map((item, i) => {
            const Icon = iconMap[item.id] ?? LayoutDashboard;
            return (
              <NavBtn
                key={item.id}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                collapsed={collapsed}
                icon={<Icon size={15} style={{ flexShrink: 0 }} />}
                index={i}
              />
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 8 }} />

        {/* Help */}
        <div style={{ padding: collapsed ? "4px 6px 0" : "4px 7px 0", flexShrink: 0 }}>
          {!collapsed ? (
            <button
              style={{
                width: "100%", padding: "5.5px 9px",
                borderRadius: 7, border: "none",
                background: msgHov ? "rgba(255,255,255,0.55)" : "transparent",
                color: msgHov ? "var(--fg-2)" : "var(--fg-3)",
                fontSize: 12.5, fontWeight: 450,
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", transition: "background 150ms, color 150ms",
                textAlign: "left",
              }}
              onMouseEnter={() => setMsgHov(true)}
              onMouseLeave={() => setMsgHov(false)}
            >
              <span style={{ flexShrink: 0, color: "var(--fg-4)", display: "flex" }}>
                <MessageSquare size={14} />
              </span>
              Help &amp; Support
            </button>
          ) : (
            <button
              title="Help & Support"
              style={{
                width: "100%", padding: "8px 0",
                border: "none", background: msgHov ? "rgba(255,255,255,0.55)" : "transparent",
                color: "var(--fg-4)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 7, transition: "background 150ms",
              }}
              onMouseEnter={() => setMsgHov(true)}
              onMouseLeave={() => setMsgHov(false)}
            >
              <MessageSquare size={14} />
            </button>
          )}
        </div>

        {/* Platform card */}
        {!collapsed && (
          <div style={{ padding: "4px 7px 12px", flexShrink: 0 }}>
            <div style={{
              background: "linear-gradient(135deg, #0E131C 0%, #1a3a5c 100%)",
              borderRadius: 9, padding: "10px 12px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -16, right: -16, width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
              <div style={{ fontWeight: 800, fontSize: 12.5, color: "white", letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 2 }}>
                Data<span style={{ color: "var(--brand-gold)" }}>Sturdy</span>
              </div>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginBottom: 7 }}>
                Engineering Operations
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>v1.0.0 · All systems go</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed wordmark */}
      {collapsed && (
        <div style={{
          flexShrink: 0, borderTop: "1px solid rgba(220,227,236,0.9)",
          padding: "10px 0", display: "flex", justifyContent: "center",
        }}>
          <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "-0.02em", color: "var(--fg-2)" }}>
            D<span style={{ color: "var(--brand-gold)" }}>S</span>
          </span>
        </div>
      )}
    </aside>
  );
}
