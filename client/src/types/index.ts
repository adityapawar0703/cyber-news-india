export type ArticleCategory =
  | 'Cybersecurity'
  | 'Data Breaches'
  | 'Ethical Hacking'
  | 'Vulnerabilities & CVEs'
  | 'Artificial Intelligence'
  | 'Malware & Ransomware'
  | 'Cloud & Network Security'
  | 'Privacy & Policy'
  | 'Technology News';

export type SeverityLevel = '' | 'Critical' | 'High' | 'Medium' | 'Low';

export interface ArticleAuthor {
  name: string;
  role: string;
  bio?: string;
}

export interface ArticleSEO {
  metaTitle?: string;
  metaDescription?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  category: ArticleCategory;
  tags: string[];
  cveId?: string;
  severity?: SeverityLevel;
  featuredImage: string;
  featuredImageCaption?: string;
  author: ArticleAuthor;
  status: 'draft' | 'published';
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seo?: ArticleSEO;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface HomeFeedResponse {
  featured: Article | null;
  breaking: Article[];
  latest: Article[];
  trending: Article[];
  byCategory: Record<string, Article[]>;
  categoryCounts: Record<string, number>;
}

export interface ArticleDetailResponse {
  article: Article;
  related: Article[];
  navigation: {
    previous: Pick<Article, '_id' | 'title' | 'slug' | 'category' | 'publishedAt'> | null;
    next: Pick<Article, '_id' | 'title' | 'slug' | 'category' | 'publishedAt'> | null;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'editor';
  lastLoginAt?: string;
}

export interface AdminStatsResponse {
  overview: {
    totalPublished: number;
    totalDrafts: number;
    totalArticles: number;
    totalVisits: number;
    totalArticleViews: number;
    totalSubscribers: number;
  };
  dailyTrend: Array<{
    dateKey: string;
    visits: number;
    articleViews: number;
  }>;
  topArticles: Array<Pick<Article, '_id' | 'title' | 'slug' | 'category' | 'views' | 'publishedAt' | 'readingTime'>>;
  recentArticles: Array<
    Pick<Article, '_id' | 'title' | 'slug' | 'category' | 'status' | 'views' | 'publishedAt' | 'updatedAt' | 'featuredImage'>
  >;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    views: number;
  }>;
}
