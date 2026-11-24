import Article, { ARTICLE_CATEGORIES } from '../models/Article.js';
import { generateUniqueSlug, toSlug } from '../utils/slugify.js';
import { calculateReadingTime } from '../utils/readingTime.js';
import { sanitizeArticleHtml } from '../utils/sanitize.js';

const LIST_PROJECTION =
  'title slug description category tags cveId severity featuredImage featuredImageCaption author status isFeatured isBreaking views readingTime publishedAt createdAt updatedAt';

function escapeRegex(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getHomeFeed(_req, res, next) {
  try {
    const publishedFilter = { status: 'published' };

    const [
      featuredDoc,
      breakingDocs,
      latestDocs,
      trendingDocs,
      categoryCountsAgg,
    ] = await Promise.all([
      Article.findOne({ ...publishedFilter, isFeatured: true })
        .sort({ publishedAt: -1 })
        .select(LIST_PROJECTION)
        .lean(),
      Article.find({ ...publishedFilter, isBreaking: true })
        .sort({ publishedAt: -1 })
        .limit(6)
        .select(LIST_PROJECTION)
        .lean(),
      Article.find(publishedFilter)
        .sort({ publishedAt: -1 })
        .limit(12)
        .select(LIST_PROJECTION)
        .lean(),
      Article.find(publishedFilter)
        .sort({ views: -1, publishedAt: -1 })
        .limit(6)
        .select(LIST_PROJECTION)
        .lean(),
      Article.aggregate([
        { $match: publishedFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const featured = featuredDoc || breakingDocs[0] || latestDocs[0] || null;

    const showcaseCategories = [
      'Cybersecurity',
      'Ethical Hacking',
      'Data Breaches',
      'Vulnerabilities & CVEs',
      'Artificial Intelligence',
      'Technology News',
    ];

    const categoryResults = await Promise.all(
      showcaseCategories.map((cat) =>
        Article.find({ ...publishedFilter, category: cat })
          .sort({ publishedAt: -1 })
          .limit(3)
          .select(LIST_PROJECTION)
          .lean()
      )
    );

    const byCategory = {};
    showcaseCategories.forEach((cat, idx) => {
      byCategory[cat] = categoryResults[idx];
    });

    const categoryCounts = {};
    for (const cat of ARTICLE_CATEGORIES) {
      categoryCounts[cat] = 0;
    }
    for (const row of categoryCountsAgg) {
      categoryCounts[row._id] = row.count;
    }

    res.json({
      featured,
      breaking: breakingDocs,
      latest: latestDocs,
      trending: trendingDocs,
      byCategory,
      categoryCounts,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicArticles(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const { category, search, sort = 'latest', breaking, featured, tag } = req.query;

    const filter = { status: 'published' };

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (breaking === 'true') {
      filter.isBreaking = true;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    if (tag) {
      filter.tags = { $regex: new RegExp(`^${escapeRegex(String(tag).trim())}$`, 'i') };
    }
    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [
        { title: rx },
        { description: rx },
        { category: rx },
        { tags: rx },
        { cveId: rx },
        { 'author.name': rx },
      ];
    }

    let sortObj = { publishedAt: -1, createdAt: -1 };
    if (sort === 'popular' || sort === 'trending') {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { publishedAt: 1 };
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(LIST_PROJECTION)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getArticleBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug, status: 'published' }).lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const [related, prevArticle, nextArticle] = await Promise.all([
      Article.find({
        status: 'published',
        _id: { $ne: article._id },
        $or: [{ category: article.category }, { tags: { $in: article.tags || [] } }],
      })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select(LIST_PROJECTION)
        .lean(),
      Article.findOne({
        status: 'published',
        publishedAt: { $lt: article.publishedAt },
      })
        .sort({ publishedAt: -1 })
        .select('title slug category publishedAt')
        .lean(),
      Article.findOne({
        status: 'published',
        publishedAt: { $gt: article.publishedAt },
      })
        .sort({ publishedAt: 1 })
        .select('title slug category publishedAt')
        .lean(),
    ]);

    let relatedArticles = related;
    if (relatedArticles.length < 3) {
      const existingIds = [article._id, ...relatedArticles.map((r) => r._id)];
      const backfill = await Article.find({
        status: 'published',
        _id: { $nin: existingIds },
      })
        .sort({ publishedAt: -1 })
        .limit(3 - relatedArticles.length)
        .select(LIST_PROJECTION)
        .lean();
      relatedArticles = [...relatedArticles, ...backfill];
    }

    res.json({
      article,
      related: relatedArticles,
      navigation: {
        previous: prevArticle || null,
        next: nextArticle || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req, res, next) {
  try {
    const agg = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map(agg.map((a) => [a._id, a.count]));
    const categories = ARTICLE_CATEGORIES.map((name) => ({
      name,
      slug: toSlug(name),
      count: countsMap.get(name) || 0,
    }));
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

/* ==================== ADMIN CONTROLLERS ==================== */

export async function getAdminArticles(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const { status = 'all', category, search, sort = 'updated' } = req.query;

    const filter = {};
    if (status === 'published' || status === 'draft') {
      filter.status = status;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [
        { title: rx },
        { description: rx },
        { category: rx },
        { cveId: rx },
        { tags: rx },
      ];
    }

    let sortObj = { updatedAt: -1 };
    if (sort === 'published') sortObj = { publishedAt: -1 };
    if (sort === 'views') sortObj = { views: -1 };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(LIST_PROJECTION)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminArticleById(req, res, next) {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function createArticle(req, res, next) {
  try {
    const {
      title,
      slug: customSlug,
      description,
      content,
      category,
      tags = [],
      cveId = '',
      severity = '',
      featuredImage = '',
      featuredImageCaption = '',
      author,
      status = 'draft',
      isFeatured = false,
      isBreaking = false,
      publishedAt,
      seo = {},
    } = req.body;

    if (!title?.trim() || !description?.trim() || !content?.trim() || !category) {
      return res.status(400).json({
        error: 'Title, short description, category, and article content are required.',
      });
    }

    if (!ARTICLE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid article category selected.' });
    }

    const sanitizedContent = sanitizeArticleHtml(content);
    const slug = await generateUniqueSlug(customSlug?.trim() || title);
    const readingTime = calculateReadingTime(sanitizedContent);

    if (isFeatured) {
      await Article.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : String(tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 12);

    const article = await Article.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      content: sanitizedContent,
      category,
      tags: normalizedTags,
      cveId: String(cveId || '').trim().toUpperCase(),
      severity: severity || '',
      featuredImage: featuredImage || '',
      featuredImageCaption: featuredImageCaption || '',
      author: {
        name: author?.name?.trim() || req.admin?.displayName || 'Editorial Desk',
        role: author?.role?.trim() || 'Senior Security Correspondent',
        bio:
          author?.bio?.trim() ||
          'Covers emerging vulnerabilities, threat intelligence, and technology infrastructure.',
      },
      status: status === 'published' ? 'published' : 'draft',
      isFeatured: Boolean(isFeatured),
      isBreaking: Boolean(isBreaking),
      readingTime,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      seo: {
        metaTitle: seo?.metaTitle?.trim() || title.trim(),
        metaDescription: seo?.metaDescription?.trim() || description.trim(),
      },
    });

    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const existing = await Article.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const {
      title,
      slug: customSlug,
      description,
      content,
      category,
      tags,
      cveId,
      severity,
      featuredImage,
      featuredImageCaption,
      author,
      status,
      isFeatured,
      isBreaking,
      publishedAt,
      seo,
    } = req.body;

    if (category && !ARTICLE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid article category selected.' });
    }

    if (title !== undefined) existing.title = title.trim();
    if (customSlug !== undefined && customSlug.trim() && customSlug.trim() !== existing.slug) {
      existing.slug = await generateUniqueSlug(customSlug.trim(), existing._id);
    }
    if (description !== undefined) existing.description = description.trim();
    if (content !== undefined) {
      existing.content = sanitizeArticleHtml(content);
      existing.readingTime = calculateReadingTime(existing.content);
    }
    if (category !== undefined) existing.category = category;
    if (tags !== undefined) {
      existing.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
        : String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12);
    }
    if (cveId !== undefined) existing.cveId = String(cveId || '').trim().toUpperCase();
    if (severity !== undefined) existing.severity = severity || '';
    if (featuredImage !== undefined) existing.featuredImage = featuredImage;
    if (featuredImageCaption !== undefined) existing.featuredImageCaption = featuredImageCaption;
    if (author) {
      existing.author = {
        name: author.name?.trim() || existing.author.name,
        role: author.role?.trim() || existing.author.role,
        bio: author.bio?.trim() || existing.author.bio,
      };
    }
    if (status === 'published' || status === 'draft') {
      existing.status = status;
    }
    if (typeof isFeatured === 'boolean') {
      if (isFeatured && !existing.isFeatured) {
        await Article.updateMany(
          { _id: { $ne: existing._id }, isFeatured: true },
          { $set: { isFeatured: false } }
        );
      }
      existing.isFeatured = isFeatured;
    }
    if (typeof isBreaking === 'boolean') {
      existing.isBreaking = isBreaking;
    }
    if (publishedAt) {
      existing.publishedAt = new Date(publishedAt);
    }
    if (seo) {
      existing.seo = {
        metaTitle: seo.metaTitle?.trim() ?? existing.seo?.metaTitle ?? '',
        metaDescription: seo.metaDescription?.trim() ?? existing.seo?.metaDescription ?? '',
      };
    }

    await existing.save();
    res.json({ article: existing });
  } catch (err) {
    next(err);
  }
}

export async function toggleArticleStatus(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    article.status = article.status === 'published' ? 'draft' : 'published';
    if (article.status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    await article.save();

    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ message: 'Article deleted permanently.', id: req.params.id });
  } catch (err) {
    next(err);
  }
}
