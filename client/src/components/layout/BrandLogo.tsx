import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md';
  subtitle?: string;
}

export function BrandLogo({ to = '/', size = 'md', subtitle }: BrandLogoProps) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5 focus:outline-none">
      <div
        className={`relative flex items-center justify-center rounded-lg border border-sky-500/30 bg-gradient-to-br from-[#0F1B2E] to-[#090E18] shadow-inner transition group-hover:border-sky-400/60 ${
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'}
          aria-hidden="true"
        >
          <path
            d="M12 2.75L4.25 6.2V11.8C4.25 16.55 7.55 20.65 12 21.75C16.45 20.65 19.75 16.55 19.75 11.8V6.2L12 2.75Z"
            stroke="#38BDF8"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 11.75L11.25 13.5L15 9.5"
            stroke="#E0F2FE"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#070A10]" />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-tight text-white ${
            size === 'sm' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          }`}
        >
          CYBER INDIA <span className="text-sky-400">NEWS</span>
        </span>
        {subtitle && (
          <span className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-400">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
