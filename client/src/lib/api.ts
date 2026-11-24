import type {
  AdminStatsResponse,
  AdminUser,
  Article,
  ArticleDetailResponse,
  HomeFeedResponse,
  PaginationMeta,
} from '../types';
import { getOrCreateVisitorId } from './utils';

const TOKEN_STORAGE_KEY = 'cw_admin_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    'x-visitor-id': getOrCreateVisitorId(),
    ...(customHeaders as Record<string, string>),
  };

  if (!(rest.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(path, { ...rest, headers });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || 'Unexpected server response' };
  }

  if (!res.ok) {
    const message =
      (data as { error?: string })?.error || `Request failed (${res.status})`;
    if (res.status === 401 && auth) {
      setStoredToken(null);
    }
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  // Public content
  getHomeFeed: () => request<HomeFeedResponse>('/api/articles/home-feed'),

  getArticles: (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: 'latest' | 'popular' | 'oldest';
    breaking?: boolean;
    tag?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.category && params.category !== 'All') q.set('category', params.category);
    if (params.search?.trim()) q.set('search', params.search.trim());
    if (params.sort) q.set('sort', params.sort);
    if (params.breaking) q.set('breaking', 'true');
    if (params.tag) q.set('tag', params.tag);
    return request<{ articles: Article[]; pagination: PaginationMeta }>(
      `/api/articles?${q.toString()}`
    );
  },

  getArticleBySlug: (slug: string) =>
    request<ArticleDetailResponse>(`/api/articles/${encodeURIComponent(slug)}`),

  getCategories: () =>
    request<{ categories: Array<{ name: string; slug: string; count: number }> }>(
      '/api/articles/categories'
    ),

  // Analytics & Newsletter
  trackSiteVisit: () =>
    request<{ counted: boolean }>('/api/analytics/visit', { method: 'POST' }),

  trackArticleView: (slug: string) =>
    request<{ counted: boolean; views: number }>(
      `/api/analytics/article-view/${encodeURIComponent(slug)}`,
      { method: 'POST' }
    ),

  subscribeNewsletter: (email: string) =>
    request<{ message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Admin Auth
  login: (identifier: string, password: string) =>
    request<{ token: string; admin: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  getMe: () => request<{ admin: AdminUser }>('/api/auth/me', { auth: true }),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      auth: true,
    }),

  // Admin Dashboard & Articles CRUD
  getAdminStats: () =>
    request<AdminStatsResponse>('/api/analytics/admin/stats', { auth: true }),

  getAdminArticles: (params: {
    page?: number;
    limit?: number;
    status?: 'all' | 'published' | 'draft';
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.category && params.category !== 'All') q.set('category', params.category);
    if (params.search?.trim()) q.set('search', params.search.trim());
    if (params.sort) q.set('sort', params.sort);
    return request<{ articles: Article[]; pagination: PaginationMeta }>(
      `/api/articles/admin/list?${q.toString()}`,
      { auth: true }
    );
  },

  getAdminArticleById: (id: string) =>
    request<{ article: Article }>(`/api/articles/admin/${id}`, { auth: true }),

  createArticle: (payload: Record<string, unknown>) =>
    request<{ article: Article }>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    }),

  updateArticle: (id: string, payload: Record<string, unknown>) =>
    request<{ article: Article }>(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      auth: true,
    }),

  toggleArticleStatus: (id: string) =>
    request<{ article: Article }>(`/api/articles/${id}/status`, {
      method: 'PATCH',
      auth: true,
    }),

  deleteArticle: (id: string) =>
    request<{ message: string; id: string }>(`/api/articles/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ url: string; filename: string }>('/api/uploads/image', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  },
};
