'use client';

import { useState } from 'react';

interface ModeScenario {
  id: string;
  mode: 'manage' | 'develop' | 'organize' | 'experience';
  agent: string;
  title: string;
  pain: string;
  user: string;
  transformation: string;
  before: string;
  after: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const scenarios: ModeScenario[] = [
  {
    id: 'manage',
    mode: 'manage',
    agent: 'Manager',
    title: 'The Trip That Planned Itself',
    pain: 'I have 50 scattered notes about my Japan trip but no actual plan.',
    user: 'Sarah',
    transformation: '50 random notes → One beautiful itinerary',
    before: 'Scattered notes everywhere',
    after: 'Day-by-day timeline with deadlines',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: ClipboardIcon,
  },
  {
    id: 'develop',
    mode: 'develop',
    agent: 'Muse',
    title: 'The Idea That Grew Up',
    pain: 'I have great ideas but they die in my notes app.',
    user: 'Alex',
    transformation: 'A one-line idea → A business plan',
    before: 'Brief spark, unexpanded',
    after: 'Fully developed concept with next steps',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: LightbulbIcon,
  },
  {
    id: 'organize',
    mode: 'organize',
    agent: 'Librarian',
    title: 'The Recipe I Actually Used',
    pain: 'I save recipes but never cook them. They just sit there.',
    user: 'Jamie',
    transformation: 'Saved recipes → Recipes you actually cook',
    before: '128 recipes, never made',
    after: 'Favorites tracked, usage celebrated',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: FolderIcon,
  },
  {
    id: 'experience',
    mode: 'experience',
    agent: 'Biographer',
    title: 'The Memory That Came Back',
    pain: 'I journal but never look back at old entries.',
    user: 'Maya',
    transformation: 'Forgotten journals → Memories that return',
    before: 'First day entry, never opened',
    after: 'One year later reflection, growth visible',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: ClockIcon,
  },
];

export function ModeShowcase() {
  const [activeMode, setActiveMode] = useState<string>('manage');
  const activeScenario = scenarios.find((s) => s.id === activeMode) || scenarios[0];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-3">
            NEW IN v2.0
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            ToonNotes now understands{' '}
            <span className="text-teal-600">WHY</span> you&apos;re taking notes.
          </h2>
          <p className="text-lg md:text-xl text-warm-600 max-w-2xl mx-auto">
            Four AI personalities. One goal: Help you actually use what you capture.
          </p>
        </div>

        {/* Mode selector tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveMode(scenario.id)}
              className={`
                flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full
                text-sm md:text-base font-medium transition-all
                ${
                  activeMode === scenario.id
                    ? `${scenario.bgColor} ${scenario.color} ${scenario.borderColor} border-2`
                    : 'bg-warm-100 text-warm-600 border-2 border-transparent hover:bg-warm-200'
                }
              `}
            >
              <scenario.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{scenario.agent}</span>
              <span className="sm:hidden">{scenario.mode[0].toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Active scenario display */}
        <div
          className={`rounded-2xl md:rounded-3xl border-2 ${activeScenario.borderColor} ${activeScenario.bgColor} p-6 md:p-10 transition-all`}
        >
          {/* Scenario header */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div
              className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white ${activeScenario.borderColor} border-2`}
            >
              <activeScenario.icon className={`w-7 h-7 md:w-8 md:h-8 ${activeScenario.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${activeScenario.color} uppercase tracking-wide`}>
                  {activeScenario.agent} Agent
                </span>
                <span className="text-warm-400">|</span>
                <span className="text-sm text-warm-500">{activeScenario.mode.toUpperCase()} Mode</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-warm-900">
                {activeScenario.title}
              </h3>
            </div>
          </div>

          {/* Pain point quote */}
          <div className="mb-6 md:mb-8">
            <p className="font-hand text-xl md:text-2xl text-warm-600 italic">
              &ldquo;{activeScenario.pain}&rdquo;
            </p>
            <p className="text-sm text-warm-500 mt-2">— {activeScenario.user}</p>
          </div>

          {/* Before/After transformation */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Before */}
            <div className="rounded-xl bg-white/60 border border-warm-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warm-200 text-warm-600 text-xs font-bold">
                  1
                </span>
                <span className="text-sm font-medium text-warm-500 uppercase tracking-wide">
                  Before
                </span>
              </div>
              <p className="text-warm-700">{activeScenario.before}</p>
            </div>

            {/* Arrow (hidden on mobile, shown as text) */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <ArrowRightIcon className="w-6 h-6 text-warm-400" />
            </div>

            {/* After */}
            <div className={`rounded-xl bg-white border-2 ${activeScenario.borderColor} p-4 md:p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${activeScenario.bgColor} ${activeScenario.color} text-xs font-bold`}
                >
                  2
                </span>
                <span className={`text-sm font-medium ${activeScenario.color} uppercase tracking-wide`}>
                  After
                </span>
              </div>
              <p className="text-warm-900 font-medium">{activeScenario.after}</p>
            </div>
          </div>

          {/* Transformation tagline */}
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white border-2 ${activeScenario.borderColor}`}
            >
              <BeforeIcon className="w-5 h-5 text-warm-400" />
              <span className="text-warm-600">{activeScenario.transformation.split(' → ')[0]}</span>
              <ArrowRightIcon className={`w-4 h-4 ${activeScenario.color}`} />
              <span className={`font-semibold ${activeScenario.color}`}>
                {activeScenario.transformation.split(' → ')[1]}
              </span>
            </div>
          </div>
        </div>

        {/* MODE acronym explanation */}
        <div className="mt-10 md:mt-16 text-center">
          <p className="text-sm text-warm-500 mb-4">The MODE Framework</p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <ModeLetter letter="M" word="Manage" color="text-blue-600" bgColor="bg-blue-50" />
            <ModeLetter letter="O" word="Organize" color="text-green-600" bgColor="bg-green-50" />
            <ModeLetter letter="D" word="Develop" color="text-amber-600" bgColor="bg-amber-50" />
            <ModeLetter letter="E" word="Experience" color="text-purple-600" bgColor="bg-purple-50" />
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-10 md:mt-12 text-center px-2">
          <div className="inline-block rounded-xl md:rounded-2xl bg-teal-50 border border-teal-200 px-4 py-4 md:px-8 md:py-6">
            <p className="text-base md:text-lg text-teal-800">
              <span className="font-semibold">Key insight:</span> Notes are only useful if they lead to
              <em> action</em>, <em>creation</em>, <em>retrieval</em>, or <em>memory</em>.
              <br className="hidden md:block" />
              ToonNotes has an AI for each.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeLetter({
  letter,
  word,
  color,
  bgColor,
}: {
  letter: string;
  word: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${bgColor} ${color} font-bold`}>
        {letter}
      </span>
      <span className="text-sm text-warm-600">{word}</span>
    </div>
  );
}

// Icons

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
      />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function BeforeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}
