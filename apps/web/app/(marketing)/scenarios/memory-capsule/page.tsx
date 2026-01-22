'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ScenePanel,
  PanelFrame,
  AgentNudge,
  PhoneMockup,
  ScrollProgress,
  SceneIndicator,
  ScrollIndicator,
} from '../components';

// Scene definitions for indicator
const scenes = [
  { id: 'pain', label: 'The Problem' },
  { id: 'entry', label: 'The Entry' },
  { id: 'time', label: 'Time Passes' },
  { id: 'nudge', label: 'The Nudge' },
  { id: 'reflection', label: 'The Reflection' },
  { id: 'capsule', label: 'Time Capsule' },
  { id: 'pattern', label: 'The Pattern' },
  { id: 'cta', label: 'Get Started' },
];

// Journal entry component with vintage paper styling
function JournalEntry({
  date,
  title,
  content,
  tags,
  faded = false,
  showCursor = false,
}: {
  date: string;
  title: string;
  content: string;
  tags?: string[];
  faded?: boolean;
  showCursor?: boolean;
}) {
  return (
    <motion.div
      className={`
        bg-amber-50 rounded-lg border-2 border-amber-200 p-6 max-w-md
        shadow-lg font-mono text-sm
        ${faded ? 'opacity-70 sepia' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: faded ? 0.7 : 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-warm-900 text-base">{title}</h3>
        <span className="text-xs text-warm-500">{date}</span>
      </div>
      <div className="space-y-3 text-warm-700 leading-relaxed">
        {content.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        {showCursor && (
          <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Time passage visualization with milestones
function TimePassageVisualization() {
  const milestones = [
    { month: 'Feb 2025', event: 'Survived first month', icon: '✓' },
    { month: 'Apr 2025', event: 'First positive review', icon: '⭐' },
    { month: 'Jul 2025', event: 'Led first project', icon: '📊' },
    { month: 'Oct 2025', event: 'Mentored a new hire', icon: '🤝' },
    { month: 'Dec 2025', event: 'Promoted to team lead', icon: '🎉' },
  ];

  return (
    <div className="relative max-w-lg mx-auto">
      {/* Central timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-400 to-purple-600" />

      <div className="space-y-8 py-8">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.month}
            className={`
              flex items-center gap-4
              ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}
            `}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
          >
            <div
              className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
            >
              <div className="inline-block bg-white rounded-lg shadow-md p-3 border border-purple-100">
                <div className="text-2xl mb-1">{milestone.icon}</div>
                <div className="text-xs text-purple-600 font-medium">
                  {milestone.month}
                </div>
                <div className="text-sm text-warm-700">{milestone.event}</div>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow-md z-10" />
            <div className="flex-1" />
          </motion.div>
        ))}
      </div>

      {/* Faded journal entry at bottom */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-warm-500 italic">
          All while that first-day entry sits untouched...
        </p>
      </motion.div>
    </div>
  );
}

// On This Day notification card
function OnThisDayCard({
  yearsAgo,
  title,
  snippet,
  onAction,
}: {
  yearsAgo: number;
  title: string;
  snippet: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-5 max-w-sm shadow-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-2 text-purple-600 mb-4">
        <span className="text-2xl">📜</span>
        <span className="font-medium">
          {yearsAgo} year{yearsAgo > 1 ? 's' : ''} ago today
        </span>
      </div>

      <div className="bg-white/80 rounded-lg p-4 mb-4 border border-purple-100">
        <h4 className="font-semibold text-warm-900 mb-1 text-sm">{title}</h4>
        <p className="text-warm-600 text-sm italic">&ldquo;{snippet}&rdquo;</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onAction}
          className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          Read full entry
        </button>
        <button className="w-full py-2 px-4 bg-white border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
          Write a reflection
        </button>
      </div>
    </motion.div>
  );
}

// Time Capsule component showing connected memories
function TimeCapsule() {
  return (
    <motion.div
      className="bg-white rounded-2xl border-2 border-purple-200 p-6 max-w-xl shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-2 text-purple-600 mb-4">
        <span className="text-2xl">📜</span>
        <span className="font-bold text-lg">Time Capsule</span>
      </div>

      <div className="text-sm text-warm-600 mb-6">
        January 15: Work Anniversary
      </div>

      {/* Connected memories */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-300 to-purple-500" />

        {/* Year 1 - Original entry */}
        <motion.div
          className="relative pl-12 pb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-purple-300 border-2 border-white" />
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                2025 - Year 1
              </span>
              <span className="text-xs text-warm-500">Original entry</span>
            </div>
            <h4 className="font-medium text-warm-900 text-sm mb-1">
              &ldquo;First Day at Meridian&rdquo;
            </h4>
            <p className="text-xs text-warm-600">
              Feeling: Nervous, hopeful
            </p>
          </div>
        </motion.div>

        {/* Arrow connector */}
        <motion.div
          className="text-center text-purple-400 my-2 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span className="bg-white px-2 text-sm">↓ One year later</span>
        </motion.div>

        {/* Year 2 - Reflection */}
        <motion.div
          className="relative pl-12 pt-4"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-purple-500 border-2 border-white" />
          <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-0.5 rounded">
                2026 - Year 2
              </span>
              <span className="text-xs text-warm-500">Reflection</span>
            </div>
            <h4 className="font-medium text-warm-900 text-sm mb-1">
              &ldquo;Oh past Maya. You were SO scared...&rdquo;
            </h4>
            <p className="text-xs text-warm-600">Feeling: Proud, grateful</p>
          </div>
        </motion.div>
      </div>

      {/* Future triggers */}
      <motion.div
        className="mt-6 pt-4 border-t border-purple-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-purple-600 font-medium mb-2">
          This memory will resurface:
        </p>
        <ul className="text-sm text-warm-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-purple-400">•</span> January 15, 2027
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">•</span> When you write about
            Meridian
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">•</span> When you write about new
            beginnings
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

// Pattern memory cards showing ongoing surfacing
function PatternMemoryCards() {
  const patterns = [
    {
      type: 'On This Day',
      icon: '📜',
      timeAgo: '3 years ago today',
      content:
        '"Adopted Luna from the shelter today. She\'s hiding under the bed..."',
      note: 'Luna is now your profile picture. 🐱',
    },
    {
      type: 'Related memory',
      icon: '📜',
      trigger: 'You mentioned "nervous about the presentation"...',
      content: 'Last time you felt this way:\n"Nervous about the job interview"',
      note: '(You got the job.)\nYou\'ve got this. 💪',
    },
    {
      type: 'Pattern detected',
      icon: '📜',
      content: "You've written 52 entries about \"work\" over the past year.",
      action: 'View Work Timeline',
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {patterns.map((pattern, index) => (
        <motion.div
          key={pattern.type}
          className="bg-white rounded-xl border border-purple-200 p-4 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 }}
        >
          <div className="flex items-center gap-2 text-purple-600 mb-3">
            <span className="text-lg">{pattern.icon}</span>
            <span className="text-xs font-medium">{pattern.type}</span>
          </div>

          {pattern.timeAgo && (
            <div className="text-sm font-medium text-purple-700 mb-2">
              {pattern.timeAgo}
            </div>
          )}

          {pattern.trigger && (
            <p className="text-xs text-warm-600 mb-2 italic">
              {pattern.trigger}
            </p>
          )}

          <p className="text-sm text-warm-700 whitespace-pre-line mb-2">
            {pattern.content}
          </p>

          {pattern.note && (
            <p className="text-xs text-purple-600 whitespace-pre-line">
              {pattern.note}
            </p>
          )}

          {pattern.action && (
            <button className="mt-3 w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
              {pattern.action}
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Reflection writing interface
function ReflectionInterface({ reflection }: { reflection: string }) {
  const [showFullReflection, setShowFullReflection] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl border-2 border-purple-200 shadow-xl max-w-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="bg-purple-50 px-5 py-3 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <span className="font-medium text-purple-700">Biographer Agent</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-warm-600 mb-2">One year has passed.</p>
        <p className="text-warm-700 font-medium mb-4">
          A lot can change in a year.
          <br />
          What would you tell your past self?
        </p>

        {/* Writing area */}
        <motion.div
          className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[120px]"
          animate={{ height: showFullReflection ? 'auto' : 120 }}
        >
          {showFullReflection ? (
            <motion.p
              className="text-sm text-warm-700 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {reflection}
            </motion.p>
          ) : (
            <div className="flex items-center text-warm-400">
              <span className="w-0.5 h-5 bg-purple-400 animate-pulse" />
            </div>
          )}
        </motion.div>

        {!showFullReflection && (
          <motion.button
            onClick={() => setShowFullReflection(true)}
            className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            See Maya&apos;s reflection
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Floating journal entries for hero section
function FloatingJournalEntries() {
  const entries = [
    { date: 'Jun 2023', opacity: 0.3, x: -120, y: -80, rotate: -8 },
    { date: 'Feb 2024', opacity: 0.35, x: 100, y: -60, rotate: 6 },
    { date: 'Aug 2024', opacity: 0.4, x: -80, y: 40, rotate: -4 },
    { date: 'Nov 2024', opacity: 0.45, x: 140, y: 100, rotate: 8 },
    { date: 'Jan 2025', opacity: 0.5, x: 0, y: 140, rotate: -2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {entries.map((entry, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-24 h-32 bg-amber-50 border border-amber-200 rounded shadow-md"
          style={{
            opacity: entry.opacity,
            x: entry.x,
            y: entry.y,
            rotate: entry.rotate,
          }}
          animate={{
            y: [entry.y, entry.y - 10, entry.y],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="p-2">
            <div className="text-[8px] text-amber-400 mb-1">{entry.date}</div>
            <div className="space-y-1">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="h-1.5 bg-amber-100 rounded"
                  style={{ width: `${60 + Math.random() * 30}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function MemoryCapsuleScenario() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const mayaReflection = `Oh past Maya. You were SO scared. And you had every right to be—it was scary! But look at you now. You survived the first month. Then the first quarter. Then you led a project. Then you got promoted. You now LEAD the team. Sarah from HR? She reports to you now.

The imposter syndrome never fully goes away, but it gets quieter. You belong here. You always did. They didn't make a mistake hiring you.

I'm proud of us.`;

  return (
    <div ref={containerRef} className="relative bg-purple-50">
      <ScrollProgress scrollYProgress={scrollYProgress} color="purple" />
      <SceneIndicator scenes={scenes} scrollYProgress={scrollYProgress} />

      {/* ============ Scene 1: Pain Point / Hero ============ */}
      <ScenePanel
        id="pain"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-50"
      >
        <PanelFrame className="max-w-4xl mx-auto text-center relative">
          <FloatingJournalEntries />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <span className="inline-block px-4 py-1.5 bg-purple-200 text-purple-700 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
              Experience Mode • Biographer Agent
            </span>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-warm-900 mb-6">
              The Memory That{' '}
              <span className="text-purple-600">Came Back</span>
            </h1>

            <div className="max-w-2xl mx-auto">
              <p className="font-hand text-2xl md:text-3xl text-warm-600 italic mb-8">
                &ldquo;I journal but never look back at old entries.&rdquo;
              </p>
              <p className="text-warm-500 text-lg">
                — Maya, Reflective Journaler
              </p>
            </div>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-purple-100">
                <span className="text-purple-600 font-medium">
                  Transformation:
                </span>
                <span className="text-warm-500">Forgotten journals</span>
                <span className="text-purple-500">→</span>
                <span className="font-semibold text-purple-700">
                  Memories that return
                </span>
              </div>
            </motion.div>
          </motion.div>

          <ScrollIndicator />
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 2: The Entry ============ */}
      <ScenePanel
        id="entry"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-amber-50/30"
      >
        <PanelFrame className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Story context */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                January 15, 2025
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-900 mt-4 mb-4">
                Maya starts a new job
              </h2>
              <p className="text-warm-600 text-lg leading-relaxed">
                She writes in ToonNotes, capturing the nervous excitement of her
                first day. The emotions are raw and real.
              </p>
            </motion.div>

            {/* Journal entry */}
            <JournalEntry
              date="January 15, 2025"
              title="First Day at Meridian"
              content={`Today was my first day at the new job. I was so nervous this morning I almost threw up. Everyone seems nice but I don't know anyone yet. My desk is by the window which is good.

Imposter syndrome is REAL. I keep thinking they'll realize they made a mistake hiring me. Sarah from HR said the first month is always the hardest.

I hope I can do this. I really do.`}
              tags={['#journal', '#work', '#newbeginnings']}
            />
          </div>

          <motion.p
            className="text-center text-warm-500 mt-12 text-lg italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Maya closes the app. Life moves on. The entry is never opened again.
          </motion.p>
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 3: Time Passes ============ */}
      <ScenePanel
        id="time"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/30 to-purple-50"
      >
        <PanelFrame className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Through 2025
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-900 mt-4 mb-4">
              A year of growth
            </h2>
            <p className="text-warm-600 text-lg">
              Life happens. Maya thrives. But that first-day entry sits untouched.
            </p>
          </motion.div>

          <TimePassageVisualization />
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 4: The Nudge ============ */}
      <ScenePanel
        id="nudge"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-violet-100"
        sticky
      >
        <PanelFrame className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Story context */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                January 15, 2026
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-900 mt-4 mb-4">
                One year later
              </h2>
              <p className="text-warm-600 text-lg leading-relaxed mb-6">
                Maya opens ToonNotes. A special notification appears...
              </p>

              <AgentNudge
                agent="biographer"
                message="One year ago today, you wrote about your first day at Meridian. Would you like to revisit that memory?"
              />
            </motion.div>

            {/* Phone with notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <PhoneMockup>
                <div className="space-y-4">
                  <OnThisDayCard
                    yearsAgo={1}
                    title="First Day at Meridian"
                    snippet="I was so nervous this morning I almost threw up... I hope I can do this. I really do."
                  />
                </div>
              </PhoneMockup>
            </motion.div>
          </div>
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 5: The Reflection ============ */}
      <ScenePanel
        id="reflection"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-100 to-purple-100"
      >
        <PanelFrame className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Original entry (faded) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-purple-600 font-medium mb-4">
                The original entry:
              </p>
              <JournalEntry
                date="January 15, 2025"
                title="First Day at Meridian"
                content={`Today was my first day at the new job. I was so nervous this morning I almost threw up...

I hope I can do this. I really do.`}
                faded
              />
            </motion.div>

            {/* Reflection interface */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-purple-600 font-medium mb-4">
                Maya writes back to her past self:
              </p>
              <ReflectionInterface reflection={mayaReflection} />
            </motion.div>
          </div>
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 6: Time Capsule ============ */}
      <ScenePanel
        id="capsule"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-50"
      >
        <PanelFrame className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Two memories, connected across time
            </h2>
            <p className="text-warm-600 text-lg">
              The Biographer creates a time capsule linking past and present.
            </p>
          </motion.div>

          <div className="flex justify-center">
            <TimeCapsule />
          </div>
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 7: The Pattern ============ */}
      <ScenePanel
        id="pattern"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white"
      >
        <PanelFrame className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              The Biographer keeps surfacing memories
            </h2>
            <p className="text-warm-600 text-lg max-w-2xl mx-auto">
              It&apos;s not just anniversaries. The Biographer notices patterns,
              provides comfort during anxious moments, and helps you see how far
              you&apos;ve come.
            </p>
          </motion.div>

          <PatternMemoryCards />
        </PanelFrame>
      </ScenePanel>

      {/* ============ Scene 8: CTA ============ */}
      <ScenePanel
        id="cta"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50"
      >
        <PanelFrame className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-6xl mb-6 block">📜</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-warm-900 mb-6">
              Your past self has{' '}
              <span className="text-purple-600">messages for you</span>
            </h2>
            <p className="text-warm-600 text-lg md:text-xl mb-4 max-w-xl mx-auto">
              Your journal isn&apos;t a graveyard. It&apos;s a time capsule waiting to
              be opened.
            </p>
            <p className="text-purple-700 font-medium text-lg mb-10">
              The Biographer makes sure you receive those messages.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-700 shadow-lg hover:shadow-xl"
              >
                Download ToonNotes
              </Link>
              <Link
                href="/scenarios"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white border-2 border-purple-200 px-8 py-4 text-lg font-semibold text-purple-700 transition-all hover:bg-purple-50"
              >
                See Other Scenarios
              </Link>
            </div>
          </motion.div>
        </PanelFrame>
      </ScenePanel>
    </div>
  );
}
