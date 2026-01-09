import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NoteCard, NoteCardData } from '@/components/notes/NoteCard';

export default async function AppHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/app/auth/login');
  }

  // Fetch user's notes with joined design data
  const { data: notes, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      labels,
      color,
      is_pinned,
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
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('is_archived', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
  }

  // Transform notes to include flattened design fields
  const transformedNotes: NoteCardData[] = (notes || []).map((note) => {
    const design = note.designs as {
      name?: string;
      background?: unknown;
      colors?: unknown;
      typography?: unknown;
      sticker?: unknown;
    } | null;

    return {
      id: note.id,
      title: note.title || '',
      content: note.content || '',
      labels: note.labels || [],
      color: note.color || 'White',
      is_pinned: note.is_pinned || false,
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
  });

  const hasNotes = transformedNotes.length > 0;
  const pinnedNotes = transformedNotes.filter(n => n.is_pinned);
  const regularNotes = transformedNotes.filter(n => !n.is_pinned);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-900">Your Notes</h1>
        <p className="text-warm-600 mt-1">
          {hasNotes
            ? `${transformedNotes.length} note${transformedNotes.length === 1 ? '' : 's'} synced from your mobile app.`
            : 'Your synced notes will appear here.'}
        </p>
      </div>

      {hasNotes ? (
        <div className="space-y-8">
          {/* Pinned notes section */}
          {pinnedNotes.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-warm-500 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
                Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          )}

          {/* Regular notes */}
          {regularNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-medium text-warm-500 mb-4">Others</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-warm-200 p-12 text-center">
          <div className="w-20 h-20 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-warm-900 mb-3">No Notes Yet</h2>
          <p className="text-warm-600 max-w-md mx-auto mb-8">
            Create notes on the ToonNotes mobile app and enable cloud sync to see them here.
            Your notes will automatically appear once synced.
          </p>

          {/* Download CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://apps.apple.com/app/toonnotes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 bg-warm-900 text-white rounded-xl hover:bg-warm-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="font-medium">App Store</span>
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.toonnotes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              <span className="font-medium">Google Play</span>
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-warm-500">
            Already have the app?{' '}
            <Link href="/app/settings" className="text-teal-600 hover:text-teal-700">
              Check sync settings
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
