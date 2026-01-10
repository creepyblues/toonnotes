'use client';

import { useState } from 'react';
import { X, Check, Palette } from '@phosphor-icons/react';
import {
  BOARD_PRESETS,
  BOARD_CATEGORIES,
  BoardPreset,
  BoardCategory,
} from '@toonnotes/constants';
import { useBoardStore } from '@/stores';
import { cn } from '@/lib/utils';

interface BoardStylePickerProps {
  hashtag: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BoardStylePicker({ hashtag, isOpen, onClose }: BoardStylePickerProps) {
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);
  const setBoardStyle = useBoardStore((state) => state.setBoardStyle);

  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | 'All'>('All');

  const currentPreset = getPresetForBoard(hashtag);

  const filteredPresets =
    selectedCategory === 'All'
      ? BOARD_PRESETS
      : BOARD_PRESETS.filter((p) => p.category === selectedCategory);

  const handleSelectPreset = (preset: BoardPreset) => {
    setBoardStyle(hashtag, preset.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Palette size={24} className="text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Board Style
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a style for #{hashtag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <CategoryTab
            label="All"
            active={selectedCategory === 'All'}
            onClick={() => setSelectedCategory('All')}
          />
          {BOARD_CATEGORIES.map((category) => (
            <CategoryTab
              key={category}
              label={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {/* Presets grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={currentPreset.id === preset.id}
                onSelect={() => handleSelectPreset(preset)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, active, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {label}
    </button>
  );
}

interface PresetCardProps {
  preset: BoardPreset;
  isSelected: boolean;
  onSelect: () => void;
}

function PresetCard({ preset, isSelected, onSelect }: PresetCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-xl overflow-hidden aspect-[4/3] transition-all duration-200',
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
          : 'hover:scale-105'
      )}
      style={{
        background: `linear-gradient(135deg, ${preset.colors.bg} 0%, ${preset.colors.bgSecondary} 100%)`,
      }}
    >
      {/* Preview decorations */}
      {preset.decorations.length > 0 && (
        <div className="absolute top-2 right-2 flex gap-1">
          {preset.decorations.slice(0, 2).map((deco, i) => (
            <span key={i} className="text-lg opacity-60">
              {deco}
            </span>
          ))}
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30">
        <p className="text-xs font-medium text-white truncate">{preset.name}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2">
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
            <Check size={14} weight="bold" className="text-white" />
          </div>
        </div>
      )}

      {/* Accent sample */}
      <div
        className="absolute bottom-8 left-2 w-4 h-4 rounded-full border-2 border-white/50"
        style={{ backgroundColor: preset.colors.accent }}
      />
    </button>
  );
}

// Inline button to trigger the picker
interface BoardStyleButtonProps {
  hashtag: string;
  onOpenPicker: () => void;
}

export function BoardStyleButton({ hashtag, onOpenPicker }: BoardStyleButtonProps) {
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);
  const preset = getPresetForBoard(hashtag);

  return (
    <button
      onClick={onOpenPicker}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Change board style"
    >
      <div
        className="w-5 h-5 rounded-full border-2 border-white/50"
        style={{
          background: `linear-gradient(135deg, ${preset.colors.bg} 0%, ${preset.colors.bgSecondary} 100%)`,
        }}
      />
      <Palette size={16} className="text-white/80" />
    </button>
  );
}
