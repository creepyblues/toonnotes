'use client';

import Link from 'next/link';
import {
  composeStyle,
  composedStyleToCSS,
} from '@/lib/design-engine/composeStyle';
import { NoteDesign, NoteColor } from '@/lib/design-engine/types';

export interface NoteCardData {
  id: string;
  title: string;
  content: string;
  labels: string[];
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  design_id?: string;
  images?: string[];
  // Joined design fields
  design_name?: string;
  design_background?: NoteDesign['background'];
  design_colors?: NoteDesign['colors'];
  design_typography?: NoteDesign['typography'];
  design_sticker?: NoteDesign['sticker'];
}

interface NoteCardProps {
  note: NoteCardData;
}

export function NoteCard({ note }: NoteCardProps) {
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

  // Compose style for grid context
  const style = composeStyle(design, (note.color as NoteColor) || 'White', 'grid');
  const cssStyles = composedStyleToCSS(style);

  // Truncate content for preview
  const previewContent = note.content.length > 150
    ? note.content.slice(0, 150) + '...'
    : note.content;

  // Format date
  const formattedDate = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/app/notes/${note.id}`} className="block group">
      <article
        className="relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
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
              backgroundSize: '80px',
              opacity: style.backgroundOpacity,
              mixBlendMode: 'multiply',
            }}
          />
        )}

        {/* Pin indicator */}
        {note.is_pinned && (
          <div className="absolute top-3 right-3 z-20">
            <svg
              className="w-4 h-4"
              fill={style.accentColor}
              viewBox="0 0 24 24"
            >
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
          </div>
        )}

        {/* Note content */}
        <div className="relative z-10 p-5 h-full flex flex-col">
          {note.title && (
            <h3
              className="mb-2 text-base font-semibold line-clamp-2"
              style={{
                color: style.titleColor,
                fontFamily: style.titleFontFamily,
              }}
            >
              {note.title}
            </h3>
          )}

          <p
            className="flex-1 text-sm leading-relaxed line-clamp-4"
            style={{
              color: style.bodyColor,
              fontFamily: style.bodyFontFamily,
            }}
          >
            {previewContent || 'Empty note'}
          </p>

          {/* Footer with labels and date */}
          <div className="mt-4 flex items-end justify-between">
            {/* Labels */}
            {note.labels && note.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
                {note.labels.slice(0, 2).map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-black/5 px-2 py-0.5 text-xs"
                    style={{ color: style.accentColor }}
                  >
                    #{label}
                  </span>
                ))}
                {note.labels.length > 2 && (
                  <span
                    className="text-xs opacity-60"
                    style={{ color: style.bodyColor }}
                  >
                    +{note.labels.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Date */}
            <span
              className="text-xs whitespace-nowrap opacity-50"
              style={{ color: style.bodyColor }}
            >
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Image indicator */}
        {note.images && note.images.length > 0 && (
          <div className="absolute bottom-3 right-3 z-20">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/10 rounded-full backdrop-blur-sm">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke={style.bodyColor}
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs" style={{ color: style.bodyColor }}>
                {note.images.length}
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      </article>
    </Link>
  );
}
