import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { HomeFeedResponse } from '../types';
import { BreakingTicker } from '../components/home/BreakingTicker';
import { HeroEditorial } from '../components/home/HeroEditorial';
import { TrendingStrip } from '../components/home/TrendingStrip';
import { LatestArticlesGrid } from '../components/home/LatestArticlesGrid';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { ArticleGridSkeleton, HeroSkeleton } from '../components/common/Skeletons';

export function HomePage() {
  const [feed, setFeed] = useState<HomeFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getHomeFeed()
      .then((data) => setFeed(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load latest stories.')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'Cyber India News — Cybersecurity Intelligence & Technology News';
    loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <HeroSkeleton />
        <ArticleGridSkeleton count={6} />
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Unable to Reach Newsroom API</h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button
          type="button"
          onClick={loadFeed}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div>
      <BreakingTicker articles={feed.breaking.length ? feed.breaking : feed.latest.slice(0, 4)} />

      {feed.featured && (
        <HeroEditorial
          featured={feed.featured}
          trending={feed.trending.length ? feed.trending : feed.latest}
        />
      )}

      <TrendingStrip breaking={feed.breaking} excludeId={feed.featured?._id} />

      <LatestArticlesGrid articles={feed.latest} />

      <CategoryShowcase byCategory={feed.byCategory} />

      <NewsletterSection />
    </div>
  );
}
