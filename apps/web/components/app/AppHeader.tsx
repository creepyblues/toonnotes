'use client';

import Link from 'next/link';

interface AppHeaderProps {
  userEmail?: string;
  userAvatar?: string;
}

export default function AppHeader({ userEmail, userAvatar }: AppHeaderProps) {
  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <header className="hidden md:flex h-14 bg-white border-b border-warm-200 items-center justify-between px-6">
      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            disabled
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Help link */}
        <Link
          href="/"
          className="text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          Home
        </Link>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium text-warm-900 truncate max-w-[200px]">
              {userEmail || 'User'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">{initials}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
