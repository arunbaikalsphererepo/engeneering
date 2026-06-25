import type { LucideIcon } from "lucide-react";

interface PanelHeaderProps {
  icon: LucideIcon;
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function PanelHeader({ icon: Icon, title, action, onAction }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-slate-600" />
        </div>
        <h2 className="text-[13px] font-semibold text-slate-800">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          {action}
        </button>
      )}
    </div>
  );
}
