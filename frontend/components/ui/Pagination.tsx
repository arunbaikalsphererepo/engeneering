interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  shownCount: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

export default function Pagination({ currentPage, totalPages, pageSize, totalItems, shownCount, onPage, onPageSize }: PaginationProps) {
  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, shownCount > 0 ? shownCount : totalItems);
  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 flex-wrap">
      <p className="text-xs text-slate-500">Showing {start}–{end} of {shownCount}</p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="border border-slate-200 rounded-lg h-8 px-2 text-xs bg-white text-slate-700"
          >
            {[5, 10, 20].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500 px-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => onPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="btn btn-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
