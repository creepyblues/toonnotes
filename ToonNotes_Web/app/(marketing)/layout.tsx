import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation - Minimal & Premium */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="font-display text-xl font-bold text-warm-900">
              ToonNotes
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="hidden sm:block text-sm font-medium text-warm-600 transition-colors hover:text-warm-900"
            >
              Features
            </Link>
            <DownloadButton />
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Minimal */}
      <footer className="border-t border-warm-200 bg-warm-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <span className="text-base font-bold text-white">T</span>
              </div>
              <span className="font-display text-lg font-semibold text-warm-900">
                ToonNotes
              </span>
            </div>
            <div className="flex gap-8 text-sm text-warm-500">
              <Link href="/privacy" className="hover:text-warm-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-warm-900 transition-colors">
                Terms
              </Link>
              <a
                href="mailto:hello@toonnotes.com"
                className="hover:text-warm-900 transition-colors"
              >
                Contact
              </a>
            </div>
            <p className="text-sm text-warm-400">
              &copy; 2026 ToonNotes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DownloadButton() {
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || '#';

  return (
    <Link
      href={appStoreUrl}
      className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-md"
    >
      Download
    </Link>
  );
}
