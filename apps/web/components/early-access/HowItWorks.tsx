'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

export function HowItWorks() {
  useEffect(() => {
    trackInteraction('section_viewed', { section: 'how_it_works' });
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Write anything',
      description: 'Checklists, journals, ideas—whatever you need. Just capture it.',
      visual: (
        <div className="bg-white rounded-xl border border-warm-200 p-4 shadow-sm">
          <div className="h-3 w-24 bg-warm-200 rounded mb-2" />
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-warm-100 rounded" />
            <div className="h-2 w-3/4 bg-warm-100 rounded" />
            <div className="h-2 w-5/6 bg-warm-100 rounded" />
          </div>
        </div>
      ),
    },
    {
      number: '2',
      title: 'AI organizes',
      description: 'Notes group themselves into boards automatically. No tags, no folders.',
      visual: (
        <div className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">#work</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">#ideas</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">#recipes</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-teal-600 font-medium">Auto-labeled</span>
          </div>
        </div>
      ),
    },
    {
      number: '3',
      title: 'Find instantly',
      description: 'Search finds it even if you don\'t remember the exact words.',
      visual: (
        <div className="bg-white rounded-xl border border-warm-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 bg-warm-50 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-warm-500">that client idea...</span>
          </div>
          <div className="mt-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
            <span className="text-xs text-teal-700">Found: &ldquo;Client proposal for Q2...&rdquo;</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            How it works
          </h2>
          <p className="text-warm-500 text-base md:text-lg max-w-xl mx-auto">
            Three simple steps. No setup required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-600 text-white font-bold rounded-full mb-6">
                {step.number}
              </div>

              {/* Visual */}
              <div className="mb-6 transform transition-transform hover:scale-105">
                {step.visual}
              </div>

              {/* Text */}
              <h3 className="font-semibold text-lg text-warm-900 mb-2">{step.title}</h3>
              <p className="text-warm-500 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Connection line for desktop */}
        <div className="hidden md:block relative -mt-[340px] mb-[280px]">
          <div className="absolute left-1/6 right-1/6 top-5 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200" />
        </div>
      </div>
    </section>
  );
}
