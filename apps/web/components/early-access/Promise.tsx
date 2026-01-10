'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

export function Promise() {
  useEffect(() => {
    trackInteraction('section_viewed', { section: 'promise' });
  }, []);

  return (
    <section className="py-16 md:py-24 bg-warm-50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            What if your notes organized themselves?
          </h2>
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Before */}
          <div className="relative">
            <div className="absolute -top-3 left-4 bg-warm-300 text-warm-700 text-xs font-semibold px-3 py-1 rounded-full">
              Before
            </div>
            <div className="bg-white rounded-2xl border-2 border-warm-200 p-6 shadow-sm">
              <div className="space-y-3">
                {['Untitled', 'stuff', 'notes 3', 'Meeting notes', 'Random idea', 'Untitled (2)', 'things to do', 'asdfgh', 'Notes', 'hmm'].map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-warm-50"
                  >
                    <div className="w-3 h-3 rounded-sm bg-warm-300" />
                    <span className="text-warm-500 text-sm truncate">{title}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-warm-400 text-sm mt-4 italic">
                &ldquo;Where did I write that?&rdquo;
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Mobile Arrow */}
          <div className="flex md:hidden justify-center -my-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* After */}
          <div className="relative">
            <div className="absolute -top-3 left-4 bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              After
            </div>
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-6 shadow-lg">
              <div className="space-y-4">
                {[
                  { label: '#work-ideas', color: 'bg-blue-100 text-blue-700 border-blue-200', count: 12 },
                  { label: '#watchlist', color: 'bg-purple-100 text-purple-700 border-purple-200', count: 8 },
                  { label: '#recipes', color: 'bg-orange-100 text-orange-700 border-orange-200', count: 15 },
                  { label: '#journal', color: 'bg-pink-100 text-pink-700 border-pink-200', count: 23 },
                ].map((board, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border ${board.color}`}
                  >
                    <span className="font-medium">{board.label}</span>
                    <span className="text-sm opacity-70">{board.count} notes</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-teal-600 text-sm mt-4 font-medium">
                Found it in 2 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Key points */}
        <div className="mt-12 md:mt-16 grid sm:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: 'Write naturally',
              description: 'We detect topics automatically from your text',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ),
            },
            {
              title: 'AI organizes',
              description: 'Notes group themselves into boards automatically',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              title: 'Find instantly',
              description: 'Search finds it even if you don\'t remember the words',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
            },
          ].map((point, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-600 rounded-xl mb-4">
                {point.icon}
              </div>
              <h3 className="font-semibold text-warm-900 mb-2">{point.title}</h3>
              <p className="text-warm-500 text-sm">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
