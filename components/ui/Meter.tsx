import clsx from "clsx";

export default function Meter({ value, className }: { value: number; className?: string }) {
  const fill = value >= 85 ? "bg-slate-900" : value >= 60 ? "bg-slate-600" : "bg-slate-300";
  return (
    <span className={clsx("block h-1.5 w-full rounded-full bg-slate-100 overflow-hidden", className)}>
      <span
        className={clsx("block h-full rounded-full transition-all duration-300", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </span>
  );
}
