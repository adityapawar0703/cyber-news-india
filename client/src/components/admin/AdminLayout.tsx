import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  X,
} from 'lucide-react';
import { BrandLogo } from '../layout/BrandLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/utils';

const NAV_ITEMS = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Articles', to: '/admin/articles', icon: FileText, end: true },
  { label: 'New Article', to: '/admin/articles/new', icon: PenSquare, end: false },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#0A0F1A] border-r border-slate-800/80">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
        <BrandLogo to="/admin" size="sm" subtitle="Editorial Desk" />
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        <p className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-500/12 text-sky-300 border border-sky-500/25'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition"
          >
            <span>View Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="border-t border-slate-800/80 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 font-mono text-xs font-bold text-sky-300">
            {getInitials(admin?.displayName || admin?.username || 'AD')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {admin?.displayName || admin?.username}
            </p>
            <p className="truncate font-mono text-[11px] text-slate-500">{admin?.email}</p>
          </div>
        </div>

        <ThemeToggle showLabel className="w-full" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0D121D] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[82vw] h-full z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-slate-800/80 bg-[#0A0F1A]/95 backdrop-blur">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
            className="rounded-lg border border-slate-800 p-2 text-slate-300"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo to="/admin" size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-8 w-8" />
            <Link
              to="/admin/articles/new"
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
            >
              New
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
