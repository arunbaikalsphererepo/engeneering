"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}

export default function AppShell({ children, title, eyebrow }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f5]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} eyebrow={eyebrow} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5 max-w-[1600px] mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
