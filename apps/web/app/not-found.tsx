import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-warm-50 px-4 py-8">
      <div className="text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <span className="font-display text-2xl font-bold text-teal-600">
            ToonNotes
          </span>
        </Link>

        {/* Error message */}
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-6xl">🔍</div>
          <h1 className="mb-4 font-display text-2xl font-bold text-warm-900">
            Page Not Found
          </h1>
          <p className="mb-8 text-warm-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>

          {/* Actions */}
          <Link
            href="/"
            className="inline-block rounded-full bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
