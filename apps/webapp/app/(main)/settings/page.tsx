'use client';

import { useMemo } from 'react';
import { TopBar } from '@/components/layout';
import { ReleaseUpdateSection } from '@/components/settings';
import { useUIStore, useNoteStore } from '@/stores';
import { Moon, Sun, Archive, Trash, SignOut } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);

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

  return (
    <>
      <TopBar
        title="Settings"
        showViewToggle={false}
        showNewButton={false}
        showSearch={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Appearance Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon size={20} className="text-purple-500" weight="fill" />
                  ) : (
                    <Sun size={20} className="text-amber-500" weight="fill" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Dark Mode
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    darkMode
                      ? 'bg-purple-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                  role="switch"
                  aria-checked={darkMode}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                      darkMode && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Data Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              <a
                href="/archive"
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Archive size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Archived Notes
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {archivedCount} note{archivedCount !== 1 ? 's' : ''} archived
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {archivedCount}
                </span>
              </a>

              <a
                href="/trash"
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Trash
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {deletedCount} note{deletedCount !== 1 ? 's' : ''} in trash
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {deletedCount}
                </span>
              </a>
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              <form action="/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <SignOut size={20} className="text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Sign Out
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sign out of your account
                    </p>
                  </div>
                </button>
              </form>
            </div>
          </section>

          {/* Release Updates Section */}
          <ReleaseUpdateSection />

          {/* Footer */}
          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
            <p>ToonNotes Web App</p>
            <p className="mt-1">Made with love for webtoon fans</p>
          </footer>
        </div>
      </div>
    </>
  );
}
