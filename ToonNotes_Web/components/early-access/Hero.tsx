'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

export function EarlyAccessHero() {
  useEffect(() => {
    trackInteraction('section_viewed', { section: 'hero' });
  }, []);

  const scrollToPainCards = () => {
    const painSection = document.getElementById('pain-cards');
    painSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-warm-50">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-32">
        <div className="text-center">
          {/* Early Access Badge */}
          <div className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Early Access
            </span>
          </div>

          {/* Main Headline - The Mirror */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-warm-900 mb-4 md:mb-6">
            Your notes know where
            <br />
            everything is.{' '}
            <span className="text-warm-400">You don&apos;t.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-warm-600 max-w-2xl mx-auto mb-8 md:mb-10 px-2">
            ToonNotes finds and organizes your notes automatically—so you never
            lose a thought again.
          </p>

          {/* CTA - Scroll to pain cards */}
          <button
            onClick={scrollToPainCards}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-700 hover:shadow-lg group"
          >
            See if this is for you
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-coral-100/30 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
