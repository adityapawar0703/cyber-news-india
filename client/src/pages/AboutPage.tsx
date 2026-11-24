import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { NewsletterSection } from '../components/home/NewsletterSection';

const EDITORIAL_TEAM = [
  {
    name: 'Elena Vance',
    role: 'Editor-in-Chief & Vulnerability Desk',
    focus: 'Linux kernel internals, zero-day disclosure, cloud hypervisor security.',
  },
  {
    name: 'Marcus Sterling',
    role: 'Senior Investigative Reporter',
    focus: 'Enterprise data breaches, cloud identity forensics, software supply chain.',
  },
  {
    name: 'Dr. Priya Nair',
    role: 'AI Security Editor',
    focus: 'Adversarial ML, autonomous agent sandboxing, sovereign GPU clusters.',
  },
  {
    name: 'Devon K. Morales',
    role: 'Principal Red Team Analyst',
    focus: 'Hardware fault injection, Active Directory defense, offensive emulation.',
  },
];

export function AboutPage() {
  useEffect(() => {
    document.title = 'About Cyber India News — Editorial Standards & Mission';
  }, []);

  return (
    <div>
      <section className="border-b border-slate-800/80 bg-[#080C14]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-400">
            About Cyber India News
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            Independent cybersecurity journalism built for engineers, defenders, and decision makers.
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-3xl">
            Cyber India News was founded to cut through sensationalist fear-mongering and vendor PR.
            Every report combines verified technical evidence, reproducible mitigation steps,
            and clear executive context.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Technical Verification',
              desc: 'We verify CVEs, proof-of-concept mechanics, and detection signatures before going to press.',
            },
            {
              icon: Lock,
              title: 'Responsible Disclosure',
              desc: 'We follow coordinated vulnerability disclosure norms and protect confidential sources.',
            },
            {
              icon: CheckCircle2,
              title: 'Zero Pay-to-Play',
              desc: 'Our editorial coverage is strictly independent of sponsorships, vendors, or threat feeds.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-6 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg font-bold text-white">{item.title}</h2>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Masthead */}
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-sky-400 mb-2">
            <Users className="h-4 w-4" />
            Editorial Masthead
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">
            The Reporters & Researchers Behind the Desk
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {EDITORIAL_TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-slate-800/85 bg-[#0D121D] p-6"
              >
                <h3 className="font-display text-lg font-bold text-white">{member.name}</h3>
                <p className="font-mono text-xs text-sky-400 mt-0.5">{member.role}</p>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{member.focus}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Tips */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#0D121D] p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-400">
              <Mail className="h-4 w-4" />
              Newsroom Tips & Disclosures
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              Have a verified security tip or vulnerability research to share?
            </h2>
            <p className="text-sm text-slate-400">
              Reach our editorial desk at{' '}
              <span className="font-mono text-slate-200">tips@cyberindianews.in</span>. For encrypted
              correspondence, verify PGP fingerprint{' '}
              <span className="font-mono text-sky-300">4E9A 71B2 C03F 881D 2026</span>.
            </p>
          </div>
          <Link
            to="/latest"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition"
          >
            Read Latest Reports
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}
