import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bug,
  Cpu,
  DatabaseZap,
  Shield,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type { Article } from '../../types';
import { getCategoryMeta } from '../../lib/categories';
import { formatDate, resolveImageUrl } from '../../lib/utils';

const SHOWCASE_CONFIG = [
  { name: 'Cybersecurity', icon: Shield },
  { name: 'Ethical Hacking', icon: Terminal },
  { name: 'Data Breaches', icon: DatabaseZap },
  { name: 'Vulnerabilities & CVEs', icon: Bug },
  { name: 'Artificial Intelligence', icon: Sparkles },
  { name: 'Technology News', icon: Cpu },
];

export function CategoryShowcase({
  byCategory,
}: {
  byCategory: Record<string, Article[]>;
}) {
  return (
    <section className="py-14 border-b border-slate-800/80 bg-[#080C14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
            Dedicated Coverage Desks
          </span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Deep Reporting by Specialty
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Curated coverage across offensive security, vulnerability engineering, breach forensics,
            AI defense, and core technology infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SHOWCASE_CONFIG.map(({ name, icon: Icon }) => {
            const meta = getCategoryMeta(name);
            const items = byCategory[name] || [];
            const lead = items[0];
            const secondary = items.slice(1, 3);

            return (
              <div
                key={name}
                className={`flex flex-col rounded-2xl border border-slate-800/85 border-t-2 ${meta.borderAccentClass} bg-[#0D121D] p-6 transition hover:border-slate-700/90`}
              >
                {/* Desk Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#121A29]"
                      style={{ color: meta.accentHex }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{meta.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/category/${meta.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
                  >
                    Desk
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Desk Content */}
                {!lead ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    New stories coming soon to {meta.name}.
                  </div>
                ) : (
                  <div className="mt-5 flex flex-1 flex-col gap-5">
                    {/* Lead Desk Story */}
                    <Link
                      to={`/article/${lead.slug}`}
                      className="group grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                    >
                      <div className="sm:col-span-5 aspect-[16/10] overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900">
                        <img
                          src={resolveImageUrl(lead.featuredImage)}
                          alt={lead.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="sm:col-span-7 space-y-2">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          {lead.cveId && (
                            <span className="text-amber-300 font-semibold">{lead.cveId} ·</span>
                          )}
                          <span>{formatDate(lead.publishedAt)}</span>
                          <span>·</span>
                          <span>{lead.readingTime}m</span>
                        </div>
                        <h4 className="font-display text-base font-bold leading-snug text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
                          {lead.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {lead.description}
                        </p>
                      </div>
                    </Link>

                    {/* Secondary Desk Stories */}
                    {secondary.length > 0 && (
                      <div className="divide-y divide-slate-800/70 border-t border-slate-800/70 pt-2">
                        {secondary.map((art) => (
                          <Link
                            key={art._id}
                            to={`/article/${art.slug}`}
                            className="group flex items-baseline justify-between gap-4 py-3 first:pt-2 last:pb-0"
                          >
                            <h5 className="text-sm font-medium text-slate-200 group-hover:text-sky-300 transition line-clamp-1">
                              {art.title}
                            </h5>
                            <span className="shrink-0 font-mono text-[11px] text-slate-500">
                              {formatDate(art.publishedAt)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
