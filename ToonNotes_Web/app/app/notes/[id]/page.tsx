import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { NoteDetailView } from '@/components/notes/NoteDetailView';
import type { NoteCardData } from '@/components/notes/NoteCard';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/app/auth/login');
  }

  // Fetch the note with joined design data
  const { data: note, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      labels,
      color,
      is_pinned,
      is_archived,
      is_deleted,
      created_at,
      updated_at,
      design_id,
      images,
      designs:design_id (
        name,
        background,
        colors,
        typography,
        sticker
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !note) {
    notFound();
  }

  // Transform note to include flattened design fields
  const design = note.designs as {
    name?: string;
    background?: unknown;
    colors?: unknown;
    typography?: unknown;
    sticker?: unknown;
  } | null;

  const transformedNote: NoteCardData & {
    is_archived: boolean;
    is_deleted: boolean;
  } = {
    id: note.id,
    title: note.title || '',
    content: note.content || '',
    labels: note.labels || [],
    color: note.color || 'White',
    is_pinned: note.is_pinned || false,
    is_archived: note.is_archived || false,
    is_deleted: note.is_deleted || false,
    created_at: note.created_at,
    updated_at: note.updated_at,
    design_id: note.design_id,
    images: note.images,
    design_name: design?.name,
    design_background: design?.background as NoteCardData['design_background'],
    design_colors: design?.colors as NoteCardData['design_colors'],
    design_typography: design?.typography as NoteCardData['design_typography'],
    design_sticker: design?.sticker as NoteCardData['design_sticker'],
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-warm-600 hover:text-warm-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Notes</span>
        </Link>
      </div>

      {/* Note status badges */}
      {(transformedNote.is_archived || transformedNote.is_deleted) && (
        <div className="mb-4 flex gap-2">
          {transformedNote.is_archived && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-100 text-warm-700 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archived
            </span>
          )}
          {transformedNote.is_deleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              In Trash
            </span>
          )}
        </div>
      )}

      {/* Note detail view */}
      <NoteDetailView note={transformedNote} />

      {/* Footer with metadata */}
      <div className="mt-6 pt-4 border-t border-warm-200 text-sm text-warm-500">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            Created: {new Date(transformedNote.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>
            Updated: {new Date(transformedNote.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Edit hint */}
      <div className="mt-8 p-4 bg-warm-50 border border-warm-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-warm-900">Edit on Mobile</h3>
            <p className="text-warm-600 text-sm mt-1">
              To edit this note, open the ToonNotes app on your mobile device.
              Changes will sync automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
