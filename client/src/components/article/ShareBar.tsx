import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

interface ShareBarProps {
  title: string;
  url?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ShareBar({
  title,
  url = typeof window !== 'undefined' ? window.location.href : '',
  orientation = 'horizontal',
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const links = [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'HN',
      href: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">
          Share
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy link"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0D121D] text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
        </button>
        {links.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0D121D] font-mono text-[10.5px] font-semibold text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
          >
            {item.label === 'LinkedIn' ? 'in' : item.label === 'Reddit' ? 'r/' : item.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-1">
        <Share2 className="h-3.5 w-3.5 text-sky-400" />
        Share report:
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500/40 hover:text-sky-300"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            Copied Link
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Copy Link
          </>
        )}
      </button>
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-800 bg-[#0D121D] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
