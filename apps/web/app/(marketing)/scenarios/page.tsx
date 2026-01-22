'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const scenarios = [
  {
    id: 'trip-planning',
    mode: 'MANAGE',
    agent: 'Manager',
    title: 'The Trip That Planned Itself',
    pain: 'I have 50 scattered notes about my Japan trip but no actual plan.',
    user: 'Sarah',
    transformation: '50 random notes → One beautiful itinerary',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    icon: '📋',
    available: true,
  },
  {
    id: 'idea-growth',
    mode: 'DEVELOP',
    agent: 'Muse',
    title: 'The Idea That Grew Up',
    pain: 'I have great ideas but they die in my notes app.',
    user: 'Alex',
    transformation: 'A one-line idea → A business plan',
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-500',
    icon: '💡',
    available: true,
  },
  {
    id: 'recipe-tracking',
    mode: 'ORGANIZE',
    agent: 'Librarian',
    title: 'The Recipe I Actually Used',
    pain: 'I save recipes but never cook them. They just sit there.',
    user: 'Jamie',
    transformation: 'Saved recipes → Recipes you actually cook',
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-500',
    icon: '📚',
    available: true,
  },
  {
    id: 'memory-capsule',
    mode: 'EXPERIENCE',
    agent: 'Biographer',
    title: 'The Memory That Came Back',
    pain: 'I journal but never look back at old entries.',
    user: 'Maya',
    transformation: 'Forgotten journals → Memories that return',
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-500',
    icon: '📜',
    available: true,
  },
];

export default function ScenariosIndex() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-b from-warm-100 to-warm-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
              MODE Framework Scenarios
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-warm-900 mb-6">
              See ToonNotes{' '}
              <span className="text-teal-600">in action</span>
            </h1>
            <p className="text-lg md:text-xl text-warm-600 max-w-2xl mx-auto">
              Explore how each AI agent transforms real scenarios into powerful outcomes.
              Interactive stories that show exactly how ToonNotes works.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Scenario Cards */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {scenario.available ? (
                  <Link
                    href={`/scenarios/${scenario.id}`}
                    className="group block"
                  >
                    <ScenarioCard scenario={scenario} />
                  </Link>
                ) : (
                  <div className="relative">
                    <ScenarioCard scenario={scenario} disabled />
                    <div className="absolute inset-0 bg-warm-50/80 rounded-2xl flex items-center justify-center">
                      <span className="px-4 py-2 bg-warm-200 text-warm-600 rounded-full text-sm font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white border-t border-warm-200">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
            Ready to transform your notes?
          </h2>
          <p className="text-warm-600 mb-8">
            Download ToonNotes and let AI help you actually use what you capture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-700"
            >
              Download ToonNotes
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-warm-100 px-8 py-4 text-lg font-semibold text-warm-700 transition-all hover:bg-warm-200"
            >
              Learn About MODE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScenarioCard({
  scenario,
  disabled = false,
}: {
  scenario: typeof scenarios[0];
  disabled?: boolean;
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200 group-hover:border-blue-400',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200 group-hover:border-amber-400',
      text: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200 group-hover:border-green-400',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200 group-hover:border-purple-400',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  const colors = colorClasses[scenario.color as keyof typeof colorClasses];

  return (
    <div
      className={`
        relative rounded-2xl border-2 ${colors.border} ${colors.bg}
        p-6 md:p-8 transition-all duration-300
        ${disabled ? '' : 'group-hover:shadow-xl group-hover:-translate-y-1'}
      `}
    >
      {/* Icon and mode badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{scenario.icon}</div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge} uppercase tracking-wide`}>
          {scenario.mode}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl md:text-2xl font-bold text-warm-900 mb-2">
        {scenario.title}
      </h3>

      {/* Agent */}
      <p className={`text-sm font-medium ${colors.text} mb-4`}>
        {scenario.agent} Agent
      </p>

      {/* Pain point */}
      <p className="font-hand text-lg text-warm-600 italic mb-4">
        &ldquo;{scenario.pain}&rdquo;
      </p>

      {/* User */}
      <p className="text-sm text-warm-500 mb-4">— {scenario.user}</p>

      {/* Transformation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-warm-500">{scenario.transformation.split(' → ')[0]}</span>
        <span className={colors.text}>→</span>
        <span className={`font-semibold ${colors.text}`}>
          {scenario.transformation.split(' → ')[1]}
        </span>
      </div>

      {/* View button */}
      {!disabled && (
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-teal-600 group-hover:text-teal-700">
          <span>Explore this scenario</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </div>
  );
}
