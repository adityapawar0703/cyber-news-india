export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div className="lg:col-span-8 rounded-2xl border border-slate-800/70 bg-[#0D121D] overflow-hidden">
        <div className="aspect-[16/9] bg-slate-800/60" />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="h-5 w-36 rounded bg-slate-800" />
          <div className="h-9 w-11/12 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800/70" />
          <div className="h-4 w-3/4 rounded bg-slate-800/70" />
        </div>
      </div>
      <div className="lg:col-span-4 rounded-2xl border border-slate-800/70 bg-[#0D121D] p-6 space-y-5">
        <div className="h-5 w-40 rounded bg-slate-800" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2.5 pt-4 border-t border-slate-800/70">
            <div className="h-3.5 w-24 rounded bg-slate-800" />
            <div className="h-5 w-full rounded bg-slate-800" />
            <div className="h-3.5 w-32 rounded bg-slate-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-800/70 bg-[#0D121D] overflow-hidden"
        >
          <div className="aspect-[16/10] bg-slate-800/60" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-slate-800" />
            <div className="h-5 w-full rounded bg-slate-800" />
            <div className="h-5 w-4/5 rounded bg-slate-800" />
            <div className="h-3.5 w-full rounded bg-slate-800/60" />
            <div className="h-3.5 w-2/3 rounded bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
      <div className="h-5 w-40 rounded bg-slate-800" />
      <div className="h-12 w-full rounded bg-slate-800" />
      <div className="h-12 w-4/5 rounded bg-slate-800" />
      <div className="h-5 w-2/3 rounded bg-slate-800/60" />
      <div className="aspect-[16/9] rounded-2xl bg-slate-800/60 mt-8" />
      <div className="space-y-4 pt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-4 w-full rounded bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}
