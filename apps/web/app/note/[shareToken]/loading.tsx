export default function Loading() {
  return (
    <main className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header skeleton */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-warm-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-warm-200" />
          </div>
        </header>

        {/* Note card skeleton */}
        <div className="overflow-hidden rounded-xl bg-white shadow-card">
          <div className="p-8">
            {/* Title skeleton */}
            <div className="mb-4 h-8 w-2/3 animate-pulse rounded bg-warm-200" />

            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-warm-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-warm-100" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-warm-100" />
              <div className="h-4 w-full animate-pulse rounded bg-warm-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-warm-100" />
            </div>

            {/* Labels skeleton */}
            <div className="mt-6 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-warm-100" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-warm-100" />
            </div>
          </div>
        </div>

        {/* Footer skeleton */}
        <footer className="mt-8 text-center">
          <div className="mx-auto mb-4 h-4 w-40 animate-pulse rounded bg-warm-200" />
          <div className="flex justify-center gap-3">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-warm-200" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-warm-200" />
          </div>
        </footer>
      </div>
    </main>
  );
}
