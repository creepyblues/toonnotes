import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  updated_at: string;
  created_at: string;
  is_archived: boolean;
  is_deleted: boolean;
  design_id: string | null;
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the note
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !note) {
    notFound();
  }

  const typedNote = note as Note;

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            {typedNote.title || 'Untitled Note'}
          </h1>
        </div>
      </header>

      {/* Note Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-xl shadow-lg p-8 min-h-[400px]"
          style={{
            backgroundColor: typedNote.color || '#ffffff',
          }}
        >
          {typedNote.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {typedNote.title}
            </h2>
          )}

          <div className="prose prose-gray max-w-none">
            {typedNote.content ? (
              <p className="whitespace-pre-wrap text-gray-700">
                {typedNote.content}
              </p>
            ) : (
              <p className="text-gray-400 italic">No content</p>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200/50">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(typedNote.updated_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Created: {new Date(typedNote.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Note Actions */}
        <div className="mt-4 flex justify-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Edit your notes in the ToonNotes mobile app
          </span>
        </div>
      </main>
    </div>
  );
}
