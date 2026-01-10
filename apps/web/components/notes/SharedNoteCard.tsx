'use client';

import {
  composeStyle,
  composedStyleToCSS,
  getStickerPositionClasses,
} from '@/lib/design-engine/composeStyle';
import { NoteDesign, SharedNoteData, NoteColor } from '@/lib/design-engine/types';

interface SharedNoteCardProps {
  note: SharedNoteData;
}

export function SharedNoteCard({ note }: SharedNoteCardProps) {
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

  // Compose style for share context
  const style = composeStyle(design, (note.color as NoteColor) || 'White', 'share');
  const cssStyles = composedStyleToCSS(style);

  return (
    <article
      className="relative overflow-hidden"
      style={{
        ...cssStyles,
        minHeight: '200px',
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

      {/* Note content */}
      <div className="relative z-10 p-8">
        {note.title && (
          <h1
            className="mb-4 text-2xl font-semibold"
            style={{
              color: style.titleColor,
              fontFamily: style.titleFontFamily,
            }}
          >
            {note.title}
          </h1>
        )}

        <div
          className="whitespace-pre-wrap leading-relaxed"
          style={{
            color: style.bodyColor,
            fontFamily: style.bodyFontFamily,
          }}
        >
          {note.content}
        </div>

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {note.labels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-black/5 px-3 py-1 text-sm"
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
          {/* Note: Stickers are local URIs on mobile, so we show a placeholder */}
          <div className="h-16 w-16 rounded-full bg-white/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Decorations (subtle accent) */}
      {style.showDecorations && style.decorationColor && (
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 opacity-10"
          style={{
            background: `radial-gradient(circle at bottom right, ${style.decorationColor}, transparent)`,
          }}
        />
      )}
    </article>
  );
}
