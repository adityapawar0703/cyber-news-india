import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  PenSquare,
  Search,
  Trash2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { ALL_CATEGORY_NAMES } from '../../lib/categories';
import type { Article, PaginationMeta } from '../../types';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, formatNumber, resolveImageUrl } from '../../lib/utils';

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Manage Articles | Cyber India News Admin';
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const fetchArticles = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getAdminArticles({
        page,
        limit: 10,
        status,
        category: category === 'All' ? undefined : category,
        search: debouncedSearch || undefined,
      })
      .then((res) => {
        setArticles(res.articles);
        setPagination(res.pagination);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load articles.')
      )
      .finally(() => setLoading(false));
  }, [page, status, category, debouncedSearch]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (art: Article) => {
    setBusyId(art._id);
    try {
      const res = await api.toggleArticleStatus(art._id);
      setArticles((prev) =>
        prev.map((item) => (item._id === art._id ? { ...item, status: res.article.status } : item))
      );
      showToast(
        res.article.status === 'published'
          ? `"${art.title}" is now live.`
          : `"${art.title}" moved to drafts.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await api.deleteArticle(deleteTarget._id);
      showToast(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-sky-400">
            Content Management
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
            Articles & Drafts
          </h1>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          <PenSquare className="h-4 w-4" />
          Create New Article
        </Link>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-2xl border border-slate-800/85 bg-[#0D121D] p-4">
        <div className="md:col-span-5 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, CVE, or tag..."
            className="w-full rounded-xl border border-slate-800 bg-[#070B12] pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-4">
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {ALL_CATEGORY_NAMES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-1 rounded-xl border border-slate-800 bg-[#070B12] p-1">
          {(['all', 'published', 'draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatus(st);
                setPage(1);
              }}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize transition cursor-pointer ${
                status === st
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-800/60" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0D121D] p-12 text-center">
          <h2 className="font-display text-lg font-bold text-white">No articles found</h2>
          <p className="mt-1 text-xs text-slate-400">
            Adjust your filters or publish a new cybersecurity story.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-[#0A0F1A] font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3.5">Article</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Views</th>
                    <th className="px-4 py-3.5">Published</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {articles.map((art) => (
                    <tr key={art._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5 max-w-md">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(art.featuredImage)}
                            alt=""
                            className="hidden sm:block h-11 w-16 shrink-0 rounded-lg object-cover border border-slate-800 bg-slate-900"
                          />
                          <div className="min-w-0">
                            <p className="font-display font-semibold text-slate-100 line-clamp-1">
                              {art.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                              <span>{art.author?.name}</span>
                              {art.isFeatured && (
                                <span className="text-sky-400">• Featured</span>
                              )}
                              {art.isBreaking && (
                                <span className="text-rose-400">• Breaking</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <CategoryBadge category={art.category} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase ${
                            art.status === 'published'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                        {formatNumber(art.views)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(art.publishedAt)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={busyId === art._id}
                            onClick={() => handleToggleStatus(art)}
                            title={
                              art.status === 'published' ? 'Unpublish to Draft' : 'Publish Live'
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition cursor-pointer disabled:opacity-50"
                          >
                            {art.status === 'published' ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Unpublish</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Publish</span>
                              </>
                            )}
                          </button>

                          <Link
                            to={`/admin/articles/${art._id}/edit`}
                            title="Edit Article"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>

                          {art.status === 'published' && (
                            <Link
                              to={`/article/${art.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Live"
                              className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(art)}
                            title="Delete Article"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0D121D] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Delete Article?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Permanently remove{' '}
              <span className="font-semibold text-slate-200">"{deleteTarget.title}"</span>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === deleteTarget._id}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer disabled:opacity-60"
              >
                {busyId === deleteTarget._id ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
