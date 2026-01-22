'use client';

import { motion, useScroll, useSpring, MotionValue } from 'framer-motion';

const colorMap = {
  teal: 'bg-teal-600',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  amber: 'bg-amber-600',
  purple: 'bg-purple-600',
};

export function ScrollProgress({
  scrollYProgress: externalProgress,
  color = 'teal',
}: {
  scrollYProgress?: MotionValue<number>;
  color?: keyof typeof colorMap;
} = {}) {
  const { scrollYProgress: internalProgress } = useScroll();
  const progress = externalProgress || internalProgress;

  const scaleX = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 ${colorMap[color]} origin-left z-50`}
      style={{ scaleX }}
    />
  );
}

const colorAccents = {
  teal: { active: '#4C9C9B', text: 'text-teal-600' },
  blue: { active: '#2563EB', text: 'text-blue-600' },
  green: { active: '#16A34A', text: 'text-green-600' },
  amber: { active: '#D97706', text: 'text-amber-600' },
  purple: { active: '#9333EA', text: 'text-purple-600' },
};

// Vertical scene indicator dots
export function SceneIndicator({
  scenes,
  scrollYProgress,
  color = 'teal',
}: {
  scenes: { id: string; label: string }[];
  scrollYProgress?: MotionValue<number>;
  color?: keyof typeof colorAccents;
}) {
  const handleSceneClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate active scene index based on scroll progress
  const getActiveIndex = (progress: number) => {
    const index = Math.floor(progress * scenes.length);
    return Math.min(index, scenes.length - 1);
  };

  const accent = colorAccents[color];

  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          onClick={() => handleSceneClick(scene.id)}
          className="group flex items-center gap-3"
        >
          {/* Label (hidden by default, shown on hover) */}
          <span
            className={`
              text-xs font-medium whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity
              ${accent.text}
            `}
          >
            {scene.label}
          </span>

          {/* Dot */}
          <motion.div
            className="w-3 h-3 rounded-full bg-warm-300"
            whileHover={{ scale: 1.2, backgroundColor: accent.active }}
          />
        </button>
      ))}
    </div>
  );
}

// Scroll down indicator
export function ScrollIndicator({ show = true }: { show?: boolean } = {}) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-sm text-warm-500">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-6 h-10 border-2 border-warm-400 rounded-full flex justify-center pt-2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1.5 h-3 bg-warm-400 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}
