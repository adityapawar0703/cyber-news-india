import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Flame,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import type { Article } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
  getInitials,
  getSeverityStyle,
  resolveImageUrl,
} from '../../lib/utils';

interface HeroEditorialProps {
  featured: Article;
  trending: Article[];
}

export function HeroEditorial({ featured, trending }: HeroEditorialProps) {
  const wireList = trending.filter((a) => a._id !== featured._id).slice(0, 4);

  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#070A10]">
      <div className="pointer-events-none absolute inset-0 bg-editorial-grid opacity-55" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* Primary Lead Feature (8 cols) */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-8 group flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0D121D] shadow-2xl shadow-black/40"
          >
            <Link
              to={`/article/${featured.slug}`}
              className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-900"
            >
              <img
                src={resolveImageUrl(featured.featuredImage)}
                alt={featured.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D121D] via-[#0D121D]/25 to-transparent" />

              <div className="absolute left-4 top-4 sm:left-6 sm:top-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600/95 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white shadow">
                  <Flame className="h-3 w-3" />
                  Featured Dispatch
                </span>
                {featured.cveId && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-[#070A10]/85 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-300 backdrop-blur-md">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {featured.cveId}
                  </span>
                )}
                {featured.severity && (
                  <span
                    className={`rounded-md border px-2 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider backdrop-blur-md ${getSeverityStyle(
                      featured.severity
                    )}`}
                  >
                    {featured.severity}
                  </span>
                )}
              </div>
            </Link>

            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 -mt-4 relative">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3.5">
                  <CategoryBadge category={featured.category} clickable size="sm" />
                  <span className="font-mono text-xs text-slate-400">
                    {formatDate(featured.publishedAt)}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {featured.readingTime} min read
                  </span>
                </div>

                <Link to={`/article/${featured.slug}`} className="block">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold leading-[1.16] tracking-tight text-white group-hover:text-sky-300 transition">
                    {featured.title}
                  </h1>
                </Link>

                <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-3xl">
                  {featured.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 font-mono text-xs font-semibold text-sky-300">
                    {getInitials(featured.author?.name)}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-200">
                      {featured.author?.name}
                    </p>
                    <p className="text-xs text-slate-400">{featured.author?.role}</p>
                  </div>
                </div>

                <Link
                  to={`/article/${featured.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Read Full Report
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.article>

          {/* Right Intelligence Wire / Most Read Rail (4 cols) */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="lg:col-span-4 flex flex-col rounded-2xl border border-slate-800/90 bg-[#0D121D] p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                  Most Read Wire
                </h2>
              </div>
              <Link
                to="/latest?sort=popular"
                className="font-mono text-[11px] text-sky-400 hover:text-sky-300 transition"
              >
                All Trending
              </Link>
            </div>

            <div className="flex-1 divide-y divide-slate-800/75">
              {wireList.map((item, idx) => (
                <Link
                  key={item._id}
                  to={`/article/${item.slug}`}
                  className="group flex gap-3.5 py-4 first:pt-4 last:pb-2 transition"
                >
                  <span className="font-mono text-lg font-bold text-slate-700 group-hover:text-sky-400 transition leading-none pt-0.5 select-none">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={item.category} />
                      <span className="font-mono text-[10.5px] text-slate-500">
                        {formatRelativeTime(item.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-[15px] font-semibold leading-snug text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>{item.readingTime} min read</span>
                      <span>·</span>
                      <span>{formatNumber(item.views)} reads</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <Link
                to="/category/vulnerabilities-cves"
                className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs transition hover:border-amber-500/40 hover:bg-amber-500/10"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                    Active Advisory Desk
                  </p>
                  <p className="mt-0.5 font-medium text-slate-200">
                    Browse Zero-Days & CVE Reports
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400 shrink-0" />
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
