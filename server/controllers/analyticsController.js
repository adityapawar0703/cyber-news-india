import crypto from 'crypto';
import Article from '../models/Article.js';
import VisitorStat from '../models/VisitorStat.js';
import Subscriber from '../models/Subscriber.js';

// Lightweight in-memory deduplication cache (prevents inflated duplicate refreshes)
const dedupeCache = new Map();
const VISIT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const VIEW_TTL_MS = 15 * 60 * 1000; // 15 minutes

function pruneCache() {
  if (dedupeCache.size < 4000) return;
  const now = Date.now();
  for (const [key, exp] of dedupeCache.entries()) {
    if (exp <= now) dedupeCache.delete(key);
  }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getVisitorFingerprint(req) {
  const headerId = req.headers['x-visitor-id'];
  if (headerId && typeof headerId === 'string' && headerId.length >= 8) {
    return headerId.slice(0, 64);
  }
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 24);
}

export async function trackSiteVisit(req, res, next) {
  try {
    pruneCache();
    const fp = getVisitorFingerprint(req);
    const cacheKey = `site:${fp}`;
    const now = Date.now();

    if (dedupeCache.has(cacheKey) && dedupeCache.get(cacheKey) > now) {
      return res.json({ counted: false });
    }

    dedupeCache.set(cacheKey, now + VISIT_TTL_MS);

    const dateKey = getTodayKey();
    await VisitorStat.findOneAndUpdate(
      { dateKey },
      { $inc: { visits: 1 } },
      { upsert: true, new: true }
    );

    res.json({ counted: true });
  } catch (err) {
    next(err);
  }
}

export async function trackArticleView(req, res, next) {
  try {
    pruneCache();
    const { slug } = req.params;
    const fp = getVisitorFingerprint(req);
    const cacheKey = `article:${slug}:${fp}`;
    const now = Date.now();

    if (dedupeCache.has(cacheKey) && dedupeCache.get(cacheKey) > now) {
      const current = await Article.findOne({ slug, status: 'published' }).select('views').lean();
      return res.json({ counted: false, views: current?.views ?? 0 });
    }

    const updated = await Article.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true, projection: { views: 1 } }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    dedupeCache.set(cacheKey, now + VIEW_TTL_MS);

    const dateKey = getTodayKey();
    await VisitorStat.findOneAndUpdate(
      { dateKey },
      { $inc: { articleViews: 1 } },
      { upsert: true }
    );

    res.json({ counted: true, views: updated.views });
  } catch (err) {
    next(err);
  }
}

export async function getAdminStats(_req, res, next) {
  try {
    const [
      totalPublished,
      totalDrafts,
      articleViewsAgg,
      visitorTotalsAgg,
      dailyTrend,
      topArticles,
      recentArticles,
      categoryBreakdown,
      totalSubscribers,
    ] = await Promise.all([
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
      VisitorStat.aggregate([
        {
          $group: {
            _id: null,
            totalVisits: { $sum: '$visits' },
            trackedArticleViews: { $sum: '$articleViews' },
          },
        },
      ]),
      VisitorStat.find().sort({ dateKey: -1 }).limit(14).lean(),
      Article.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .select('title slug category views publishedAt readingTime')
        .lean(),
      Article.find()
        .sort({ updatedAt: -1 })
        .limit(6)
        .select('title slug category status views publishedAt updatedAt featuredImage')
        .lean(),
      Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            views: { $sum: '$views' },
          },
        },
        { $sort: { views: -1 } },
      ]),
      Subscriber.countDocuments({ status: 'active' }),
    ]);

    const totalArticleViews = articleViewsAgg[0]?.totalViews || 0;
    const totalVisits = visitorTotalsAgg[0]?.totalVisits || 0;

    res.json({
      overview: {
        totalPublished,
        totalDrafts,
        totalArticles: totalPublished + totalDrafts,
        totalVisits,
        totalArticleViews,
        totalSubscribers,
      },
      dailyTrend: dailyTrend.reverse(),
      topArticles,
      recentArticles,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c._id,
        count: c.count,
        views: c.views,
      })),
    });
  } catch (err) {
    next(err);
  }
}
