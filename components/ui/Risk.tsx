import StatusPill from "./StatusPill";

export default function Risk({ label, type }: { label: string; type: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <StatusPill text={type} size="xs" />
      <span className="text-[13px] text-slate-600 leading-snug">{label}</span>
    </div>
  );
}
