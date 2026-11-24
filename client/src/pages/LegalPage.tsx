import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export function LegalPage({ type }: LegalPageProps) {
  const isPrivacy = type === 'privacy';

  useEffect(() => {
    document.title = isPrivacy ? 'Privacy Policy | Cyber India News' : 'Terms of Service | Cyber India News';
  }, [isPrivacy]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-sky-400 transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Legal</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-white">
        {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      </h1>
      <p className="mt-2 font-mono text-xs text-slate-500">Effective Date: November 2026</p>

      <div className="article-prose mt-8">
        {isPrivacy ? (
          <>
            <p>
              Cyber India News respects reader privacy and operates on a minimal-data telemetry principle.
              We do not run invasive cross-site behavioral ad trackers or sell reader profiles.
            </p>
            <h2>Information We Collect</h2>
            <ul>
              <li>
                <strong>Aggregate Readership Counts:</strong> We record lightweight, time-deduplicated
                visit and article view counters to measure readership interest.
              </li>
              <li>
                <strong>Newsletter Subscriptions:</strong> When you voluntarily subscribe to the
                Cyber India News Morning Brief, we store your email address solely to deliver dispatches.
              </li>
            </ul>
            <h2>Data Retention & Contact</h2>
            <p>
              You may request deletion of your newsletter subscription at any time by contacting{' '}
              <code>privacy@cyberindianews.in</code>.
            </p>
          </>
        ) : (
          <>
            <p>
              By accessing Cyber India News, you agree to use our reporting, advisories, and technical code
              samples responsibly and lawfully.
            </p>
            <h2>Security Research & Code Samples</h2>
            <p>
              All vulnerability analyses, YARA signatures, defensive commands, and red-team concepts
              published on Cyber India News are provided strictly for authorized security research,
              education, and defensive hardening.
            </p>
            <h2>Intellectual Property</h2>
            <p>
              Original editorial reporting, graphics, and layouts are copyright Cyber India News Media Group.
              Brief attributed excerpts with backlinks are permitted for journalistic and educational
              citation.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
