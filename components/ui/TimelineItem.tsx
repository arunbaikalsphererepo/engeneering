export default function TimelineItem({ date, title, detail }: { date: string; title: string; detail: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex flex-col items-center flex-shrink-0 w-14">
        <time className="text-[11px] font-bold text-slate-900 leading-snug">{date}</time>
        <div className="mt-1.5 w-px flex-1 bg-slate-100" />
      </div>
      <div className="min-w-0 pb-1">
        <p className="text-[13px] font-semibold text-slate-800 leading-snug">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
