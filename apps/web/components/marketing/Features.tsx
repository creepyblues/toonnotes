interface Feature {
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
  icon: React.ComponentType<{ className?: string }>;
}

const features: Feature[] = [
  {
    title: 'Mark Boards',
    description:
      'Organize notes by objective—Trip Planning, Study Notes, Writing Projects. See them laid out beautifully in board view.',
    status: 'available',
    icon: BoardIcon,
  },
  {
    title: 'Auto-Labeling',
    description:
      'AI reads your notes and suggests labels automatically. Swipe down to accept. No manual tagging required.',
    status: 'available',
    icon: TagIcon,
  },
  {
    title: 'AI Design',
    description:
      'Upload any image. AI extracts colors and style. Apply it to your notes instantly for a personalized look.',
    status: 'available',
    icon: SparkleIcon,
  },
];

const comingSoonFeatures = [
  'Smart Grouping',
  'Summaries',
  'Visual Layouts',
  'Shareable Outputs',
];

export function Features() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section intro */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            Here&apos;s what you can do today.
          </h2>
        </div>

        {/* Feature cards */}
        <div className="space-y-4 md:space-y-8 mb-12 md:mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Coming soon */}
        <div className="text-center">
          <p className="text-base md:text-lg text-warm-600 mb-4 md:mb-6">
            And we&apos;re just getting started.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {comingSoonFeatures.map((name, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-warm-100 text-warm-600 text-xs md:text-sm"
              >
                <ClockIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-teal-100">
            <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-teal-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <h3 className="font-display text-lg md:text-xl font-bold text-warm-900">
              {feature.title}
            </h3>
            <StatusBadge status={feature.status} />
          </div>
          <p className="text-base md:text-lg text-warm-600">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'available' | 'coming-soon' }) {
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
        <CheckCircleIcon className="w-4 h-4" />
        Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-200 text-warm-600 text-sm font-medium">
      <ClockIcon className="w-4 h-4" />
      Coming soon
    </span>
  );
}

function BoardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
