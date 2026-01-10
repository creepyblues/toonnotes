import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  updated_at: string;
  is_archived: boolean;
  is_deleted: boolean;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user's notes
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            ToonNotes
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Settings
            </Link>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Notes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notes?.length ?? 0} notes
          </p>
        </div>

        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note: Note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block"
              >
                <div
                  className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[160px]"
                  style={{
                    backgroundColor: note.color || '#ffffff',
                  }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No notes yet. Create one in the mobile app!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
