import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader variant="transparent" />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Minimal */}
      <footer className="border-t border-warm-200 bg-warm-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col items-center justify-between gap-4 md:gap-6 md:flex-row">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal-600">
                <span className="text-sm sm:text-base font-bold text-white">T</span>
              </div>
              <span className="font-display text-base sm:text-lg font-semibold text-warm-900">
                ToonNotes
              </span>
            </div>
            <div className="flex gap-6 sm:gap-8 text-sm text-warm-500">
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
            <p className="text-xs sm:text-sm text-warm-400">
              &copy; 2026 ToonNotes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
