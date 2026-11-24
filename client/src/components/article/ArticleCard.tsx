import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import type { Article } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  formatDate,
  formatRelativeTime,
  getSeverityStyle,
  resolveImageUrl,
} from '../../lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'horizontal' | 'compact';
  showDescription?: boolean;
}

export function ArticleCard({
  article,
  variant = 'standard',
  showDescription = true,
}: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block rounded-xl border border-slate-800/70 bg-[#0D121D] p-4 transition duration-200 hover:border-slate-700 hover:bg-[#111827]"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <CategoryBadge category={article.category} />
          <span className="font-mono text-[11px] text-slate-500">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>
        <h3 className="font-display text-[15px] font-semibold leading-snug text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
          {article.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">{article.author?.name}</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <Clock className="h-3 w-3" />
            {article.readingTime}m
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className="group relative flex flex-col sm:flex-row overflow-hidden rounded-xl border border-slate-800/80 bg-[#0D121D] transition duration-200 hover:border-slate-700/90 hover:bg-[#101726]">
        <Link
          to={`/article/${article.slug}`}
          className="relative sm:w-52 md:w-60 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-900"
        >
          <img
            src={resolveImageUrl(article.featuredImage)}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          {article.isBreaking && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded bg-rose-500/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Breaking
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <CategoryBadge category={article.category} clickable />
              {article.cveId && (
                <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10.5px] text-amber-300">
                  <ShieldAlert className="h-3 w-3" />
                  {article.cveId}
                </span>
              )}
              <span className="font-mono text-[11px] text-slate-500">
                {formatRelativeTime(article.publishedAt)}
              </span>
            </div>

            <Link to={`/article/${article.slug}`} className="block">
              <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
                {article.title}
              </h3>
            </Link>

            {showDescription && (
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400 line-clamp-2">
                {article.description}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-slate-300">{article.author?.name}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-slate-500">
                {article.readingTime} min read
              </span>
            </div>
            <Link
              to={`/article/${article.slug}`}
              className="inline-flex items-center gap-1 font-medium text-sky-400 group-hover:text-sky-300 shrink-0"
            >
              Read
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Standard Editorial Card
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-[#0D121D] transition duration-250 hover:border-slate-700 hover:bg-[#101726]">
      <Link
        to={`/article/${article.slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900"
      >
        <img
          src={resolveImageUrl(article.featuredImage)}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D121D]/70 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {article.isBreaking && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-600/95 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Breaking
            </span>
          )}
          {article.severity && (
            <span
              className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${getSeverityStyle(
                article.severity
              )}`}
            >
              {article.severity}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <CategoryBadge category={article.category} clickable />
          {article.cveId ? (
            <span className="font-mono text-[11px] font-medium text-amber-300">
              {article.cveId}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-slate-500">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        <Link to={`/article/${article.slug}`} className="block">
          <h3 className="font-display text-[17px] font-bold leading-snug tracking-tight text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {showDescription && (
          <p className="mt-2.5 text-sm leading-relaxed text-slate-400 line-clamp-3 flex-1">
            {article.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800/70 pt-3.5 text-xs">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-300">{article.author?.name}</p>
            <p className="font-mono text-[11px] text-slate-500">
              {formatDate(article.publishedAt)} · {article.readingTime} min read
            </p>
          </div>
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-[11.5px] font-medium text-sky-400 transition group-hover:border-sky-500/30 group-hover:bg-sky-500/10 group-hover:text-sky-300 shrink-0"
          >
            Read More
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
