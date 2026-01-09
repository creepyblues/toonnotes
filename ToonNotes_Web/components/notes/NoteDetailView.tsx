'use client';

import {
  composeStyle,
  composedStyleToCSS,
  getStickerPositionClasses,
} from '@/lib/design-engine/composeStyle';
import { NoteDesign, NoteColor } from '@/lib/design-engine/types';
import type { NoteCardData } from './NoteCard';

interface NoteDetailViewProps {
  note: NoteCardData;
}

export function NoteDetailView({ note }: NoteDetailViewProps) {
  // Reconstruct design from joined fields
  const design: NoteDesign | null =
    note.design_name && note.design_background && note.design_colors
      ? {
          id: note.design_id || '',
          name: note.design_name,
          createdAt: Date.now(),
          background: note.design_background,
          colors: note.design_colors,
          typography: note.design_typography || {
            titleStyle: 'sans-serif',
            vibe: 'modern',
          },
          sticker: note.design_sticker,
        }
      : null;

  // Compose style for detail context
  const style = composeStyle(design, (note.color as NoteColor) || 'White', 'detail');
  const cssStyles = composedStyleToCSS(style);

  // Parse content for special formats (checklists, bullets)
  const renderContent = () => {
    const lines = note.content.split('\n');

    return lines.map((line, index) => {
      // Check for checklist items (- [ ] or - [x])
      const checklistMatch = line.match(/^- \[([ x])\] (.*)$/);
      if (checklistMatch) {
        const isChecked = checklistMatch[1] === 'x';
        const text = checklistMatch[2];
        return (
          <div key={index} className="flex items-start gap-3 py-1">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isChecked
                  ? 'bg-teal-500 border-teal-500'
                  : 'border-warm-300'
              }`}
            >
              {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={isChecked ? 'line-through opacity-60' : ''}>
              {text}
            </span>
          </div>
        );
      }

      // Check for bullet items (- text)
      const bulletMatch = line.match(/^- (.*)$/);
      if (bulletMatch && !checklistMatch) {
        return (
          <div key={index} className="flex items-start gap-3 py-1">
            <span className="w-2 h-2 rounded-full bg-current opacity-40 flex-shrink-0 mt-2" />
            <span>{bulletMatch[1]}</span>
          </div>
        );
      }

      // Regular text or empty line
      return (
        <p key={index} className={line ? 'py-1' : 'h-4'}>
          {line}
        </p>
      );
    });
  };

  return (
    <article
      className="relative overflow-hidden rounded-2xl shadow-lg"
      style={{
        ...cssStyles,
        minHeight: '400px',
      }}
    >
      {/* Pattern overlay */}
      {style.showBackground && style.backgroundPattern && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${style.backgroundPattern.assetName})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px',
            opacity: style.backgroundOpacity,
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* Pin indicator */}
      {note.is_pinned && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <svg
              className="w-4 h-4"
              fill={style.accentColor}
              viewBox="0 0 24 24"
            >
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
            <span className="text-xs font-medium" style={{ color: style.accentColor }}>
              Pinned
            </span>
          </div>
        </div>
      )}

      {/* Note content */}
      <div className="relative z-10 p-8 md:p-12">
        {note.title && (
          <h1
            className="mb-6 text-3xl md:text-4xl font-bold"
            style={{
              color: style.titleColor,
              fontFamily: style.titleFontFamily,
            }}
          >
            {note.title}
          </h1>
        )}

        <div
          className="text-lg leading-relaxed"
          style={{
            color: style.bodyColor,
            fontFamily: style.bodyFontFamily,
          }}
        >
          {renderContent()}
        </div>

        {/* Images */}
        {note.images && note.images.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {note.images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden bg-warm-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Note image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap gap-2">
            {note.labels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-black/5 px-4 py-1.5 text-sm font-medium"
                style={{ color: style.accentColor }}
              >
                #{label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sticker */}
      {style.showSticker && style.stickerUri && (
        <div
          className={`pointer-events-none absolute ${getStickerPositionClasses(style.stickerPosition)}`}
          style={{
            transform: `scale(${style.stickerScale})`,
          }}
        >
          {/* Note: Stickers are local URIs on mobile, show a placeholder */}
          <div className="h-24 w-24 rounded-full bg-white/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Decorations */}
      {style.showDecorations && style.decorationColor && (
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 opacity-10"
          style={{
            background: `radial-gradient(circle at bottom right, ${style.decorationColor}, transparent)`,
          }}
        />
      )}
    </article>
  );
}
