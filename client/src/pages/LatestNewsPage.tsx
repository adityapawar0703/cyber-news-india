import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Flame, Newspaper, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { ALL_CATEGORY_NAMES } from '../lib/categories';
import type { Article, PaginationMeta } from '../types';
import { ArticleCard } from '../components/article/ArticleCard';
import { ArticleGridSkeleton } from '../components/common/Skeletons';
import { Pagination } from '../components/common/Pagination';

export function LatestNewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const category = searchParams.get('category') || 'All';
  const breakingOnly = searchParams.get('breaking') === 'true';

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Latest Cybersecurity & Tech News | Cyber India News';
    setLoading(true);
    setError(null);

    api
      .getArticles({
        page,
        limit: 9,
        sort,
        category: category === 'All' ? undefined : category,
        breaking: breakingOnly || undefined,
      })
      .then((res) => {
        setArticles(res.articles);
        setPagination(res.pagination);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load latest articles.')
      )
      .finally(() => setLoading(false));
  }, [page, sort, category, breakingOnly]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="pb-16">
      <section className="border-b border-slate-800/80 bg-[#080C14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sky-400">
                <Newspaper className="h-3.5 w-3.5" />
                Live Editorial Wire
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Latest News & Dispatches
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Real-time coverage of vulnerabilities, threat intelligence, and technology engineering.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => updateParams({ sort: 'latest', breaking: null })}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  sort === 'latest' && !breakingOnly
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                    : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Newspaper className="h-3.5 w-3.5" />
                Latest
              </button>
              <button
                type="button"
                onClick={() => updateParams({ sort: 'popular', breaking: null })}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  sort === 'popular' && !breakingOnly
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                    : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </button>
              <button
                type="button"
                onClick={() =>
                  updateParams({ breaking: breakingOnly ? null : 'true' })
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  breakingOnly
                    ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                    : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Breaking Only
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
            {['All', ...ALL_CATEGORY_NAMES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateParams({ category: cat === 'All' ? null : cat })}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  category === cat
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                    : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <ArticleGridSkeleton count={9} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-10 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-400 mb-2" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0D121D] p-14 text-center">
            <h2 className="font-display text-lg font-bold text-white">No articles match these filters</h2>
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} variant="standard" />
              ))}
            </div>
            {pagination && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(next) => updateParams({ page: String(next) })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
