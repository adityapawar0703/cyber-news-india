import type { ArticleCategory } from '../types';

export interface CategoryMeta {
  name: ArticleCategory;
  slug: string;
  shortLabel: string;
  description: string;
  accentHex: string;
  badgeClass: string;
  dotClass: string;
  borderAccentClass: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    shortLabel: 'Cybersecurity',
    description: 'Enterprise defense, threat operations, supply-chain security, and global cyber developments.',
    accentHex: '#38BDF8',
    badgeClass: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
    dotClass: 'bg-sky-400',
    borderAccentClass: 'border-t-sky-400',
  },
  {
    name: 'Vulnerabilities & CVEs',
    slug: 'vulnerabilities-cves',
    shortLabel: 'Vulnerabilities',
    description: 'Zero-day disclosures, kernel flaws, CVSS analysis, and verified remediation guidance.',
    accentHex: '#FBBF24',
    badgeClass: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
    dotClass: 'bg-amber-400',
    borderAccentClass: 'border-t-amber-400',
  },
  {
    name: 'Data Breaches',
    slug: 'data-breaches',
    shortLabel: 'Data Breaches',
    description: 'Forensic postmortems of corporate intrusions, identity compromises, and credential leaks.',
    accentHex: '#FB7185',
    badgeClass: 'bg-rose-500/12 text-rose-300 border-rose-500/25',
    dotClass: 'bg-rose-400',
    borderAccentClass: 'border-t-rose-400',
  },
  {
    name: 'Ethical Hacking',
    slug: 'ethical-hacking',
    shortLabel: 'Ethical Hacking',
    description: 'Red-team research, penetration testing playbooks, hardware teardown labs, and purple-team defense.',
    accentHex: '#34D399',
    badgeClass: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    dotClass: 'bg-emerald-400',
    borderAccentClass: 'border-t-emerald-400',
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    shortLabel: 'AI & Security',
    description: 'Adversarial ML, autonomous agent security, sovereign AI infrastructure, and model safety.',
    accentHex: '#818CF8',
    badgeClass: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25',
    dotClass: 'bg-indigo-400',
    borderAccentClass: 'border-t-indigo-400',
  },
  {
    name: 'Malware & Ransomware',
    slug: 'malware-ransomware',
    shortLabel: 'Malware',
    description: 'Reverse engineering, ransomware group tracking, YARA detections, and adversary infrastructure.',
    accentHex: '#FB923C',
    badgeClass: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
    dotClass: 'bg-orange-400',
    borderAccentClass: 'border-t-orange-400',
  },
  {
    name: 'Cloud & Network Security',
    slug: 'cloud-network-security',
    shortLabel: 'Cloud & Network',
    description: 'Zero-trust architectures, Kubernetes isolation, service meshes, and cloud IAM hardening.',
    accentHex: '#2DD4BF',
    badgeClass: 'bg-teal-500/12 text-teal-300 border-teal-500/25',
    dotClass: 'bg-teal-400',
    borderAccentClass: 'border-t-teal-400',
  },
  {
    name: 'Privacy & Policy',
    slug: 'privacy-policy',
    shortLabel: 'Privacy',
    description: 'Applied cryptography, post-quantum transitions, surveillance policy, and digital rights.',
    accentHex: '#94A3B8',
    badgeClass: 'bg-slate-400/12 text-slate-200 border-slate-400/25',
    dotClass: 'bg-slate-300',
    borderAccentClass: 'border-t-slate-300',
  },
  {
    name: 'Technology News',
    slug: 'technology-news',
    shortLabel: 'Technology',
    description: 'Systems engineering, quantum breakthroughs, silicon architecture, and internet infrastructure.',
    accentHex: '#60A5FA',
    badgeClass: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
    dotClass: 'bg-blue-400',
    borderAccentClass: 'border-t-blue-400',
  },
];

export const ALL_CATEGORY_NAMES: ArticleCategory[] = CATEGORIES.map((c) => c.name);

export function getCategoryMeta(nameOrSlug: string): CategoryMeta {
  const normalized = nameOrSlug.trim().toLowerCase();
  return (
    CATEGORIES.find(
      (c) => c.name.toLowerCase() === normalized || c.slug === normalized
    ) || CATEGORIES[0]
  );
}

export function getCategorySlug(name: string): string {
  return getCategoryMeta(name).slug;
}
