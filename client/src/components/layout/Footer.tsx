import { Link } from 'react-router-dom';
import { Github, Globe, Lock, Mail, Rss, Shield, Terminal } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CATEGORIES } from '../../lib/categories';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-[#05080E] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo subtitle="Independent Threat Intelligence" />
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Cyber India News delivers verified reporting on zero-day vulnerabilities, data breaches,
              defensive engineering, and emerging technology for security practitioners and technical leaders.
            </p>
            <div className="rounded-xl border border-slate-800/80 bg-[#0A0F1A] p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span>Editorial & Tips: tips@cyberindianews.in</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>PGP: 4E9A 71B2 C03F 881D 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'GitHub', icon: Github, href: 'https://github.com' },
                { label: 'X / Security Feed', icon: Terminal, href: 'https://x.com' },
                { label: 'Global Dispatch', icon: Globe, href: 'https://cyberindianews.in' },
                { label: 'RSS Archive', icon: Rss, href: '/latest' },
              ].map((social) => {
                const Icon = social.icon;
                const isExternal = social.href.startsWith('http');
                return isExternal ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0D121D] text-slate-400 transition hover:border-sky-500/40 hover:text-sky-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    key={social.label}
                    to={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0D121D] text-slate-400 transition hover:border-sky-500/40 hover:text-sky-300"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-300">
              Publication
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/latest" className="hover:text-white transition">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition">
                  Search Archive
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us & Ethics
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Columns */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-300">
              Coverage Desks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="group flex items-center gap-2.5 text-slate-400 hover:text-white transition"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cat.dotClass} opacity-75 group-hover:opacity-100`} />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <p>© {year} Cyber India News Media Group. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-slate-300 transition">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition">
              Terms
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-400 transition"
            >
              <Shield className="h-3 w-3" />
              Editorial Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
