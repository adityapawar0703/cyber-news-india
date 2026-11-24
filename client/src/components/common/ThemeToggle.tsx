import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-[#0D121D] text-slate-300 transition hover:border-sky-500/40 hover:text-sky-400 cursor-pointer ${
        showLabel ? 'px-3 py-2 text-xs font-medium' : 'h-9 w-9'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-sky-600 shrink-0" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}
