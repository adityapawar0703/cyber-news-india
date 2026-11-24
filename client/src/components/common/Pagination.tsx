import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 pt-8"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="h-8 min-w-8 rounded-lg border border-slate-800 bg-[#0D121D] px-2.5 text-xs font-mono text-slate-300 hover:border-slate-700 hover:text-white"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-slate-600">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-8 min-w-8 rounded-lg border px-2.5 text-xs font-mono font-medium transition ${
            p === page
              ? 'border-sky-500/60 bg-sky-500/15 text-sky-300'
              : 'border-slate-800 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-600">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="h-8 min-w-8 rounded-lg border border-slate-800 bg-[#0D121D] px-2.5 text-xs font-mono text-slate-300 hover:border-slate-700 hover:text-white"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
