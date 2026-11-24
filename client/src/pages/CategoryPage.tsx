import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import { CATEGORIES, getCategoryMeta } from '../lib/categories';
import type { Article, PaginationMeta } from '../types';
import { ArticleCard } from '../components/article/ArticleCard';
import { ArticleGridSkeleton } from '../components/common/Skeletons';
import { Pagination } from '../components/common/Pagination';

export function CategoryPage() {
  const { slug = 'cybersecurity' } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';

  const meta = getCategoryMeta(slug);

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${meta.name} | Cyber India News`;
    setLoading(true);
    setError(null);

    api
      .getArticles({ category: meta.name, page, limit: 9, sort })
      .then((res) => {
        setArticles(res.articles);
        setPagination(res.pagination);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load category stories.')
      )
      .finally(() => setLoading(false));
  }, [meta.name, page, sort]);

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, val);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="pb-16">
      <section className={`border-b border-slate-800/80 border-t-2 ${meta.borderAccentClass} bg-[#080C14]`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-sky-400 transition mb-5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Front Page
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                Coverage Desk
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {meta.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-400">{meta.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <select
                aria-label="Sort articles"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-2 text-xs font-medium text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="latest">Latest First</option>
                <option value="popular">Most Read</option>
              </select>
            </div>
          </div>

          {/* Quick Category Switcher */}
          <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  cat.slug === meta.slug
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                    : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.shortLabel}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <ArticleGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-10 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-400 mb-2" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0D121D] p-14 text-center">
            <h2 className="font-display text-lg font-bold text-white">
              No published stories in {meta.name} yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Explore other active coverage desks or search the full archive.
            </p>
            <Link
              to="/latest"
              className="mt-5 inline-flex rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
            >
              Browse Latest News
            </Link>
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
                onPageChange={(next) => setParam('page', String(next))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
