export function PainPoints() {
  const painPoints = [
    {
      quote: "I save everything but can't find anything.",
      icon: SearchIcon,
    },
    {
      quote: "I should organize my notes... but I never do.",
      icon: FolderIcon,
    },
    {
      quote: "My notes are an ugly mess. I don't even want to look.",
      icon: EyeOffIcon,
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section intro */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            Heavy note-takers have a problem.
          </h2>
        </div>

        {/* Pain point cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-10 md:mb-16">
          {painPoints.map((pain, index) => (
            <div
              key={index}
              className="rounded-2xl border border-warm-200 bg-warm-50 p-5 md:p-8 text-center"
            >
              <div className="mb-3 md:mb-4 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-warm-200">
                <pain.icon className="w-5 h-5 md:w-6 md:h-6 text-warm-600" />
              </div>
              <p className="font-hand text-lg md:text-xl text-warm-700">
                &ldquo;{pain.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Power tools callout */}
        <div className="text-center max-w-2xl mx-auto px-2">
          <p className="text-base md:text-lg text-warm-600 mb-3 md:mb-4">
            You&apos;ve tried the power tools.
            <br />
            <span className="font-semibold text-warm-700">Notion. Obsidian. Roam.</span>
          </p>
          <p className="text-base md:text-lg text-warm-600 mb-3 md:mb-4">
            Too much setup. Too much maintenance.
          </p>
          <p className="text-lg md:text-xl font-semibold text-warm-900">
            You need something that just works.
          </p>
        </div>
      </div>
    </section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
