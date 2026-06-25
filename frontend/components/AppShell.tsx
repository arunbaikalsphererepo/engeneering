"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const NAVBAR_H = 47;
const W_OPEN   = 260;
const W_CLOSED = 52;

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  fluid?: boolean;
}

export default function AppShell({ children, fluid }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sideW = collapsed ? W_CLOSED : W_OPEN;

  return (
    <div className="h-screen overflow-hidden" style={{ background: "var(--bg-page)" }}>
      {/* Fixed topbar — full width, z-50 */}
      <TopBar sidebarWidth={sideW} />

      {/* Fixed sidebar — starts from top, sits under topbar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main content — offset by sidebar width and navbar height */}
      <div
        className="flex flex-col min-w-0"
        style={{
          marginLeft: sideW,
          marginTop: NAVBAR_H,
          height: `calc(100vh - ${NAVBAR_H}px)`,
          transition: "margin-left 300ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {fluid ? (
          <main className="flex flex-1 min-h-0 overflow-hidden w-full">
            {children}
          </main>
        ) : (
          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin w-full">
            <div className="p-5 animate-in">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
