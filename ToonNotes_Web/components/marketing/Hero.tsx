import Link from 'next/link';

interface HeroProps {
  appStoreUrl: string;
  playStoreUrl: string;
}

export function Hero({ appStoreUrl, playStoreUrl }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-50">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="text-center">
          {/* Pain point quote */}
          <div className="mb-8">
            <p className="font-hand text-2xl text-warm-500 md:text-3xl">
              &ldquo;I have 100 notes somewhere.
            </p>
            <p className="font-hand text-2xl text-warm-500 md:text-3xl">
              I can&apos;t find anything.&rdquo;
            </p>
          </div>

          {/* Empathy hook */}
          <p className="text-lg text-warm-600 md:text-xl mb-12">
            Sound familiar?
          </p>

          {/* Main value proposition */}
          <h1 className="font-display text-4xl font-bold leading-tight text-warm-900 md:text-5xl lg:text-6xl mb-6">
            AI organizes your notes.
            <br />
            <span className="text-teal-600">Beautifully.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-warm-600 md:text-xl max-w-2xl mx-auto mb-10">
            ToonNotes uses AI to automatically organize your notes and make them
            look amazing&mdash;so you get the benefits of a second brain without the work.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href={appStoreUrl}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg"
            >
              <AppleIcon className="h-6 w-6" />
              Download for iOS
            </Link>
            <Link
              href={playStoreUrl}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-warm-800 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-warm-900 hover:shadow-lg"
            >
              <PlayStoreIcon className="h-5 w-5" />
              Download for Android
            </Link>
          </div>

          {/* Trust signal */}
          <p className="text-sm text-warm-400">
            Free to use. No account required.
          </p>
        </div>
      </div>

      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral-100/30 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}
