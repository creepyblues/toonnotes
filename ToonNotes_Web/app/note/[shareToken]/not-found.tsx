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
          <div className="mb-6 text-6xl">📝</div>
          <h1 className="mb-4 font-display text-2xl font-bold text-warm-900">
            Note Not Found
          </h1>
          <p className="mb-8 text-warm-600">
            This shared note could not be found. It may have been deleted,
            expired, or the link might be incorrect.
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-600"
            >
              Go to Homepage
            </Link>
            <p className="text-sm text-warm-500">
              Want to create your own notes?{' '}
              <Link href="/#download" className="text-teal-600 hover:underline">
                Download ToonNotes
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
