'use client';

import { useEffect, useState } from 'react';
import { trackInteraction } from '@/lib/sessionTracking';

interface PainCard {
  id: string;
  title: string;
  reveal: string;
  icon: React.ReactNode;
}

const painCards: PainCard[] = [
  {
    id: 'retrieval',
    title: 'I have 500 notes and can\'t find anything',
    reveal: 'The more you capture, the more you lose. Classic.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'organization',
    title: 'I know I should organize, but I never do',
    reveal: 'You tell yourself you\'ll clean it up "later." Later never comes.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'sharing',
    title: 'My notes are chaos—I\'d never share them',
    reveal: 'Screenshots and bullet fragments nobody else would understand.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    id: 'fatigue',
    title: 'I\'ve tried Notion, Obsidian, everything',
    reveal: 'Power tools that made you feel powerless.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface PainCardsProps {
  selectedPains: string[];
  onSelectPain: (painId: string) => void;
}

export function PainCards({ selectedPains, onSelectPain }: PainCardsProps) {
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    trackInteraction('section_viewed', { section: 'pain_cards' });
  }, []);

  const handleCardClick = (painId: string) => {
    // Track the click
    trackInteraction('pain_card_clicked', { pain_type: painId });

    // Reveal the card
    setRevealedCards(prev => new Set([...prev, painId]));

    // Toggle selection
    onSelectPain(painId);
  };

  return (
    <section id="pain-cards" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-warm-900 mb-4">
            Which of these sounds familiar?
          </h2>
          <p className="text-warm-500 text-base md:text-lg">
            Click all that apply. We&apos;re building ToonNotes for people like you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {painCards.map((card) => {
            const isSelected = selectedPains.includes(card.id);
            const isRevealed = revealedCards.has(card.id);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  relative p-6 md:p-8 rounded-2xl border-2 text-left transition-all duration-300
                  ${isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-warm-200 bg-warm-50 hover:border-warm-300 hover:shadow-md'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className={`mb-4 ${isSelected ? 'text-teal-600' : 'text-warm-400'}`}>
                  {card.icon}
                </div>

                <h3 className={`font-semibold text-lg md:text-xl mb-2 ${isSelected ? 'text-teal-900' : 'text-warm-800'}`}>
                  {card.title}
                </h3>

                {/* Reveal message */}
                <p
                  className={`
                    text-sm md:text-base transition-all duration-300
                    ${isRevealed
                      ? 'opacity-100 max-h-20'
                      : 'opacity-0 max-h-0 overflow-hidden'
                    }
                    ${isSelected ? 'text-teal-700' : 'text-warm-500'}
                  `}
                >
                  {card.reveal}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selection count indicator */}
        {selectedPains.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-warm-500">
              <span className="font-semibold text-teal-600">{selectedPains.length}</span> selected
              {' '}&mdash;{' '}
              <a href="#signup" className="text-teal-600 hover:text-teal-700 underline">
                tell us more below
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
