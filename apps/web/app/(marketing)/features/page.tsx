'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FeaturesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-warm-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-4">
              MODE Framework
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-warm-900 mb-6">
              Four AI agents.
              <br />
              <span className="text-teal-600">One goal.</span>
            </h1>
            <p className="text-lg md:text-xl text-warm-600 max-w-2xl mx-auto">
              Help you actually use what you capture. ToonNotes v2.0 understands{' '}
              <em>why</em> you&apos;re taking notes—and helps accordingly.
            </p>
          </div>
        </div>
      </section>

      {/* MODE Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-4 md:gap-6">
            <ModeCard
              letter="M"
              word="Manage"
              agent="Manager"
              description="Turn scattered notes into actionable plans"
              color="blue"
            />
            <ModeCard
              letter="O"
              word="Organize"
              agent="Librarian"
              description="Find and track what you save"
              color="green"
            />
            <ModeCard
              letter="D"
              word="Develop"
              agent="Muse"
              description="Grow ideas from sparks to reality"
              color="amber"
            />
            <ModeCard
              letter="E"
              word="Experience"
              agent="Biographer"
              description="Resurface memories at the right moment"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Scenario Deep Dives */}
      <ScenarioSection
        id="manage"
        mode="MANAGE"
        agent="Manager"
        color="blue"
        title="The Trip That Planned Itself"
        pain="I have 50 scattered notes about my Japan trip but no actual plan."
        user="Sarah"
        story={[
          'Sarah saves travel tips from TikTok, friends, and articles.',
          'Notes pile up: "Visit Shibuya", "Try ramen in Shinjuku", "Book ryokan in Kyoto"...',
          'Manager Agent detects the pattern: trip planning, no timeline.',
          'Nudge appears: "Your Japan trip is coming together! When do you leave?"',
          'Sarah sets: March 15',
          'Manager creates: A day-by-day itinerary with cities grouped and deadlines flagged.',
        ]}
        transformation="50 random notes → One beautiful itinerary"
        nudgeText="Your Japan trip is coming together! When do you leave?"
      />

      <ScenarioSection
        id="develop"
        mode="DEVELOP"
        agent="Muse"
        color="amber"
        title="The Idea That Grew Up"
        pain="I have great ideas but they die in my notes app."
        user="Alex"
        story={[
          'Alex captures a spark: "App that helps readers find books by mood, not genre"',
          'The note sits for 3 days, untouched.',
          'Muse Agent notices: brief idea, unexpanded, has potential.',
          'Nudge offers three paths: "Go deeper", "Flip it", or "Audience"',
          'Alex picks "Audience" and writes about who would use this.',
          'Idea progresses: Spark → Explored → Developed → Ready for action.',
        ]}
        transformation="A one-line idea → A business plan"
        nudgeText="This spark has potential! Want to explore it?"
      />

      <ScenarioSection
        id="organize"
        mode="ORGANIZE"
        agent="Librarian"
        color="green"
        title="The Recipe I Actually Used"
        pain="I save recipes but never cook them. They just sit there."
        user="Jamie"
        story={[
          'Jamie saves a TikTok cookie recipe. Auto-tagged: #recipe #dessert #cookies',
          '6 months later, Jamie searches "cookies" and finds it instantly.',
          'Makes the cookies. Prompt appears: "Did you make this?"',
          'Taps "Yes!" — Usage tracked. Rating added. Notes saved.',
          'Makes it again. And again. Third time...',
          'Librarian celebrates: "You\'ve made this 3 times! It\'s a favorite!"',
        ]}
        transformation="Saved recipes → Recipes you actually cook"
        nudgeText="Did you make this recipe?"
      />

      <ScenarioSection
        id="experience"
        mode="EXPERIENCE"
        agent="Biographer"
        color="purple"
        title="The Memory That Came Back"
        pain="I journal but never look back at old entries."
        user="Maya"
        story={[
          'January 15, 2025: Maya writes "First day at the new job. So nervous..."',
          'Life moves on. The entry is never opened again.',
          'January 15, 2026: Biographer surfaces the memory.',
          '"One year ago today..." The entry appears.',
          'Maya reads it, smiles at how scared she was, writes a reflection.',
          '"You now lead the team. I\'m proud of us." Two memories connected.',
        ]}
        transformation="Forgotten journals → Memories that return"
        nudgeText="One year ago today..."
      />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-teal-600">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to meet your AI team?
          </h2>
          <p className="text-lg text-teal-100 mb-8">
            Download ToonNotes and let your notes finally go somewhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-teal-600 transition-all hover:bg-teal-50"
            >
              <AppleIcon className="h-6 w-6" />
              Download for iOS
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#'}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-teal-700 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-800"
            >
              <PlayStoreIcon className="h-5 w-5" />
              Download for Android
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Components

function ModeCard({
  letter,
  word,
  agent,
  description,
  color,
}: {
  letter: string;
  word: string;
  agent: string;
  description: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  const letterBg = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    purple: 'bg-purple-100',
  };

  return (
    <Link
      href={`#${word.toLowerCase()}`}
      className={`rounded-2xl border-2 ${colorClasses[color]} p-5 md:p-6 transition-all hover:shadow-lg`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${letterBg[color]} mb-4`}>
        <span className="text-2xl font-bold">{letter}</span>
      </div>
      <h3 className="font-display text-lg font-bold text-warm-900 mb-1">{word}</h3>
      <p className="text-sm text-warm-500 mb-2">{agent} Agent</p>
      <p className="text-sm text-warm-600">{description}</p>
    </Link>
  );
}

function ScenarioSection({
  id,
  mode,
  agent,
  color,
  title,
  pain,
  user,
  story,
  transformation,
  nudgeText,
}: {
  id: string;
  mode: string;
  agent: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
  title: string;
  pain: string;
  user: string;
  story: string[];
  transformation: string;
  nudgeText: string;
}) {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
  };

  const borderColor = {
    blue: 'border-blue-200',
    green: 'border-green-200',
    amber: 'border-amber-200',
    purple: 'border-purple-200',
  };

  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
  };

  const sectionBg = {
    blue: 'bg-white',
    green: 'bg-warm-50',
    amber: 'bg-white',
    purple: 'bg-warm-50',
  };

  return (
    <section id={id} className={`py-16 md:py-24 ${sectionBg[color]}`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <span className={`text-sm font-semibold ${textColor[color]} uppercase tracking-wide`}>
            {mode} Mode | {agent} Agent
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mt-2 mb-4">
            {title}
          </h2>
          <p className="font-hand text-xl md:text-2xl text-warm-600 italic">
            &ldquo;{pain}&rdquo;
          </p>
          <p className="text-sm text-warm-500 mt-2">— {user}</p>
        </div>

        {/* Story flow */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">
          {/* Story steps */}
          <div className="space-y-4">
            {story.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${bgColor[color]} ${textColor[color]} flex items-center justify-center text-sm font-bold`}
                >
                  {index + 1}
                </div>
                <p className="text-warm-700 pt-1">{step}</p>
              </div>
            ))}
          </div>

          {/* Nudge mockup */}
          <div className={`rounded-2xl border-2 ${borderColor[color]} ${bgColor[color]} p-6 md:p-8`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${bgColor[color]} flex items-center justify-center`}>
                {color === 'blue' && <ClipboardIcon className={`w-5 h-5 ${textColor[color]}`} />}
                {color === 'amber' && <LightbulbIcon className={`w-5 h-5 ${textColor[color]}`} />}
                {color === 'green' && <FolderIcon className={`w-5 h-5 ${textColor[color]}`} />}
                {color === 'purple' && <ClockIcon className={`w-5 h-5 ${textColor[color]}`} />}
              </div>
              <span className={`text-sm font-semibold ${textColor[color]}`}>{agent} Agent</span>
            </div>
            <p className="text-lg text-warm-800 font-medium mb-4">{nudgeText}</p>
            <div className="space-y-2">
              <button
                className={`w-full rounded-lg ${bgColor[color]} border ${borderColor[color]} px-4 py-2 text-sm ${textColor[color]} font-medium hover:bg-white transition-colors`}
              >
                Continue
              </button>
              <button className="w-full rounded-lg bg-white border border-warm-200 px-4 py-2 text-sm text-warm-500 hover:bg-warm-50 transition-colors">
                Not now
              </button>
            </div>
          </div>
        </div>

        {/* Transformation result */}
        <div className="text-center">
          <div
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white border-2 ${borderColor[color]} shadow-sm`}
          >
            <span className="text-warm-600">{transformation.split(' → ')[0]}</span>
            <ArrowRightIcon className={`w-5 h-5 ${textColor[color]}`} />
            <span className={`font-semibold ${textColor[color]}`}>{transformation.split(' → ')[1]}</span>
          </div>
        </div>
      </div>
    </section>
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
