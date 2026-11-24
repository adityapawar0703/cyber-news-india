import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  List,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ArticleDetailResponse } from '../types';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { ArticleCard } from '../components/article/ArticleCard';
import { ArticleContent, type TocHeading } from '../components/article/ArticleContent';
import { ShareBar } from '../components/article/ShareBar';
import { ArticlePageSkeleton } from '../components/common/Skeletons';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { getCategorySlug } from '../lib/categories';
import {
  formatDate,
  formatNumber,
  getInitials,
  getSeverityStyle,
  resolveImageUrl,
} from '../lib/utils';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ArticleDetailResponse | null>(null);
  const [views, setViews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setHeadings([]);

    api
      .getArticleBySlug(slug)
      .then((res) => {
        setData(res);
        setViews(res.article.views || 0);
        document.title = res.article.seo?.metaTitle || `${res.article.title} | Cyber India News`;

        // Record deduplicated article view
        api
          .trackArticleView(slug)
          .then((v) => {
            if (typeof v.views === 'number') setViews(v.views);
          })
          .catch(() => {});
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Article could not be loaded.')
      )
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadProgress(0);
        return;
      }
      setReadProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleHeadings = useCallback((h: TocHeading[]) => {
    setHeadings(h);
  }, []);

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-rose-400">404 / Not Found</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Article Not Available</h1>
        <p className="mt-3 text-sm text-slate-400">
          {error || 'This dispatch may have been moved or unpublished.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Front Page
        </Link>
      </div>
    );
  }

  const { article, related, navigation } = data;
  const showUpdated =
    article.updatedAt &&
    Math.abs(new Date(article.updatedAt).getTime() - new Date(article.publishedAt).getTime()) >
      3600 * 1000 * 6;

  return (
    <>
      {/* Reading progress hairline */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-[width] duration-75"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <article className="pb-16">
        {/* Editorial Article Header */}
        <header className="border-b border-slate-800/80 bg-[#080C14]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-500 mb-6"
            >
              <Link to="/" className="hover:text-slate-300 transition">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                to={`/category/${getCategorySlug(article.category)}`}
                className="hover:text-sky-400 transition"
              >
                {article.category}
              </Link>
              {article.cveId && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-amber-300">{article.cveId}</span>
                </>
              )}
            </nav>

            {/* Category + CVE + Severity */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <CategoryBadge category={article.category} clickable size="sm" />
              {article.isBreaking && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 border border-rose-500/35 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-rose-300">
                  Breaking Report
                </span>
              )}
              {article.cveId && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {article.cveId}
                </span>
              )}
              {article.severity && (
                <span
                  className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${getSeverityStyle(
                    article.severity
                  )}`}
                >
                  Severity: {article.severity}
                </span>
              )}
            </div>

            {/* Large Editorial Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.14] tracking-tight text-white">
              {article.title}
            </h1>

            {/* Standfirst */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300">
              {article.description}
            </p>

            {/* Author & Publication Metadata */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-500/35 bg-sky-500/10 font-mono text-sm font-bold text-sky-300">
                  {getInitials(article.author?.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{article.author?.name}</p>
                  <p className="text-xs text-slate-400">{article.author?.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Published {formatDate(article.publishedAt)}
                </span>
                {showUpdated && (
                  <span className="text-slate-500">
                    Updated {formatDate(article.updatedAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {article.readingTime} min read
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  {formatNumber(views)} views
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Editorial Image */}
        {article.featuredImage && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
            <figure className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0D121D]">
              <img
                src={resolveImageUrl(article.featuredImage)}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover"
              />
              {article.featuredImageCaption && (
                <figcaption className="border-t border-slate-800/80 bg-[#0A0F1A] px-5 py-3 text-xs text-slate-400">
                  {article.featuredImageCaption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {/* Centered Reading Layout with Optional Desktop Share Rail & TOC */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Left Share Rail (desktop only) */}
            <aside className="hidden xl:block xl:col-span-2">
              <div className="sticky top-28 flex justify-end pr-4">
                <ShareBar title={article.title} orientation="vertical" />
              </div>
            </aside>

            {/* Primary Reading Column */}
            <div className="xl:col-span-7 mx-auto w-full max-w-[740px]">
              <ArticleContent
                html={article.content || ''}
                onHeadingsExtracted={handleHeadings}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-6">
                  <Tag className="h-3.5 w-3.5 text-slate-500 mr-1" />
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="rounded-lg border border-slate-800 bg-[#0D121D] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share Bar */}
              <div className="mt-6 border-t border-slate-800/80 pt-6">
                <ShareBar title={article.title} orientation="horizontal" />
              </div>

              {/* Author Box */}
              <div className="mt-8 rounded-2xl border border-slate-800/85 bg-[#0D121D] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky-500/35 bg-sky-500/10 font-mono text-sm font-bold text-sky-300">
                    {getInitials(article.author?.name)}
                  </div>
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-widest text-sky-400">
                      About the Author
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-bold text-white">
                      {article.author?.name}
                    </h3>
                    <p className="text-xs text-slate-400">{article.author?.role}</p>
                    {article.author?.bio && (
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Previous & Next Article Navigation */}
              {(navigation.previous || navigation.next) && (
                <nav
                  aria-label="Adjacent articles"
                  className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {navigation.previous ? (
                    <Link
                      to={`/article/${navigation.previous.slug}`}
                      className="group rounded-xl border border-slate-800/85 bg-[#0D121D] p-5 transition hover:border-slate-700 hover:bg-[#101828]"
                    >
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500 group-hover:text-sky-400">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Previous Article
                      </span>
                      <p className="mt-2 font-display text-sm font-semibold text-slate-100 group-hover:text-sky-300 line-clamp-2">
                        {navigation.previous.title}
                      </p>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {navigation.next && (
                    <Link
                      to={`/article/${navigation.next.slug}`}
                      className="group rounded-xl border border-slate-800/85 bg-[#0D121D] p-5 text-right transition hover:border-slate-700 hover:bg-[#101828]"
                    >
                      <span className="inline-flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500 group-hover:text-sky-400">
                        Next Article
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                      <p className="mt-2 font-display text-sm font-semibold text-slate-100 group-hover:text-sky-300 line-clamp-2">
                        {navigation.next.title}
                      </p>
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Right Sticky Table of Contents (desktop only) */}
            <aside className="hidden xl:block xl:col-span-3">
              {headings.length > 0 && (
                <div className="sticky top-28 rounded-2xl border border-slate-800/80 bg-[#0D121D] p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                    <List className="h-3.5 w-3.5 text-sky-400" />
                    In This Report
                  </div>
                  <ul className="mt-3 space-y-2 text-xs">
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
                        <a
                          href={`#${h.id}`}
                          className="block leading-snug text-slate-400 hover:text-sky-300 transition"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-7">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-sky-400">
                  Continue Reading
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  Related Intelligence
                </h2>
              </div>
              <Link
                to={`/category/${getCategorySlug(article.category)}`}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
              >
                More in {article.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <ArticleCard key={item._id} article={item} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </article>

      <NewsletterSection />
    </>
  );
}
