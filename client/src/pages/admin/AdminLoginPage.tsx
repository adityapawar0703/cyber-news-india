import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function AdminLoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/admin';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Editorial Sign In | Cyber India News';
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] bg-editorial-grid flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo subtitle="Editorial Portal" />
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-sky-400 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Public Site
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/90 bg-[#0D121D] p-7 sm:p-8 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-sky-300">
              <Lock className="h-3 w-3" />
              Restricted Access
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-white">
              Sign in to Admin Desk
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Authorized editors and administrators only.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="editor@cyberindianews.in"
                className="w-full rounded-xl border border-slate-700/80 bg-[#070B12] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-700/80 bg-[#070B12] pl-3.5 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              {submitting ? 'Authenticating…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-[11.5px] text-slate-500">
            Public registration is disabled. Accounts are provisioned securely via the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
