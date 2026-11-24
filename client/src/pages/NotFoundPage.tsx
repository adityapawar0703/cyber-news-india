import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-400">HTTP 404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-white">Page Not Found</h1>
      <p className="mt-3 text-sm text-slate-400">
        The dispatch or route you requested does not exist in our archive.
      </p>
      <div className="mt-7 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Front Page
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0D121D] px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 transition"
        >
          <Search className="h-4 w-4" />
          Search Archive
        </Link>
      </div>
    </div>
  );
}
