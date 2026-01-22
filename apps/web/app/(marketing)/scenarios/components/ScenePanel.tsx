'use client';

import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScenePanelProps {
  children: ReactNode;
  className?: string;
  fadeIn?: boolean;
  sticky?: boolean;
  id?: string;
}

export function ScenePanel({
  children,
  className = '',
  fadeIn = true,
  sticky = false,
  id,
}: ScenePanelProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    fadeIn ? [0, 1, 1, 0] : [1, 1, 1, 1]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    fadeIn ? [50, 0, 0, -50] : [0, 0, 0, 0]
  );

  if (sticky) {
    return (
      <section
        ref={ref}
        id={id}
        className={`relative min-h-[200vh] ${className}`}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, y }}
      className={`relative min-h-screen flex items-center justify-center py-16 md:py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// Webtoon-style panel border
export function PanelFrame({
  children,
  className = '',
  color = 'warm',
}: {
  children: ReactNode;
  className?: string;
  color?: 'warm' | 'blue' | 'amber' | 'green' | 'purple';
}) {
  const borderColors = {
    warm: 'border-warm-300',
    blue: 'border-blue-300',
    amber: 'border-amber-300',
    green: 'border-green-300',
    purple: 'border-purple-300',
  };

  const bgColors = {
    warm: 'bg-warm-50',
    blue: 'bg-blue-50/50',
    amber: 'bg-amber-50/50',
    green: 'bg-green-50/50',
    purple: 'bg-purple-50/50',
  };

  return (
    <div
      className={`
        relative rounded-2xl md:rounded-3xl border-2 ${borderColors[color]} ${bgColors[color]}
        p-6 md:p-10 shadow-lg
        ${className}
      `}
    >
      {/* Comic panel corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-warm-400 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-warm-400 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-warm-400 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-warm-400 rounded-br-lg" />
      {children}
    </div>
  );
}
