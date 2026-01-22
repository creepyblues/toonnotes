'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface AgentNudgeProps {
  agent: 'manager' | 'muse' | 'librarian' | 'biographer';
  message: string;
  subMessage?: string;
  actions?: {
    label: string;
    primary?: boolean;
    onClick?: () => void;
  }[];
  children?: ReactNode;
  animate?: boolean;
  className?: string;
}

const agentConfig = {
  manager: {
    name: 'Manager Agent',
    icon: '📋',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
  muse: {
    name: 'Muse Agent',
    icon: '💡',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
  },
  librarian: {
    name: 'Librarian Agent',
    icon: '📚',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
  biographer: {
    name: 'Biographer Agent',
    icon: '📜',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
  },
};

export function AgentNudge({
  agent,
  message,
  subMessage,
  actions = [],
  children,
  animate = true,
  className = '',
}: AgentNudgeProps) {
  const config = agentConfig[agent];
  const [clicked, setClicked] = useState<string | null>(null);

  const content = (
    <div
      className={`
        relative w-full max-w-sm
        ${config.bgColor} ${config.borderColor}
        border-2 rounded-2xl p-5 shadow-xl
        ${className}
      `}
    >
      {/* Speech bubble tail */}
      <div
        className={`
          absolute -bottom-3 left-8 w-6 h-6
          ${config.bgColor} ${config.borderColor}
          border-r-2 border-b-2
          transform rotate-45
        `}
      />

      {/* Agent header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            bg-white ${config.borderColor} border-2
            text-xl
          `}
        >
          {config.icon}
        </div>
        <span className={`text-sm font-semibold ${config.textColor}`}>
          {config.name}
        </span>
      </div>

      {/* Message */}
      <p className="text-warm-800 text-lg font-medium mb-2">{message}</p>
      {subMessage && (
        <p className="text-warm-600 text-sm mb-4">{subMessage}</p>
      )}

      {/* Custom content */}
      {children}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="space-y-2 mt-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setClicked(action.label);
                action.onClick?.();
              }}
              className={`
                w-full px-4 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200
                ${
                  action.primary
                    ? `${config.buttonBg} text-white`
                    : clicked === action.label
                    ? 'bg-white border-2 border-warm-300 text-warm-600'
                    : 'bg-white border border-warm-200 text-warm-600 hover:bg-warm-50'
                }
              `}
            >
              {clicked === action.label && !action.primary ? '✓ ' : ''}
              {action.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          type: 'spring',
          stiffness: 100,
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Phone mockup wrapper for nudge
export function PhoneMockup({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        relative w-[280px] md:w-[320px]
        bg-warm-900 rounded-[3rem] p-3
        shadow-2xl
        ${className}
      `}
    >
      {/* Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-warm-900 rounded-full z-10" />

      {/* Screen */}
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden min-h-[500px] md:min-h-[580px]">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 py-2 bg-warm-50">
          <span className="text-xs text-warm-600 font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-warm-400 rounded-sm" />
            <div className="w-4 h-2 bg-warm-400 rounded-sm" />
            <div className="w-6 h-3 bg-warm-600 rounded-sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-warm-600 rounded-full" />
    </div>
  );
}
