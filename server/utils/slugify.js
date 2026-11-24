import Article from '../models/Article.js';

export function toSlug(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'article';
}

export async function generateUniqueSlug(title, excludeId = null) {
  const base = toSlug(title);
  let slug = base;
  let suffix = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Article.findOne(query).select('_id').lean();
    if (!existing) return slug;
    slug = `${base}-${suffix++}`;
  }
}
