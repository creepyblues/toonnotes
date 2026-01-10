'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

export function DesignShowcase() {
  useEffect(() => {
    trackInteraction('section_viewed', { section: 'design_showcase' });
  }, []);

  // Sample designs with different color themes
  const designs = [
    {
      id: 'anime',
      bg: 'bg-gradient-to-br from-pink-100 to-purple-100',
      border: 'border-pink-300',
      title: 'Anime aesthetic',
    },
    {
      id: 'minimal',
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      border: 'border-gray-300',
      title: 'Clean minimal',
    },
    {
      id: 'nature',
      bg: 'bg-gradient-to-br from-green-100 to-emerald-100',
      border: 'border-green-300',
      title: 'Nature vibes',
    },
    {
      id: 'warm',
      bg: 'bg-gradient-to-br from-orange-100 to-amber-100',
      border: 'border-orange-300',
      title: 'Cozy warmth',
    },
  ];

  const handleDesignClick = (designId: string) => {
    trackInteraction('design_example_clicked', { design_type: designId });
  };

  return (
    <section className="py-16 md:py-24 bg-warm-50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            Notes that actually look like you
          </h2>
          <p className="text-warm-500 text-base md:text-lg max-w-xl mx-auto">
            Turn any image into a custom note theme. Your favorite webtoon panel, a cozy caf&eacute; photo, or that sunset you saved.
          </p>
        </div>

        {/* Design grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => handleDesignClick(design.id)}
              className={`
                group relative aspect-[3/4] rounded-2xl border-2 overflow-hidden
                transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${design.bg} ${design.border}
              `}
            >
              {/* Simulated note content */}
              <div className="absolute inset-4 flex flex-col">
                <div className="h-2 w-16 bg-white/50 rounded mb-3" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-1.5 w-full bg-white/40 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/40 rounded" />
                  <div className="h-1.5 w-5/6 bg-white/40 rounded" />
                  <div className="h-1.5 w-2/3 bg-white/40 rounded" />
                </div>
              </div>

              {/* Label on hover */}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <span className="text-white text-xs font-medium">{design.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Supporting text */}
        <p className="text-center text-warm-400 text-sm mt-8">
          Because your notes should feel personal, not like a corporate document.
        </p>
      </div>
    </section>
  );
}
