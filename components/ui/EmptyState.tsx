export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-[13px] text-slate-500 max-w-xs mx-auto">{message}</p>
    </div>
  );
}
