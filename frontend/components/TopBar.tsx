"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Search, Bell, X, ChevronDown } from "lucide-react";

const NOTIFICATIONS = [
  "Critical asset requires immediate inspection",
  "2 maintenance approvals pending",
  "Monthly equipment audit due tomorrow",
];

function IconBtn({
  children, title, onClick,
}: {
  children: React.ReactNode; title: string; onClick?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34, height: 34, borderRadius: 8, border: "none",
        background: hov ? "var(--accent-soft)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--fg-3)", cursor: "pointer", transition: "background 120ms",
      }}
    >
      {children}
    </button>
  );
}

interface TopBarProps {
  sidebarWidth?: number;
}

export default function TopBar({ sidebarWidth = 260 }: TopBarProps) {
  const { roleId, activeRole, setRoleId } = useStore();
  const router = useRouter();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = activeRole.label
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header style={{
      position: "fixed", left: 0, right: 0, top: 0, zIndex: 50,
      height: 47,
      background: "white",
      borderBottom: "1px solid var(--border-1)",
      boxShadow: "0 1px 0 rgba(14,19,28,0.04), 0 2px 8px rgba(14,19,28,0.04)",
      display: "flex", alignItems: "center",
      paddingRight: 16,
    }}>
      {/* Brand — fixed width tracks sidebar */}
      <div style={{
        width: sidebarWidth,
        flexShrink: 0,
        display: "flex", alignItems: "center",
        paddingLeft: 18,
        transition: "width 300ms cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        <span style={{
          fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em",
          userSelect: "none", whiteSpace: "nowrap", lineHeight: 1,
          color: "var(--fg-1)",
        }}>
          Data<span style={{ color: "var(--brand-gold)" }}>Sturdy</span>
        </span>
      </div>

      {/* Right section */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>

        {/* Search */}
        <IconBtn title="Search">
          <Search size={16} />
        </IconBtn>

        {/* Bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <IconBtn title="Notifications" onClick={() => setNotifOpen(v => !v)}>
              <Bell size={16} />
            </IconBtn>
            <span style={{
              position: "absolute", top: 8, right: 8,
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--error-500)",
              border: "2px solid white", pointerEvents: "none",
            }} />
          </div>

          {notifOpen && (
            <div className="pop-in" style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 272, background: "white", borderRadius: 10,
              border: "1px solid var(--border-1)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
              overflow: "hidden", zIndex: 200,
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderBottom: "1px solid var(--border-1)",
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-4)" }}>
                  Notifications
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-4)", display: "flex", padding: 2 }}
                >
                  <X size={14} />
                </button>
              </div>
              {NOTIFICATIONS.map(item => (
                <div
                  key={item}
                  style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-1)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-soft)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <p style={{ fontSize: 13, color: "var(--fg-1)", margin: 0 }}>{item}</p>
                  <p style={{ fontSize: 11, color: "var(--fg-4)", margin: "2px 0 0" }}>Just now</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: "var(--border-1)", margin: "0 6px" }} />

        {/* Avatar / Role selector */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            title={activeRole.label}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 32, paddingLeft: 4, paddingRight: 8,
              borderRadius: 8, border: "none",
              background: profileOpen ? "var(--accent-soft)" : "transparent",
              cursor: "pointer", transition: "background 120ms",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", border: "none", padding: 0,
              background: "var(--accent)", color: "white", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              outline: profileOpen ? "2px solid var(--brand-gold)" : "2px solid transparent",
              outlineOffset: 2, transition: "outline-color 150ms",
            }}>
              {initials}
            </div>
            <ChevronDown size={12} style={{ color: "var(--fg-4)" }} />
          </button>

          {profileOpen && (
            <div className="pop-in" style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
              background: "white", borderRadius: 12, border: "1px solid var(--border-1)",
              boxShadow: "0 8px 32px rgba(14,19,28,0.14)", width: 200, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-1)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-1)", marginBottom: 4 }}>
                  Switch Role
                </div>
              </div>
              <div style={{ padding: "6px" }}>
                {roleProfiles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRoleId(r.id);
                      setProfileOpen(false);
                      router.push(`/${r.defaultPage === "dashboard" ? "dashboard" : r.defaultPage}`);
                    }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", borderRadius: 8, border: "none",
                      background: roleId === r.id ? "var(--accent-soft)" : "transparent",
                      color: roleId === r.id ? "var(--fg-1)" : "var(--fg-2)",
                      fontSize: 13, fontWeight: roleId === r.id ? 600 : 400,
                      cursor: "pointer", textAlign: "left",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={e => { if (roleId !== r.id) e.currentTarget.style.background = "var(--accent-soft)"; }}
                    onMouseLeave={e => { if (roleId !== r.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: roleId === r.id ? "var(--accent)" : "var(--border-1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                      color: roleId === r.id ? "white" : "var(--fg-3)",
                      flexShrink: 0,
                    }}>
                      {r.label.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
