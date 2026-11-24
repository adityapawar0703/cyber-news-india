import { Calendar, Clock, ShieldAlert, X } from 'lucide-react';
import { CategoryBadge } from '../common/CategoryBadge';
import { ArticleContent } from '../article/ArticleContent';
import { formatDate, getInitials, getSeverityStyle, resolveImageUrl } from '../../lib/utils';

interface PreviewData {
  title: string;
  description: string;
  content: string;
  category: string;
  cveId?: string;
  severity?: string;
  featuredImage?: string;
  featuredImageCaption?: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
}

export function ArticlePreviewModal({
  open,
  onClose,
  article,
}: {
  open: boolean;
  onClose: () => void;
  article: PreviewData;
}) {
  if (!open) return null;

  const plainWords = article.content
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(plainWords / 225));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-[#070A10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0D121D] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-200">
              Live Reader Preview
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Close Preview
          </button>
        </div>

        <div className="overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} size="sm" />
            {article.cveId && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                {article.cveId}
              </span>
            )}
            {article.severity && (
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase ${getSeverityStyle(
                  article.severity
                )}`}
              >
                {article.severity}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-white">
            {article.title || 'Untitled Article'}
          </h1>

          {article.description && (
            <p className="text-base sm:text-lg leading-relaxed text-slate-300">
              {article.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-800/80 py-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 font-mono text-xs font-bold text-sky-300">
                {getInitials(article.authorName)}
              </div>
              <div>
                <p className="font-semibold text-white">{article.authorName || 'Editorial Desk'}</p>
                <p className="text-slate-400">{article.authorRole || 'Security Correspondent'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min read
              </span>
            </div>
          </div>

          {article.featuredImage && (
            <figure className="overflow-hidden rounded-xl border border-slate-800 bg-[#0D121D]">
              <img
                src={resolveImageUrl(article.featuredImage)}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover"
              />
              {article.featuredImageCaption && (
                <figcaption className="border-t border-slate-800 px-4 py-2.5 text-xs text-slate-400">
                  {article.featuredImageCaption}
                </figcaption>
              )}
            </figure>
          )}

          <div className="mx-auto max-w-[740px] pt-2">
            <ArticleContent html={article.content || '<p>No content written yet.</p>'} />
          </div>
        </div>
      </div>
    </div>
  );
}
