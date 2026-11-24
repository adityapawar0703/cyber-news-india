import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Menu,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CATEGORIES } from '../../lib/categories';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Article } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { ThemeToggle } from '../common/ThemeToggle';
import { formatRelativeTime } from '../../lib/utils';

const PRIMARY_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Latest News', to: '/latest' },
  { label: 'Cybersecurity', to: '/category/cybersecurity' },
  { label: 'Technology', to: '/category/technology-news' },
  { label: 'Vulnerabilities', to: '/category/vulnerabilities-cves' },
  { label: 'About Us', to: '/about' },
];

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      api
        .getArticles({ search: trimmed, limit: 5 })
        .then((res) => setResults(res.articles))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 220);

    return () => clearTimeout(timer);
  }, [query, searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setSearchOpen(false);
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070A10]/90 backdrop-blur-xl">
        {/* Top subtle editorial utility strip */}
        <div className="hidden md:block border-b border-slate-800/60 bg-[#05080E]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sky-400">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                THREAT DESK ACTIVE
              </span>
              <span className="text-slate-700">|</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/category/data-breaches" className="hover:text-slate-200 transition">
                Data Breaches
              </Link>
              <Link to="/category/ethical-hacking" className="hover:text-slate-200 transition">
                Ethical Hacking
              </Link>
              <Link to="/category/artificial-intelligence" className="hover:text-slate-200 transition">
                AI Security
              </Link>
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Desk
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main navigation bar */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo subtitle="Security & Tech Dispatch" />

          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'text-white bg-slate-800/70'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search articles"
              className="group flex items-center gap-2.5 rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
            >
              <Search className="h-4 w-4 text-slate-400 group-hover:text-sky-400 transition" />
              <span className="hidden sm:inline text-xs">Search CVEs, news…</span>
              <kbd className="hidden md:inline-flex items-center rounded border border-slate-700/80 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                Ctrl K
              </kbd>
            </button>

            <ThemeToggle />

            <a
              href="/#newsletter"
              className="hidden sm:inline-flex items-center rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Subscribe
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-800 bg-[#0D121D] p-2 text-slate-300 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs border-l border-slate-800 bg-[#0A0F18] p-6 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-1">
                <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Navigation
                </p>
                {PRIMARY_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-sky-500/12 text-sky-300 border border-sky-500/20'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-1">
                <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Coverage Desks
                </p>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cat.dotClass}`} />
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col gap-2.5">
                <ThemeToggle showLabel className="w-full" />
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-200"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Archive
                </button>
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-500/15 border border-sky-500/30 px-4 py-2.5 text-xs font-semibold text-sky-300"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Open Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Instant Command-Palette Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0D121D] shadow-2xl"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-slate-800 px-4">
                <Search className="h-5 w-5 text-sky-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, CVEs (e.g. CVE-2026-21409), ransomware, AI..."
                  className="w-full bg-transparent px-3.5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>

              <div className="max-h-[60vh] overflow-y-auto p-3">
                {!query.trim() ? (
                  <div className="p-3 space-y-3">
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
                      Quick Topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Zero-Day', 'CVE-2026', 'Ransomware', 'Rust', 'Prompt Injection', 'Kubernetes', 'Post-Quantum'].map(
                        (term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="rounded-lg border border-slate-800 bg-[#121A29] px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
                          >
                            {term}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ) : searching ? (
                  <div className="p-6 text-center text-xs font-mono text-slate-400">
                    Querying editorial archive…
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-300">No stories matching "{query}"</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another keyword, technology, or CVE identifier.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((item) => (
                      <Link
                        key={item._id}
                        to={`/article/${item.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="group flex items-start justify-between gap-3 rounded-xl p-3 transition hover:bg-slate-800/60"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={item.category} />
                            {item.cveId && (
                              <span className="font-mono text-[10.5px] text-amber-300">
                                {item.cveId}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 pt-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(item.publishedAt)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#090D16] px-4 py-2.5 text-xs text-slate-400">
                <span>Press Enter for full search results</span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="inline-flex items-center gap-1 font-medium text-sky-400 hover:text-sky-300"
                >
                  Open Search Page
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
