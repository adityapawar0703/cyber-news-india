export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function formatNumber(n: number = 0): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

export function getInitials(name = 'CI'): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export function resolveImageUrl(url?: string): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const target = url || '/uploads/seed/hero-zero-day.jpg';
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('data:')
  ) {
    return target;
  }
  const cleanUrl = target.startsWith('/') ? target : `/${target}`;
  return baseUrl ? `${baseUrl}${cleanUrl}` : cleanUrl;
}

export function getOrCreateVisitorId(): string {
  const key = 'cw_visitor_id';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'v_anonymous_session';
  }
}

export function getSeverityStyle(severity?: string): string {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/35';
    case 'High':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
    case 'Medium':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/35';
    case 'Low':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}
