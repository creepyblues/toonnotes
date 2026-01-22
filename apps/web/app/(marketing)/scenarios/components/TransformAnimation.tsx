'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Note {
  id: number;
  content: string;
  color: string;
}

interface BoardColumn {
  title: string;
  cards: { text: string; urgent?: boolean }[];
}

// Note data for the chaos state
const chaosNotes: Note[] = [
  { id: 1, content: 'Visit Shibuya crossing', color: '#E0F2FE' },
  { id: 2, content: 'Try ramen in Shinjuku', color: '#FFE4E6' },
  { id: 3, content: 'Book ryokan in Kyoto', color: '#EDE9FE' },
  { id: 4, content: 'Get JR Pass', color: '#FED7AA' },
  { id: 5, content: 'TeamLab Borderless', color: '#D1FAE5' },
  { id: 6, content: 'Tsukiji fish market', color: '#DDD6FE' },
  { id: 7, content: 'Akihabara anime', color: '#FFE4E6' },
  { id: 8, content: 'Cherry blossom check', color: '#D1FAE5' },
];

// Organized board columns
const organizedColumns: BoardColumn[] = [
  {
    title: 'Before You Go',
    cards: [
      { text: 'JR Pass', urgent: true },
      { text: 'Currency exchange' },
      { text: 'Pocket wifi' },
    ],
  },
  {
    title: 'Tokyo (Day 1-5)',
    cards: [
      { text: 'Shibuya crossing' },
      { text: 'TeamLab', urgent: true },
      { text: 'Ramen in Shinjuku' },
      { text: 'Tsukiji (morning!)' },
    ],
  },
  {
    title: 'Kyoto (Day 6-10)',
    cards: [
      { text: 'Book ryokan', urgent: true },
      { text: 'Fushimi Inari' },
      { text: 'Bamboo grove' },
    ],
  },
  {
    title: 'Osaka (Day 11-14)',
    cards: [
      { text: 'Street food tour' },
      { text: 'Dotonbori' },
    ],
  },
];

export function TransformAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Transform progress for the animation phases
  const chaosOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const boardOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const boardScale = useTransform(scrollYProgress, [0.4, 0.6], [0.8, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-5xl mx-auto px-4">
          {/* Chaos state */}
          <motion.div
            style={{ opacity: chaosOpacity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full max-w-md h-80 md:h-96">
              {chaosNotes.map((note, index) => {
                const angle = (index / chaosNotes.length) * Math.PI * 2;
                const radius = 100 + Math.random() * 50;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const rotation = (Math.random() - 0.5) * 40;

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x,
                      y,
                      rotate: rotation,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      type: 'spring',
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      backgroundColor: note.color,
                      zIndex: index,
                    }}
                  >
                    <div className="relative px-4 py-3 rounded-lg shadow-lg border border-warm-200/50 min-w-[140px]">
                      {/* Tape decoration */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-200/80 rounded-sm" />
                      <p className="text-sm text-warm-700 font-medium whitespace-nowrap">
                        {note.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Note counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
              >
                <span className="text-5xl font-bold text-warm-400">50</span>
                <p className="text-warm-500">scattered notes</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Organized board state */}
          <motion.div
            style={{ opacity: boardOpacity, scale: boardScale }}
            className="flex flex-col items-center"
          >
            {/* Board header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-warm-900 mb-2">
                Japan Trip - March 15-29
              </h3>
              <p className="text-warm-500">Organized by Manager Agent</p>
            </motion.div>

            {/* Kanban board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
              {organizedColumns.map((column, colIndex) => (
                <motion.div
                  key={column.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden shadow-lg"
                >
                  <div className="bg-blue-100 px-3 py-2 border-b border-blue-200">
                    <h4 className="text-xs md:text-sm font-bold text-blue-800 uppercase tracking-wide">
                      {column.title}
                    </h4>
                  </div>
                  <div className="p-2 space-y-2">
                    {column.cards.map((card, cardIndex) => (
                      <motion.div
                        key={cardIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: colIndex * 0.1 + cardIndex * 0.05 + 0.2 }}
                        viewport={{ once: true }}
                        className={`
                          px-2 py-1.5 rounded-md text-xs
                          ${card.urgent
                            ? 'bg-amber-100 border border-amber-300 text-amber-800'
                            : 'bg-warm-50 border border-warm-200 text-warm-700'
                          }
                        `}
                      >
                        {card.urgent && <span className="mr-1">⚠️</span>}
                        {card.text}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Confetti effect placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <span className="text-4xl">✨🎉✨</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Simpler version for inline use
export function BeforeAfterTransform({
  showAfter,
  onToggle,
}: {
  showAfter: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="mb-6 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
      >
        {showAfter ? 'Show Chaos' : 'Show Organization'}
      </button>

      <motion.div
        layout
        className="relative min-h-[400px] flex items-center justify-center"
      >
        {!showAfter ? (
          <motion.div
            key="chaos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full max-w-md h-80"
          >
            {chaosNotes.slice(0, 6).map((note, index) => {
              const x = (Math.random() - 0.5) * 150;
              const y = (Math.random() - 0.5) * 150;
              const rotation = (Math.random() - 0.5) * 30;

              return (
                <motion.div
                  key={note.id}
                  animate={{ x, y, rotate: rotation }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: note.color, zIndex: index }}
                >
                  <div className="px-4 py-3 rounded-lg shadow-lg border border-warm-200/50">
                    <p className="text-sm text-warm-700 font-medium whitespace-nowrap">
                      {note.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="organized"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl"
          >
            {organizedColumns.map((column) => (
              <div
                key={column.title}
                className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden shadow-lg"
              >
                <div className="bg-blue-100 px-3 py-2">
                  <h4 className="text-xs font-bold text-blue-800 uppercase">
                    {column.title}
                  </h4>
                </div>
                <div className="p-2 space-y-2">
                  {column.cards.map((card, i) => (
                    <div
                      key={i}
                      className={`
                        px-2 py-1.5 rounded-md text-xs
                        ${card.urgent
                          ? 'bg-amber-100 border border-amber-300 text-amber-800'
                          : 'bg-warm-50 border border-warm-200 text-warm-700'
                        }
                      `}
                    >
                      {card.urgent && '⚠️ '}
                      {card.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
