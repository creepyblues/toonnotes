import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      {/* Settings Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Account Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  User ID
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                ToonNotes Web App v0.1.0
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                View and manage your notes synced from the mobile app.
              </p>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-6">
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
