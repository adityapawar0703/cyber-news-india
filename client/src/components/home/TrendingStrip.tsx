import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import type { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

interface TrendingStripProps {
  breaking: Article[];
  excludeId?: string;
}

export function TrendingStrip({ breaking, excludeId }: TrendingStripProps) {
  const stories = breaking.filter((a) => a._id !== excludeId).slice(0, 4);
  if (!stories.length) return null;

  return (
    <section className="border-b border-slate-800/80 bg-[#0A0F1A]/80 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">
              <Flame className="h-3.5 w-3.5" />
              Breaking & High-Priority Alerts
            </div>
            <h2 className="mt-1.5 font-display text-2xl sm:text-[1.7rem] font-bold tracking-tight text-white">
              Developing Threat Intelligence
            </h2>
          </div>
          <Link
            to="/latest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition"
          >
            All Dispatches
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stories.map((article) => (
            <ArticleCard key={article._id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
}
