'use client';

import { motion } from 'framer-motion';

interface NoteCardProps {
  content: string;
  color?: 'white' | 'lavender' | 'rose' | 'peach' | 'mint' | 'sky' | 'violet';
  rotation?: number;
  className?: string;
  delay?: number;
  index?: number;
}

const colorClasses = {
  white: 'bg-white',
  lavender: 'bg-[#EDE9FE]',
  rose: 'bg-[#FFE4E6]',
  peach: 'bg-[#FED7AA]',
  mint: 'bg-[#D1FAE5]',
  sky: 'bg-[#E0F2FE]',
  violet: 'bg-[#DDD6FE]',
};

export function NoteCard({
  content,
  color = 'white',
  rotation = 0,
  className = '',
  delay = 0,
  index = 0,
}: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: rotation - 5 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{
        duration: 0.5,
        delay: delay + index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      className={`
        relative px-4 py-3 rounded-lg shadow-md
        ${colorClasses[color]}
        border border-warm-200/50
        ${className}
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
        // Paper texture effect
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
          linear-gradient(180deg, transparent 95%, rgba(0,0,0,0.02) 100%)
        `,
      }}
    >
      {/* Tape/pin decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-200/80 rounded-sm shadow-sm" />

      <p className="text-sm text-warm-700 font-medium leading-relaxed">
        {content}
      </p>
    </motion.div>
  );
}

// Animated stack of chaotic notes
export function ChaoticNoteStack({ notes }: { notes: string[] }) {
  const colors: NoteCardProps['color'][] = ['white', 'lavender', 'rose', 'peach', 'mint', 'sky', 'violet'];

  return (
    <div className="relative w-full max-w-md h-80 md:h-96">
      {notes.slice(0, 8).map((note, index) => {
        const randomRotation = (Math.random() - 0.5) * 30;
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 100;
        const color = colors[index % colors.length];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: randomX,
              y: randomY,
            }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              type: 'spring',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: index }}
          >
            <NoteCard
              content={note}
              color={color}
              rotation={randomRotation}
              index={0}
            />
          </motion.div>
        );
      })}

      {/* Overflow indicator */}
      {notes.length > 8 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-0 right-0 px-3 py-1 bg-warm-600 text-white text-sm rounded-full"
        >
          +{notes.length - 8} more
        </motion.div>
      )}
    </div>
  );
}

// Organized Kanban-style board
interface BoardColumn {
  title: string;
  cards: { text: string; urgent?: boolean }[];
}

export function OrganizedBoard({ columns }: { columns: BoardColumn[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-4xl"
    >
      {columns.map((column, colIndex) => (
        <motion.div
          key={column.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: colIndex * 0.15 }}
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
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: colIndex * 0.15 + cardIndex * 0.1 + 0.3 }}
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
    </motion.div>
  );
}
