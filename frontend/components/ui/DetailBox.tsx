export default function DetailBox({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="card p-3.5 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 leading-snug break-words">{value ?? "—"}</p>
    </div>
  );
}
