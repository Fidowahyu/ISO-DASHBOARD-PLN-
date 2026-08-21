import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, Search, LogOut } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { getNotifications } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  PIC: 'PIC Responsibel',
  REVIEWER: 'Reviewer Auditor',
  MANAGEMENT: 'Executive Management',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getNotifications()
      .then(items => setUnreadCount(items.filter(item => !item.readAt).length))
      .catch(() => setUnreadCount(0));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = user ? getInitials(user.fullName) : '?';
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : '';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left — Page title & Breadcrumb info */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden text-slate-400 hover:text-slate-100 hover:bg-slate-900"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 flex-col">
          <h1 className="text-sm font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Right — Search, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari metrik, area ISO..."
            className="h-8 w-60 rounded-lg border border-slate-800 bg-slate-900/80 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Notifications */}
        <Button asChild variant="ghost" size="icon" className="relative h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg">
          <Link to="/notifications" aria-label={`${unreadCount} notifikasi`}>
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* User Info */}
        <div className="ml-1 flex items-center gap-2.5 border-l border-slate-800/80 pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-400 border border-blue-500/30 select-none">
            {initials}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.fullName ?? 'Memuat...'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Logout */}
        <Button
          id="header-logout-btn"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
