'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ScenePanel,
  PanelFrame,
  AgentNudge,
  PhoneMockup,
  ScrollProgress,
  ScrollIndicator,
} from '../components';

// Trip notes data
const tripNotes = [
  'Visit Shibuya crossing - must see at night!',
  'Try ramen in Shinjuku - @mike recommended Fuunji',
  'Book ryokan in Kyoto - traditional one with onsen',
  'Get JR Pass - 7 day or 14 day?',
  'TeamLab Borderless - tickets sell out fast!',
  'Tsukiji fish market - early morning',
  'Akihabara for anime stuff',
  'Cherry blossom forecast - check late March',
  'Currency: bring yen, many places cash only',
  'Pocket wifi vs SIM card?',
];

// Organized board columns
const organizedColumns = [
  {
    title: 'Before You Go',
    cards: [
      { text: 'JR Pass (order by Mar 1!)', urgent: true },
      { text: 'Currency exchange' },
      { text: 'Pocket wifi' },
      { text: 'Check blossom forecast' },
    ],
  },
  {
    title: 'Tokyo (Day 1-5)',
    cards: [
      { text: 'Shibuya crossing' },
      { text: 'TeamLab', urgent: true },
      { text: 'Ramen in Shinjuku' },
      { text: 'Tsukiji (morning!)' },
      { text: 'Akihabara' },
    ],
  },
  {
    title: 'Kyoto (Day 6-10)',
    cards: [
      { text: 'Book ryokan now!', urgent: true },
      { text: 'Fushimi Inari' },
      { text: 'Bamboo grove' },
      { text: 'Temple tour' },
    ],
  },
  {
    title: 'Osaka (Day 11-14)',
    cards: [
      { text: 'Day trip options' },
      { text: 'Street food tour' },
      { text: 'Dotonbori' },
    ],
  },
];

export default function TripPlanningScenario() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [dateSelected, setDateSelected] = useState(false);
  const [showOrganized, setShowOrganized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Hide scroll indicator after user starts scrolling
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      if (value > 0.05) {
        setShowScrollIndicator(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative">
      <ScrollProgress />

      {/* ========== SCENE 1: THE PAIN ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-warm-100 to-warm-50 overflow-hidden">
        {/* Background decorative notes (parallax) */}
        <ParallaxNotes scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
          {/* User avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-warm-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-warm-600 font-medium">Sarah&apos;s Story</span>
            </div>
          </motion.div>

          {/* Main quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-hand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-800 leading-tight mb-6">
              &ldquo;I have <span className="text-blue-600">50 scattered notes</span> about my Japan trip but{' '}
              <span className="text-coral-500">no actual plan.</span>&rdquo;
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-warm-500 max-w-2xl mx-auto"
          >
            Sound familiar? Let&apos;s see how the Manager Agent helped Sarah turn chaos into a plan.
          </motion.p>

          {/* Scroll indicator */}
          <ScrollIndicator show={showScrollIndicator} />
        </div>
      </section>

      {/* ========== SCENE 2: THE CHAOS ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-warm-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-warm-200 text-warm-600 rounded-full text-sm font-medium mb-4">
              Scene 2
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              The Chaos
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto">
              Sarah saves travel recommendations from TikTok, friends, and articles.
              They pile up with no organization...
            </p>
          </motion.div>

          {/* Chaotic notes visualization */}
          <div className="relative h-[500px] md:h-[600px]">
            <ChaoticNotesScene notes={tripNotes} />
          </div>
        </div>
      </section>

      {/* ========== SCENE 3: THE NUDGE ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-warm-50 to-blue-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-sm font-medium mb-4">
                Scene 3
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
                The AI Intervention
              </h2>
              <p className="text-warm-600 mb-6">
                The Manager Agent detects a pattern: 50+ notes tagged with travel-related content,
                no deadlines, no timeline. It&apos;s trip planning behavior without a plan.
              </p>

              <div className="space-y-3 text-warm-700">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">✓</span>
                  <span>Pattern detected: Trip planning</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">✓</span>
                  <span>52 related notes found</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">✓</span>
                  <span>No timeline or deadlines set</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Phone with nudge */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="flex justify-center"
            >
              <PhoneMockup>
                <AgentNudge
                  agent="manager"
                  message="Your Japan trip is coming together!"
                  subMessage="I found 52 notes about Japan."
                  animate={false}
                >
                  <div className="my-4 p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-warm-700 font-medium mb-2">When do you leave?</p>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDateSelected(true)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          dateSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        📅 March 15
                      </motion.button>
                      <button className="flex-1 px-3 py-2 bg-warm-100 text-warm-600 rounded-lg text-sm hover:bg-warm-200 transition-colors">
                        Not sure yet
                      </button>
                    </div>
                  </div>

                  {dateSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <p className="text-blue-800 text-sm">
                        Perfect! March 15 is in <strong>54 days</strong>.
                        <br />
                        Want me to help organize these into a trip timeline?
                      </p>
                      <button
                        onClick={() => setShowOrganized(true)}
                        className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        ✨ Create Trip Timeline
                      </button>
                    </motion.div>
                  )}
                </AgentNudge>
              </PhoneMockup>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SCENE 4: THE TRANSFORMATION ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-sm font-medium mb-4">
              Scene 4
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-2">
              The Transformation
            </h2>
            <p className="text-warm-600">
              One tap later: A complete day-by-day itinerary
            </p>
          </motion.div>

          {/* Board header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg border-2 border-blue-200">
              <span className="text-2xl">✈️</span>
              <div className="text-left">
                <h3 className="font-display text-lg font-bold text-warm-900">
                  Japan Trip - March 15-29
                </h3>
                <p className="text-sm text-warm-500">Organized by Manager Agent</p>
              </div>
            </div>
          </motion.div>

          {/* Kanban board */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {organizedColumns.map((column, colIndex) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: colIndex * 0.1 }}
                className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-xl"
              >
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3 border-b border-blue-200">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                    {column.title}
                  </h4>
                </div>
                <div className="p-3 space-y-2">
                  {column.cards.map((card, cardIndex) => (
                    <motion.div
                      key={cardIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: colIndex * 0.1 + cardIndex * 0.05 + 0.3 }}
                      className={`
                        px-3 py-2 rounded-lg text-sm
                        ${card.urgent
                          ? 'bg-amber-50 border-2 border-amber-300 text-amber-800 font-medium'
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

          {/* Confetti/celebration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <span className="text-5xl">✨🎉✨</span>
            <p className="mt-4 text-warm-600">
              Cities grouped. Deadlines flagged. Days organized.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== SCENE 5: THE RESULT ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              The Result
            </span>

            {/* Transformation tagline */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-10">
              <div className="px-6 py-4 bg-warm-100 rounded-2xl border-2 border-warm-200">
                <p className="text-warm-600 font-medium">50 random notes</p>
              </div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-3xl text-blue-500"
              >
                →
              </motion.div>

              <div className="px-6 py-4 bg-blue-100 rounded-2xl border-2 border-blue-300">
                <p className="text-blue-700 font-bold">One beautiful itinerary</p>
              </div>
            </div>

            <PanelFrame color="blue" className="max-w-2xl mx-auto">
              <div className="text-left">
                <p className="font-hand text-xl md:text-2xl text-warm-700 mb-4">
                  &ldquo;Your trip was hiding in your notes all along.
                  The Manager just helped you find it.&rdquo;
                </p>
                <p className="text-warm-500 text-sm">— The Manager Agent</p>
              </div>
            </PanelFrame>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              Ready to meet your Manager Agent?
            </h2>
            <p className="text-warm-600 mb-8 max-w-xl mx-auto">
              Download ToonNotes and let your scattered notes become actionable plans.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-700"
              >
                <AppleIcon className="h-6 w-6" />
                Download for iOS
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#'}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-warm-800 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-warm-900"
              >
                <PlayStoreIcon className="h-5 w-5" />
                Download for Android
              </Link>
            </div>

            {/* Other scenarios */}
            <div className="pt-8 border-t border-warm-200">
              <p className="text-sm text-warm-500 mb-4">Explore other scenarios:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/scenarios/idea-growth"
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  💡 Idea Growth
                </Link>
                <Link
                  href="/scenarios/recipe-tracking"
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  📚 Recipe Tracking
                </Link>
                <Link
                  href="/scenarios/memory-capsule"
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  📜 Memory Capsule
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function ParallaxNotes({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const notes = [
    { text: '🗾 Japan', x: '10%', y: '20%', motion: y1, color: '#E0F2FE' },
    { text: '🍜 Ramen', x: '80%', y: '30%', motion: y2, color: '#FFE4E6' },
    { text: '⛩️ Kyoto', x: '15%', y: '70%', motion: y3, color: '#EDE9FE' },
    { text: '🌸 Sakura', x: '75%', y: '65%', motion: y1, color: '#D1FAE5' },
    { text: '🎌 Tokyo', x: '5%', y: '45%', motion: y2, color: '#FED7AA' },
    { text: '🏯 Temple', x: '90%', y: '50%', motion: y3, color: '#DDD6FE' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {notes.map((note, i) => (
        <motion.div
          key={i}
          style={{
            left: note.x,
            top: note.y,
            y: note.motion,
            backgroundColor: note.color,
          }}
          className="absolute px-4 py-2 rounded-lg shadow-md opacity-40 text-sm"
        >
          {note.text}
        </motion.div>
      ))}
    </div>
  );
}

function ChaoticNotesScene({ notes }: { notes: string[] }) {
  const noteColors = ['#E0F2FE', '#FFE4E6', '#EDE9FE', '#FED7AA', '#D1FAE5', '#DDD6FE', '#FFFFFF'];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {notes.map((note, index) => {
        const angle = (index / notes.length) * Math.PI * 2;
        const radius = 120 + (index % 3) * 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.7;
        const rotation = (Math.random() - 0.5) * 30 - 5;
        const color = noteColors[index % noteColors.length];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            whileInView={{
              opacity: 1,
              scale: 1,
              x,
              y,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              type: 'spring',
              stiffness: 100,
            }}
            className="absolute"
            style={{ zIndex: index }}
          >
            <div
              className="relative px-4 py-3 rounded-lg shadow-lg border border-warm-200/50 max-w-[200px]"
              style={{
                backgroundColor: color,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Tape decoration */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-200/80 rounded-sm shadow-sm" />
              <p className="text-xs md:text-sm text-warm-700 font-medium leading-relaxed">
                {note}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Note counter in center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        className="absolute text-center bg-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-xl border-4 border-warm-200"
      >
        <span className="text-3xl font-bold text-warm-600">50</span>
        <span className="text-xs text-warm-500">notes</span>
      </motion.div>
    </div>
  );
}

// Icons
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
