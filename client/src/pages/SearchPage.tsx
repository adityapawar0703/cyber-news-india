import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { ALL_CATEGORY_NAMES } from '../lib/categories';
import type { Article, PaginationMeta } from '../types';
import { ArticleCard } from '../components/article/ArticleCard';
import { ArticleGridSkeleton } from '../components/common/Skeletons';
import { Pagination } from '../components/common/Pagination';

const SUGGESTED_QUERIES = [
  'CVE-2026-21409',
  'Zero-Day',
  'Ransomware',
  'Rust',
  'Kubernetes',
  'Prompt Injection',
  'Active Directory',
  'Post-Quantum',
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [inputValue, setInputValue] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    document.title = initialQuery ? `Search: ${initialQuery} | Cyber India News` : 'Search Archive | Cyber India News';
    setLoading(true);
    setError(null);

    api
      .getArticles({
        search: initialQuery,
        category: category === 'All' ? undefined : category,
        sort,
        page,
        limit: 9,
      })
      .then((res) => {
        setArticles(res.articles);
        setPagination(res.pagination);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Search request failed.')
      )
      .finally(() => setLoading(false));
  }, [initialQuery, category, sort, page]);

  const applyParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyParams({ q: inputValue.trim() || null });
  };

  return (
    <div className="pb-16">
      <section className="border-b border-slate-800/80 bg-[#080C14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-sky-400">
            Intelligence Archive
          </span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Search Reporting & Advisories
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            <div className="md:col-span-6 relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by headline, CVE ID, threat group, or technology..."
                className="w-full rounded-xl border border-slate-700/80 bg-[#0D121D] pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    applyParams({ q: null });
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) =>
                  applyParams({ category: e.target.value === 'All' ? null : e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/80 bg-[#0D121D] px-3.5 py-3 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {ALL_CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                aria-label="Sort results"
                value={sort}
                onChange={(e) => applyParams({ sort: e.target.value })}
                className="w-full rounded-xl border border-slate-700/80 bg-[#0D121D] px-3.5 py-3 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="latest">Newest</option>
                <option value="popular">Most Read</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 cursor-pointer"
              >
                Go
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500">Popular searches:</span>
            {SUGGESTED_QUERIES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => applyParams({ q: term })}
                className="rounded-md border border-slate-800 bg-[#0D121D] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {!loading && pagination && (
          <p className="mb-6 font-mono text-xs text-slate-400">
            Showing <span className="text-slate-200">{articles.length}</span> of{' '}
            <span className="text-slate-200">{pagination.total}</span> matching articles
            {initialQuery ? (
              <>
                {' '}
                for <span className="text-sky-300">"{initialQuery}"</span>
              </>
            ) : null}
          </p>
        )}

        {loading ? (
          <ArticleGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-10 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-400 mb-2" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0D121D] p-14 text-center">
            <h2 className="font-display text-xl font-bold text-white">No matching articles found</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Try broadening your keywords, removing category filters, or searching for a related
              security topic.
            </p>
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="mt-6 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
            >
              Clear All Filters
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
                onPageChange={(next) => applyParams({ page: String(next) })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
