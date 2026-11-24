import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import type { Article } from '../../types';
import { ArticleCard } from '../article/ArticleCard';

const FILTER_TABS = [
  'All',
  'Cybersecurity',
  'Vulnerabilities & CVEs',
  'Data Breaches',
  'Ethical Hacking',
  'Artificial Intelligence',
  'Technology News',
];

export function LatestArticlesGrid({ articles }: { articles: Article[] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return articles.slice(0, 9);
    return articles.filter((a) => a.category === selectedCategory).slice(0, 6);
  }, [articles, selectedCategory]);

  return (
    <section className="py-14 border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
              <Newspaper className="h-3.5 w-3.5" />
              Newsroom Feed
            </div>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Latest Articles
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const active = selectedCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {tab === 'Vulnerabilities & CVEs'
                    ? 'Vulnerabilities'
                    : tab === 'Artificial Intelligence'
                    ? 'AI'
                    : tab === 'Technology News'
                    ? 'Technology'
                    : tab}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0D121D] p-10 text-center text-sm text-slate-400">
            No recent stories in this filter yet. Try viewing the full category archive.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <ArticleCard key={article._id} article={article} variant="standard" />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/latest"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#0D121D] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-500/50 hover:text-sky-300"
          >
            Explore Full Newsroom Archive
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
