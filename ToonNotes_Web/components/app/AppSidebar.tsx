'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    label: 'Notes',
    href: '/app',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Boards',
    href: '/app/boards',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Designs',
    href: '/app/designs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
];

const secondaryNavItems = [
  {
    label: 'Archive',
    href: '/app/archive',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    label: 'Trash',
    href: '/app/trash',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const renderNavItem = (item: typeof navItems[0], exactMatch = false) => {
    const isActive = exactMatch
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onClose}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
            isActive
              ? 'bg-teal-600 text-white'
              : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900'
          }`}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </Link>
      </li>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/app" className="flex items-center space-x-3" onClick={onClose}>
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-warm-900 font-bold text-xl">ToonNotes</span>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 text-warm-400 hover:text-warm-600 rounded-lg hover:bg-warm-100"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => renderNavItem(item, item.href === '/app'))}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-warm-200" />

        {/* Secondary navigation */}
        <ul className="space-y-1">
          {secondaryNavItems.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Pro badge or upgrade prompt */}
      <div className="mt-auto pt-4 border-t border-warm-200">
        <div className="px-3 py-3 bg-gradient-to-r from-teal-50 to-coral-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-medium text-teal-800">Web Access</span>
          </div>
          <p className="mt-1 text-xs text-warm-600">
            View your synced notes from the mobile app.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-warm-200 min-h-screen p-4 flex-col">
        {navContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white p-4 z-50 md:hidden shadow-xl flex flex-col">
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
