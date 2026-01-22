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

// Initial idea notes (scattered thoughts)
const ideaNotes = [
  'Plant watering app idea',
  'People forget to water plants',
  'Could use sensors?',
  'Maybe subscription for plant tips',
  'Gamification - plant grows when you water',
  'Community feature - share plants',
  'Partner with nurseries?',
  'What about outdoor plants?',
];

// Expanded idea sections (after Muse intervention)
const expandedIdea = {
  coreProblem: {
    title: 'The Problem',
    content: 'Millions of houseplants die from irregular watering. Plant parents feel guilty and give up.',
    insight: 'People want to be good plant parents but life gets in the way.',
  },
  solution: {
    title: 'The Solution',
    features: [
      { text: 'Smart reminders based on plant type & season', icon: '🌱' },
      { text: 'Photo health check - AI detects problems', icon: '📸' },
      { text: 'Virtual plant grows with your real one', icon: '🎮' },
      { text: 'Community tips from experienced growers', icon: '👥' },
    ],
  },
  validation: {
    title: 'Why This Could Work',
    points: [
      '30M+ houseplant owners in US alone',
      'Plant care apps growing 40% YoY',
      'No dominant player in the market yet',
      'Hardware-free = low barrier to adoption',
    ],
  },
  nextSteps: {
    title: 'Next Steps',
    steps: [
      { text: 'Interview 10 plant owners', status: 'todo' },
      { text: 'Research competitor apps', status: 'todo' },
      { text: 'Sketch core user flow', status: 'todo' },
      { text: 'Build landing page MVP', status: 'todo' },
    ],
  },
};

export default function IdeaGrowthScenario() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [expandStep, setExpandStep] = useState(0);
  const [showExpanded, setShowExpanded] = useState(false);

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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-warm-50 overflow-hidden">
        {/* Background decorative lightbulbs (parallax) */}
        <ParallaxLightbulbs scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
          {/* User avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-warm-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-warm-600 font-medium">Alex&apos;s Story</span>
            </div>
          </motion.div>

          {/* Main quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-hand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-800 leading-tight mb-6">
              &ldquo;I have <span className="text-amber-600">great ideas</span> but they{' '}
              <span className="text-coral-500">die in my notes app.</span>&rdquo;
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-warm-500 max-w-2xl mx-auto"
          >
            Sound familiar? Let&apos;s see how the Muse Agent helped Alex turn a one-liner into a real plan.
          </motion.p>

          {/* Scroll indicator */}
          <ScrollIndicator show={showScrollIndicator} />
        </div>
      </section>

      {/* ========== SCENE 2: THE SPARK ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-warm-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Scene 2
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              The Spark
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto">
              Alex jots down ideas whenever inspiration strikes.
              Some have real potential... but they never go anywhere.
            </p>
          </motion.div>

          {/* Scattered idea notes visualization */}
          <div className="relative h-[500px] md:h-[600px]">
            <ScatteredIdeasScene notes={ideaNotes} />
          </div>
        </div>
      </section>

      {/* ========== SCENE 3: THE NUDGE ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-warm-50 to-amber-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-3 py-1 bg-amber-200 text-amber-700 rounded-full text-sm font-medium mb-4">
                Scene 3
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
                The AI Intervention
              </h2>
              <p className="text-warm-600 mb-6">
                The Muse Agent notices a pattern: 8 related notes about a &ldquo;plant app idea&rdquo;
                scattered over 3 weeks. This idea keeps coming back&mdash;but it&apos;s stuck at one line.
              </p>

              <div className="space-y-3 text-warm-700">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">✓</span>
                  <span>Pattern detected: Recurring idea</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">✓</span>
                  <span>8 related notes found</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">✓</span>
                  <span>Potential: High (keeps resurfacing)</span>
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
                  agent="muse"
                  message="This idea keeps coming back!"
                  subMessage="You've written about 'plant watering app' 8 times."
                  animate={false}
                >
                  <div className="my-4 p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-warm-700 font-medium mb-3">
                      Want to explore this further?
                    </p>
                    <div className="space-y-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandStep(1)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          expandStep >= 1
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        💡 Expand this idea
                      </motion.button>
                      <button className="w-full px-3 py-2 bg-warm-100 text-warm-600 rounded-lg text-sm hover:bg-warm-200 transition-colors">
                        Maybe later
                      </button>
                    </div>
                  </div>

                  {expandStep >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <p className="text-amber-800 text-sm mb-3">
                        I can help you develop this into something real.
                        Let me ask you a few questions...
                      </p>
                      <button
                        onClick={() => setShowExpanded(true)}
                        className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        ✨ Let&apos;s build this out
                      </button>
                    </motion.div>
                  )}
                </AgentNudge>
              </PhoneMockup>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SCENE 4: THE EXPANSION ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-amber-200 text-amber-700 rounded-full text-sm font-medium mb-4">
              Scene 4
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-2">
              The Expansion
            </h2>
            <p className="text-warm-600">
              Through guided questions, the Muse helps Alex think deeper
            </p>
          </motion.div>

          {/* Expanded idea cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Problem Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="font-display text-lg font-bold text-warm-900">
                  {expandedIdea.coreProblem.title}
                </h3>
              </div>
              <p className="text-warm-700 mb-3">{expandedIdea.coreProblem.content}</p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm italic">
                  💡 Insight: {expandedIdea.coreProblem.insight}
                </p>
              </div>
            </motion.div>

            {/* Solution Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="font-display text-lg font-bold text-warm-900">
                  {expandedIdea.solution.title}
                </h3>
              </div>
              <div className="space-y-3">
                {expandedIdea.solution.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3 p-2 bg-warm-50 rounded-lg"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-warm-700 text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Validation Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border-2 border-green-200 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="font-display text-lg font-bold text-warm-900">
                  {expandedIdea.validation.title}
                </h3>
              </div>
              <div className="space-y-2">
                {expandedIdea.validation.points.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-warm-700 text-sm">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Next Steps Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="font-display text-lg font-bold text-warm-900">
                  {expandedIdea.nextSteps.title}
                </h3>
              </div>
              <div className="space-y-2">
                {expandedIdea.nextSteps.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg"
                  >
                    <div className="w-5 h-5 rounded border-2 border-blue-300 flex items-center justify-center">
                      {/* Empty checkbox */}
                    </div>
                    <span className="text-warm-700 text-sm">{step.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Celebration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <span className="text-5xl">💡✨🚀</span>
            <p className="mt-4 text-warm-600">
              From one line to a complete idea brief. Ready to validate.
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
                <p className="text-warm-600 font-medium">A one-line idea</p>
              </div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-3xl text-amber-500"
              >
                →
              </motion.div>

              <div className="px-6 py-4 bg-amber-100 rounded-2xl border-2 border-amber-300">
                <p className="text-amber-700 font-bold">A complete idea brief</p>
              </div>
            </div>

            <PanelFrame color="amber" className="max-w-2xl mx-auto">
              <div className="text-left">
                <p className="font-hand text-xl md:text-2xl text-warm-700 mb-4">
                  &ldquo;Your idea wasn&apos;t bad&mdash;it just needed someone to ask the right questions.
                  That&apos;s what I&apos;m here for.&rdquo;
                </p>
                <p className="text-warm-500 text-sm">— The Muse Agent</p>
              </div>
            </PanelFrame>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              Ready to meet your Muse Agent?
            </h2>
            <p className="text-warm-600 mb-8 max-w-xl mx-auto">
              Download ToonNotes and turn your scattered ideas into actionable plans.
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
                  href="/scenarios/trip-planning"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  📋 Trip Planning
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

function ParallaxLightbulbs({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const items = [
    { text: '💡', x: '10%', y: '20%', motion: y1, color: '#FEF3C7' },
    { text: '✨', x: '85%', y: '25%', motion: y2, color: '#FDE68A' },
    { text: '🌱', x: '15%', y: '65%', motion: y3, color: '#D1FAE5' },
    { text: '💭', x: '80%', y: '60%', motion: y1, color: '#E0E7FF' },
    { text: '🚀', x: '5%', y: '45%', motion: y2, color: '#FECACA' },
    { text: '⚡', x: '90%', y: '45%', motion: y3, color: '#FEF9C3' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <motion.div
          key={i}
          style={{
            left: item.x,
            top: item.y,
            y: item.motion,
            backgroundColor: item.color,
          }}
          className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-md opacity-50 text-2xl"
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
}

function ScatteredIdeasScene({ notes }: { notes: string[] }) {
  const noteColors = ['#FEF3C7', '#FDE68A', '#FED7AA', '#FECACA', '#E0E7FF', '#D1FAE5', '#FFFFFF'];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {notes.map((note, index) => {
        const angle = (index / notes.length) * Math.PI * 2 + Math.PI / 4;
        const radius = 100 + (index % 3) * 50;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;
        const rotation = (Math.random() - 0.5) * 20;
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
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
            className="absolute"
            style={{ zIndex: index }}
          >
            <div
              className="relative px-4 py-3 rounded-lg shadow-lg border border-amber-200/50 max-w-[180px]"
              style={{
                backgroundColor: color,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Lightbulb decoration */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs shadow-sm">
                💡
              </div>
              <p className="text-xs md:text-sm text-warm-700 font-medium leading-relaxed">
                {note}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Idea counter in center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="absolute text-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl border-4 border-amber-300"
      >
        <span className="text-3xl">💡</span>
        <span className="text-sm font-bold text-amber-700 mt-1">1 idea</span>
        <span className="text-xs text-amber-600">8 fragments</span>
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
