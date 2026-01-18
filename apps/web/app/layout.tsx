import type { Metadata } from 'next';
import { Inter, Outfit, Caveat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AnalyticsProvider } from '@/components/providers';

// Font optimization - loaded at build time, self-hosted
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ToonNotes - AI-Powered Note Taking for Anime & Webtoon Fans',
    template: '%s | ToonNotes',
  },
  description:
    'Create beautifully styled notes with AI-generated designs. Perfect for tracking your anime watchlist, webtoon reading, and creative ideas.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://toonnotes.com'),
  openGraph: {
    title: 'ToonNotes',
    description: 'AI-powered note taking for anime & webtoon fans',
    url: 'https://toonnotes.com',
    siteName: 'ToonNotes',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToonNotes',
    description: 'AI-powered note taking for anime & webtoon fans',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${caveat.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
