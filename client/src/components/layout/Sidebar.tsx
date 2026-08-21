import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from '@/data/navigation';
import { DynamicIcon, ChevronDown, ChevronLeft, X } from '@/components/ui/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function canAccess(roles: UserRole[] | undefined, userRole: string | undefined): boolean {
  if (!roles || roles.length === 0) return true;
  if (!userRole) return false;
  return roles.includes(userRole as UserRole);
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'ISO Areas': true,
    'Data Management': true,
    'Review': true,
    'Reports': true,
    'Administration': true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  // Filter sections and items by role
  const visibleSections = NAV_SECTIONS
    .filter(section => canAccess(section.roles, userRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => canAccess(item.roles, userRole)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-64 -translate-x-full flex-col border-r border-slate-800/80 bg-slate-950 transition-transform duration-200 lg:translate-x-0',
        isMobileOpen && 'translate-x-0',
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}
    >
      {/* Logo / Brand Header */}
      <div className="flex h-14 items-center border-b border-slate-800/80 px-4">
        <div className="flex min-w-0 flex-1">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 text-white">
              <span className="text-xs font-black tracking-wider">ISO</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100 leading-tight">ISO 30414</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">Human Capital Audit Platform</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 text-white">
            <span className="text-xs font-black">ISO</span>
          </div>
        )}
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-2.5" aria-label="Main navigation">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-2">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300"
                  aria-expanded={expandedSections[section.title]}
                >
                  {section.title}
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 text-slate-500 transition-transform duration-200',
                      !expandedSections[section.title] && '-rotate-90'
                    )}
                  />
                </button>
              )}

              {/* Section Items */}
              {(isCollapsed || expandedSections[section.title]) && (
                <div className="flex flex-col gap-1 mt-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                          active
                            ? 'bg-blue-500/10 text-blue-400 font-semibold border-l-2 border-blue-500 pl-2'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                          isCollapsed && 'justify-center px-0'
                        )}
                        onClick={onMobileClose}
                      >
                        <DynamicIcon
                          name={item.icon}
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[9px] font-bold text-blue-400">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {!isCollapsed && <Separator className="my-2 bg-slate-800/60" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-800/80 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform duration-200', isCollapsed && 'rotate-180')}
          />
        </button>
      </div>
    </aside>
  );
}
