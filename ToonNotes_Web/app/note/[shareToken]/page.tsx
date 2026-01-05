import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SharedNoteCard } from '@/components/notes/SharedNoteCard';
import { SharedNoteData } from '@/lib/design-engine/types';

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

// Fetch shared note data
async function getSharedNote(shareToken: string): Promise<SharedNoteData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_shared_note', {
    p_share_token: shareToken,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as SharedNoteData;
}

// Dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareToken } = await params;
  const note = await getSharedNote(shareToken);

  if (!note) {
    return {
      title: 'Note Not Found',
      description: 'This shared note could not be found or has expired.',
    };
  }

  const title = note.title || 'Shared Note';
  const description =
    note.content?.slice(0, 160) || 'A note shared from ToonNotes';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toonnotes.com';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteUrl}/note/${shareToken}`,
      images: [
        {
          url: `/api/og?token=${shareToken}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?token=${shareToken}`],
    },
  };
}

export default async function SharedNotePage({ params }: PageProps) {
  const { shareToken } = await params;
  const note = await getSharedNote(shareToken);

  if (!note) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* ToonNotes branding */}
        <header className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="font-display text-xl font-semibold text-teal-600">
              ToonNotes
            </span>
          </Link>
        </header>

        {/* Shared note card */}
        <SharedNoteCard note={note} />

        {/* CTA to download app */}
        <footer className="mt-8 text-center">
          <p className="mb-4 text-warm-500">Create your own styled notes</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <AppStoreLink platform="ios" />
            <AppStoreLink platform="android" />
          </div>
        </footer>
      </div>
    </main>
  );
}

function AppStoreLink({ platform }: { platform: 'ios' | 'android' }) {
  const isIOS = platform === 'ios';
  const href = isIOS
    ? process.env.NEXT_PUBLIC_APP_STORE_URL || '#'
    : process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-warm-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-warm-800"
    >
      {isIOS ? (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span>App Store</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
          <span>Google Play</span>
        </>
      )}
    </Link>
  );
}
