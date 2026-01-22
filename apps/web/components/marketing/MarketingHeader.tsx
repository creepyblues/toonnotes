'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MarketingHeaderProps {
  variant?: 'transparent' | 'solid';
}

export function MarketingHeader({ variant = 'transparent' }: MarketingHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/features', label: 'Features' },
    { href: '/scenarios', label: 'Scenarios' },
    { href: '/development_diary', label: 'Dev Diary' },
  ];

  const isActive = (href: string) => {
    if (href === '/scenarios') {
      return pathname === '/scenarios' || pathname.startsWith('/scenarios/');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const headerClass =
    variant === 'solid'
      ? 'fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-200'
      : 'absolute top-0 left-0 right-0 z-50';

  return (
    <header className={headerClass}>
      <nav className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-teal-600">
            <span className="text-lg sm:text-xl font-bold text-white">T</span>
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-warm-900">
            ToonNotes
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden sm:block text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-teal-600'
                  : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-full hover:bg-teal-700 transition-colors"
          >
            Download
          </Link>
        </div>
      </nav>
    </header>
  );
}
