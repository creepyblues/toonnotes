import Link from 'next/link';

export const metadata = {
  title: 'Scenarios | ToonNotes',
  description: 'See how ToonNotes AI agents transform the way you use your notes',
};

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Scenarios-specific floating nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-200">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="font-display text-lg font-bold text-warm-900">
              ToonNotes
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/scenarios"
              className="text-sm text-warm-600 hover:text-warm-900 transition-colors"
            >
              All Scenarios
            </Link>
            <Link
              href="/features"
              className="hidden sm:block text-sm text-warm-600 hover:text-warm-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-full hover:bg-teal-700 transition-colors"
            >
              Download
            </Link>
          </div>
        </nav>
      </header>

      {/* Content with top padding for fixed header */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
