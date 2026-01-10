import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToonNotes - Notes for Webtoon & Anime Fans',
  description: 'Create beautiful, customizable notes with AI-powered designs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
