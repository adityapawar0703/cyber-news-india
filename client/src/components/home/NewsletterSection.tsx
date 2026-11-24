import { useState } from 'react';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.subscribeNewsletter(email.trim());
      setFeedback({ type: 'success', text: res.message });
      setEmail('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to subscribe right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-[#0F182A] via-[#0C1322] to-[#080C15] p-8 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-sky-300">
                <Mail className="h-3.5 w-3.5" />
                Cyber India News Morning Brief
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Critical CVEs, threat intel, and engineering security — delivered before standup.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
                Join security engineers, CISOs, and researchers receiving one concise, noise-free
                daily briefing. Zero vendor fluff. Unsubscribe in one click.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
                    aria-label="Email address"
                    className="flex-1 rounded-xl border border-slate-700/80 bg-[#070B12] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="shrink-0 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </div>

                {feedback && (
                  <div
                    className={`flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-xs ${
                      feedback.type === 'success'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {feedback.type === 'success' && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <p className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  We never sell or share subscriber addresses.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
