'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NotePencil,
  Kanban,
  Palette,
  Archive,
  Trash,
  Gear,
  CaretLeft,
  CaretRight,
  SignOut,
} from '@phosphor-icons/react';
import { useUIStore, useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section: 'notes' | 'boards' | 'designs' | 'archive' | 'trash' | 'settings';
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  // Select raw notes array and compute counts with useMemo to avoid infinite loops
  const notes = useNoteStore((state) => state.notes);
  const archivedCount = useMemo(
    () => notes.filter((n) => n.isArchived && !n.isDeleted).length,
    [notes]
  );
  const deletedCount = useMemo(
    () => notes.filter((n) => n.isDeleted).length,
    [notes]
  );

  const mainNavItems: NavItem[] = [
    { label: 'Notes', href: '/', icon: NotePencil, section: 'notes' },
    { label: 'Boards', href: '/boards', icon: Kanban, section: 'boards' },
    { label: 'Designs', href: '/designs', icon: Palette, section: 'designs' },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      label: 'Archive',
      href: '/archive',
      icon: Archive,
      section: 'archive',
      badge: archivedCount || undefined,
    },
    {
      label: 'Trash',
      href: '/trash',
      icon: Trash,
      section: 'trash',
      badge: deletedCount || undefined,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/notes');
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo/Header */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              ToonNotes
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors',
            sidebarCollapsed ? 'mx-auto' : 'ml-auto'
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <CaretRight size={18} weight="bold" />
          ) : (
            <CaretLeft size={18} weight="bold" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}

        <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
        <NavLink
          item={{ label: 'Settings', href: '/settings', icon: Gear, section: 'settings' }}
          isActive={isActive('/settings')}
          collapsed={sidebarCollapsed}
        />

        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <SignOut size={20} weight="bold" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

function NavLink({ item, isActive, collapsed }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
        isActive
          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800',
        collapsed && 'justify-center'
      )}
    >
      <Icon size={20} weight={isActive ? 'fill' : 'bold'} />
      {!collapsed && (
        <>
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center bg-purple-500 text-white rounded-full">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </Link>
  );
}
