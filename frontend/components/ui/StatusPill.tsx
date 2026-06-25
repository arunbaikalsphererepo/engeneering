import clsx from "clsx";

const pillStyles: Record<string, string> = {
  critical:             "bg-red-50 text-red-600 border-red-100",
  high:                 "bg-orange-50 text-orange-600 border-orange-100",
  "at-risk":            "bg-red-50 text-red-600 border-red-100",
  attention:            "bg-orange-50 text-orange-600 border-orange-100",
  medium:               "bg-amber-50 text-amber-700 border-amber-100",
  "due-soon":           "bg-amber-50 text-amber-700 border-amber-100",
  waiting:              "bg-slate-100 text-slate-500 border-slate-200",
  "awaiting-gm":        "bg-slate-100 text-slate-600 border-slate-200",
  "finance-review":     "bg-slate-100 text-slate-600 border-slate-200",
  "awaiting-finance":   "bg-slate-100 text-slate-600 border-slate-200",
  "supervisor-review":  "bg-slate-100 text-slate-600 border-slate-200",
  "material-check":     "bg-slate-100 text-slate-600 border-slate-200",
  healthy:              "bg-emerald-50 text-emerald-700 border-emerald-100",
  active:               "bg-slate-900 text-white border-slate-900",
  approved:             "bg-emerald-50 text-emerald-700 border-emerald-100",
  "on-track":           "bg-emerald-50 text-emerald-700 border-emerald-100",
  "on track":           "bg-emerald-50 text-emerald-700 border-emerald-100",
  met:                  "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed:            "bg-slate-100 text-slate-700 border-slate-200",
  scheduled:            "bg-slate-100 text-slate-700 border-slate-200",
  "vendor-scheduled":   "bg-slate-100 text-slate-600 border-slate-200",
  "in-progress":        "bg-slate-900 text-white border-slate-900",
  "in progress":        "bg-slate-900 text-white border-slate-900",
  assigned:             "bg-slate-100 text-slate-700 border-slate-200",
  requested:            "bg-slate-100 text-slate-600 border-slate-200",
  review:               "bg-slate-100 text-slate-600 border-slate-200",
  "pending-approval":   "bg-slate-100 text-slate-600 border-slate-200",
  expired:              "bg-red-50 text-red-500 border-red-100",
  draft:                "bg-slate-100 text-slate-500 border-slate-200",
  rejected:             "bg-red-50 text-red-600 border-red-100",
  low:                  "bg-slate-100 text-slate-500 border-slate-200",
};

export default function StatusPill({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
  const key = text.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-");
  const style = pillStyles[key] ?? pillStyles[text.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        style
      )}
    >
      {text}
    </span>
  );
}
