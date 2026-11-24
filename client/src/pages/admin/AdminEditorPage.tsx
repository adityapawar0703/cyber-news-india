import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { ALL_CATEGORY_NAMES } from '../../lib/categories';
import type { ArticleCategory, SeverityLevel } from '../../types';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { ArticlePreviewModal } from '../../components/admin/ArticlePreviewModal';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../lib/utils';

function toLocalDateInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function AdminEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { admin } = useAuth();
  const featuredInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Article form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [category, setCategory] = useState<ArticleCategory>('Cybersecurity');
  const [tagsInput, setTagsInput] = useState('');
  const [cveId, setCveId] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageCaption, setFeaturedImageCaption] = useState('');
  const [authorName, setAuthorName] = useState(admin?.displayName || 'Elena Vance');
  const [authorRole, setAuthorRole] = useState('Senior Security Correspondent');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [publishedAt, setPublishedAt] = useState(toLocalDateInput());
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    document.title = isEditing ? 'Edit Article | Cyber India News Admin' : 'New Article | Cyber India News Admin';
    if (!id) return;

    setLoading(true);
    api
      .getAdminArticleById(id)
      .then(({ article }) => {
        setTitle(article.title || '');
        setSlug(article.slug || '');
        setDescription(article.description || '');
        setContent(article.content || '<p></p>');
        setCategory(article.category || 'Cybersecurity');
        setTagsInput((article.tags || []).join(', '));
        setCveId(article.cveId || '');
        setSeverity(article.severity || '');
        setFeaturedImage(article.featuredImage || '');
        setFeaturedImageCaption(article.featuredImageCaption || '');
        setAuthorName(article.author?.name || 'Editorial Desk');
        setAuthorRole(article.author?.role || 'Senior Security Correspondent');
        setStatus(article.status || 'draft');
        setIsFeatured(Boolean(article.isFeatured));
        setIsBreaking(Boolean(article.isBreaking));
        setPublishedAt(toLocalDateInput(article.publishedAt));
        setMetaTitle(article.seo?.metaTitle || '');
        setMetaDescription(article.seo?.metaDescription || '');
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unable to load article.')
      )
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const res = await api.uploadImage(file);
      setFeaturedImage(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
      if (featuredInputRef.current) featuredInputRef.current.value = '';
    }
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError('Please enter an article headline.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a short description / standfirst.');
      return;
    }
    const strippedContent = content.replace(/<[^>]+>/g, '').trim();
    if (!strippedContent) {
      setError('Please write article content before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        content,
        category,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        cveId: cveId.trim().toUpperCase(),
        severity,
        featuredImage,
        featuredImageCaption: featuredImageCaption.trim(),
        author: {
          name: authorName.trim() || 'Editorial Desk',
          role: authorRole.trim() || 'Security Correspondent',
        },
        status: targetStatus,
        isFeatured,
        isBreaking,
        publishedAt: publishedAt ? new Date(`${publishedAt}T12:00:00Z`).toISOString() : undefined,
        seo: {
          metaTitle: metaTitle.trim() || `${title.trim()} | Cyber India News`,
          metaDescription: metaDescription.trim() || description.trim(),
        },
      };

      if (isEditing && id) {
        const res = await api.updateArticle(id, payload);
        setStatus(res.article.status);
        setSlug(res.article.slug);
        setSuccessMsg(
          targetStatus === 'published'
            ? 'Article updated and published live.'
            : 'Draft saved successfully.'
        );
      } else {
        const res = await api.createArticle(payload);
        setSuccessMsg(
          targetStatus === 'published'
            ? 'Article published live! Redirecting to editor…'
            : 'Draft created! Redirecting to editor…'
        );
        navigate(`/admin/articles/${res.article._id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-800" />
        <div className="h-[520px] rounded-2xl bg-slate-800/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-sky-400 transition mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Articles
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-white">
              {isEditing ? 'Edit Article' : 'Compose New Article'}
            </h1>
            <span
              className={`rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase ${
                status === 'published'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#0D121D] px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-sky-500/40 hover:text-sky-300 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {status === 'published' ? 'Update Published' : 'Publish Live'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {status === 'published' && slug && (
            <Link
              to={`/article/${slug}`}
              target="_blank"
              className="font-mono underline hover:text-white"
            >
              Open Live Article →
            </Link>
          )}
        </div>
      )}

      {/* Two-Column Editorial Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Writing Column (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                Article Headline *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Critical Zero-Day Discovered in Enterprise VPN Gateway..."
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-4 py-3 font-display text-lg font-bold text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                URL Slug (optional — auto-generated from title)
              </label>
              <div className="flex items-center rounded-xl border border-slate-800 bg-[#070B12] px-3.5 py-2 text-xs font-mono">
                <span className="text-slate-500 select-none">/article/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-seo-slug"
                  className="flex-1 bg-transparent pl-1 text-sky-300 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                Short Description / Standfirst *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Concise 1–2 sentence summary shown on homepage cards and search results..."
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none resize-none"
              />
              <div className="mt-1 text-right font-mono text-[10.5px] text-slate-500">
                {description.length} / 500
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Article Body *
            </label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Publishing & Metadata Sidebar (4 cols) */}
        <aside className="xl:col-span-4 space-y-5">
          {/* Featured Image Uploader */}
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 space-y-3.5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              Featured Cover Image
            </h2>

            {featuredImage ? (
              <div className="space-y-2.5">
                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <img
                    src={resolveImageUrl(featuredImage)}
                    alt="Featured preview"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    title="Remove cover image"
                    className="absolute right-2 top-2 rounded-lg bg-black/75 p-1.5 text-slate-200 hover:bg-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => featuredInputRef.current?.click()}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Replace Cover Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => featuredInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-[#070B12] px-4 py-8 text-center transition hover:border-sky-500/60 hover:bg-sky-500/5 cursor-pointer"
              >
                {uploadingCover ? (
                  <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-sky-400" />
                )}
                <span className="text-xs font-medium text-slate-300">
                  {uploadingCover ? 'Uploading image…' : 'Click to upload cover image'}
                </span>
                <span className="font-mono text-[10.5px] text-slate-500">
                  JPG, PNG, WebP · 16:9 recommended · Max 8MB
                </span>
              </button>
            )}

            <input
              ref={featuredInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />

            <input
              type="text"
              value={featuredImageCaption}
              onChange={(e) => setFeaturedImageCaption(e.target.value)}
              placeholder="Optional editorial photo caption..."
              className="w-full rounded-lg border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Taxonomy & Placement */}
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              Classification & Placement
            </h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                {ALL_CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">CVE ID (optional)</label>
                <input
                  type="text"
                  value={cveId}
                  onChange={(e) => setCveId(e.target.value)}
                  placeholder="CVE-2026-..."
                  className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 font-mono text-xs text-amber-300 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Zero-Day, Linux, Kubernetes"
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Publish Date</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 font-mono text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-xs text-slate-300">Hero Featured Lead Story</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 accent-sky-500 rounded"
                />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-xs text-slate-300">Highlight as Breaking News</span>
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="h-4 w-4 accent-rose-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* Author Info */}
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              Byline
            </h2>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author Name"
              className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            />
            <input
              type="text"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              placeholder="Author Role / Beat"
              className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* SEO Metadata */}
          <div className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-5 space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              SEO Metadata
            </h2>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>SEO Title</span>
                <span className="font-mono text-slate-500">{metaTitle.length}/65</span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Defaults to article headline"
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Meta Description</span>
                <span className="font-mono text-slate-500">{metaDescription.length}/160</span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Defaults to short article description"
                className="w-full rounded-xl border border-slate-800 bg-[#070B12] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Live Preview Modal */}
      <ArticlePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={{
          title,
          description,
          content,
          category,
          cveId,
          severity,
          featuredImage,
          featuredImageCaption,
          authorName,
          authorRole,
          publishedAt,
        }}
      />
    </div>
  );
}
