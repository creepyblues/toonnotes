'use client';

import { NoteDesign } from '@toonnotes/types';
import { Trash, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DesignCardProps {
  design: NoteDesign;
  onDelete?: (id: string) => void;
  onApply?: (design: NoteDesign) => void;
}

export function DesignCard({ design, onDelete, onApply }: DesignCardProps) {
  return (
    <article
      className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200 group"
    >
      {/* Preview */}
      <div
        className="aspect-square relative"
        style={{
          backgroundColor: design.background.primaryColor,
          background: design.background.secondaryColor
            ? `linear-gradient(135deg, ${design.background.primaryColor}, ${design.background.secondaryColor})`
            : design.background.primaryColor,
        }}
      >
        {/* Sticker preview */}
        {design.sticker?.imageUri && (
          <div className="absolute bottom-2 right-2 w-16 h-16">
            <img
              src={design.sticker.imageUri}
              alt={design.sticker.description || 'Sticker'}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Lucky badge */}
        {design.isLucky && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
              <Sparkle size={12} weight="fill" />
              Lucky
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          {onApply && (
            <button
              onClick={() => onApply(design)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
            >
              Apply to Note
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {design.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDistanceToNow(design.createdAt, { addSuffix: true })}
            </p>
          </div>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(design.id);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete design"
            >
              <Trash size={16} />
            </button>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1 mt-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: design.background.primaryColor }}
            title="Background"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: design.colors.titleText }}
            title="Title color"
          />
          <div
            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: design.colors.accent }}
            title="Accent color"
          />
        </div>
      </div>
    </article>
  );
}
