import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Eye,
  FileCheck2,
  FileEdit,
  Mail,
  PenSquare,
  Users,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminStatsResponse } from '../../types';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { formatDate, formatNumber } from '../../lib/utils';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Dashboard | Cyber India News Admin';
    api
      .getAdminStats()
      .then((res) => setStats(res))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load dashboard metrics.')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/60" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-slate-800/60" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <AlertCircle className="mx-auto h-7 w-7 text-rose-400 mb-2" />
        <p className="text-sm text-rose-200">{error}</p>
      </div>
    );
  }

  const { overview, dailyTrend, topArticles, recentArticles } = stats;

  const kpis = [
    {
      label: 'Published Articles',
      value: overview.totalPublished,
      icon: FileCheck2,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      sub: `${overview.totalArticles} total in CMS`,
    },
    {
      label: 'Draft Articles',
      value: overview.totalDrafts,
      icon: FileEdit,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      sub: 'Pending editorial review',
    },
    {
      label: 'Total Website Visits',
      value: overview.totalVisits,
      icon: Users,
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
      sub: 'Deduplicated sessions',
    },
    {
      label: 'Total Article Views',
      value: overview.totalArticleViews,
      icon: Eye,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
      sub: `${overview.totalSubscribers} newsletter subscribers`,
    },
  ];

  const maxViews = Math.max(
    1,
    ...dailyTrend.map((d) => Math.max(d.articleViews, d.visits))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-sky-400">
            Editorial Telemetry
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
            Newsroom Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/articles"
            className="rounded-xl border border-slate-800 bg-[#0D121D] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-700 transition"
          >
            Manage Articles
          </Link>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            <PenSquare className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.accent}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
                {formatNumber(card.value)}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Traffic Chart + Top Read Articles */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 14-Day Traffic Telemetry */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-800/85 bg-[#0D121D] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              <h2 className="font-display text-base font-bold text-white">
                14-Day Readership & Visits
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/85" />
                Article Views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-400/75" />
                Site Visits
              </span>
            </div>
          </div>

          {dailyTrend.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Traffic data will appear as visitors browse the publication.
            </div>
          ) : (
            <div className="mt-6">
              <div className="h-52 flex items-end gap-2 sm:gap-3">
                {dailyTrend.map((day, idx) => {
                  const viewsPct = Math.max(4, Math.round((day.articleViews / maxViews) * 100));
                  const visitsPct = Math.max(4, Math.round((day.visits / maxViews) * 100));
                  const isHovered = hoveredDay === idx;

                  return (
                    <div
                      key={day.dateKey}
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="relative flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      {isHovered && (
                        <div className="pointer-events-none absolute -top-12 z-10 whitespace-nowrap rounded-lg border border-slate-700 bg-[#070A10] px-2.5 py-1.5 font-mono text-[10.5px] text-slate-200 shadow-xl">
                          <div className="text-slate-400">{day.dateKey}</div>
                          <div>
                            Views: <span className="text-sky-300">{formatNumber(day.articleViews)}</span> ·
                            Visits: <span className="text-indigo-300">{formatNumber(day.visits)}</span>
                          </div>
                        </div>
                      )}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div
                          className="w-2/5 max-w-[14px] rounded-t bg-sky-400/80 transition-all group-hover:bg-sky-300"
                          style={{ height: `${viewsPct}%` }}
                        />
                        <div
                          className="w-2/5 max-w-[14px] rounded-t bg-indigo-400/65 transition-all group-hover:bg-indigo-300"
                          style={{ height: `${visitsPct}%` }}
                        />
                      </div>
                      <span className="mt-2 font-mono text-[9.5px] text-slate-500">
                        {day.dateKey.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Most Viewed Articles */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-800/85 bg-[#0D121D] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <h2 className="font-display text-base font-bold text-white">Top Read Reports</h2>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Mail className="h-3.5 w-3.5 text-sky-400" />
              {overview.totalSubscribers} subs
            </span>
          </div>

          <div className="divide-y divide-slate-800/75">
            {topArticles.map((art, i) => (
              <div key={art._id} className="flex items-start justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-slate-500">0{i + 1}</span>
                    <CategoryBadge category={art.category} />
                  </div>
                  <Link
                    to={`/article/${art.slug}`}
                    target="_blank"
                    className="block font-display text-sm font-semibold text-slate-100 hover:text-sky-300 transition line-clamp-1"
                  >
                    {art.title}
                  </Link>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold text-sky-300 pt-1">
                  {formatNumber(art.views)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Updated / Published Articles */}
      <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h2 className="font-display text-base font-bold text-white">Recent Articles</h2>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-1 font-mono text-xs text-sky-400 hover:text-sky-300"
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#0A0F1A] font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {recentArticles.map((art) => (
                <tr key={art._id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-3.5 font-medium text-slate-100 max-w-md">
                    <span className="line-clamp-1">{art.title}</span>
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
                    {formatDate(art.updatedAt)}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/articles/${art._id}/edit`}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500/40 hover:text-sky-300 transition"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
