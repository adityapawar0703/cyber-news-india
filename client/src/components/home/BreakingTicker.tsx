import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Radio } from 'lucide-react';
import type { Article } from '../../types';
import { formatRelativeTime } from '../../lib/utils';

export function BreakingTicker({ articles }: { articles: Article[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(id);
  }, [articles.length]);

  if (!articles.length) return null;
  const current = articles[activeIdx] || articles[0];

  return (
    <div className="border-b border-slate-800/80 bg-[#0A101C]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-rose-500/35 bg-rose-500/12 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-rose-300">
            <Radio className="h-3 w-3 animate-pulse" />
            Breaking
          </span>
          {current.cveId && (
            <span className="hidden sm:inline-flex shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-amber-300">
              {current.cveId}
            </span>
          )}
          <Link
            to={`/article/${current.slug}`}
            className="truncate text-xs sm:text-sm font-medium text-slate-200 hover:text-sky-300 transition"
          >
            {current.title}
          </Link>
        </div>

        <div className="hidden md:flex shrink-0 items-center gap-3">
          <span className="font-mono text-[11px] text-slate-500">
            {formatRelativeTime(current.publishedAt)}
          </span>
          {articles.length > 1 && (
            <div className="flex items-center gap-1">
              {articles.slice(0, 4).map((a, idx) => (
                <button
                  key={a._id}
                  type="button"
                  aria-label={`Show alert ${idx + 1}`}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIdx ? 'w-4 bg-sky-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
          <Link
            to="/latest"
            className="inline-flex items-center gap-0.5 font-mono text-[11px] text-sky-400 hover:text-sky-300"
          >
            Wire
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
