'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import {
  LABEL_PRESET_LIST,
  PRESETS_BY_CATEGORY,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  getPresetForLabel,
  type LabelPreset,
  type LabelCategory,
} from '@toonnotes/constants';
import { useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';
import { LabelPill } from './LabelPill';

interface LabelPickerProps {
  noteId: string;
  currentLabels: string[];
  onClose?: () => void;
}

const CATEGORY_ORDER: Exclude<LabelCategory, 'system'>[] = [
  'productivity',
  'planning',
  'checklists',
  'media',
  'creative',
  'personal',
];

export function LabelPicker({ noteId, currentLabels, onClose }: LabelPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Exclude<LabelCategory, 'system'> | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const labels = useNoteStore((state) => state.labels);
  const addLabelToNote = useNoteStore((state) => state.addLabelToNote);
  const removeLabelFromNote = useNoteStore((state) => state.removeLabelFromNote);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get existing labels not on this note
  const existingLabels = useMemo(() => {
    return labels
      .filter((l) => !currentLabels.includes(l.name.toLowerCase()))
      .map((l) => l.name);
  }, [labels, currentLabels]);

  // Filter presets by search and category
  const filteredPresets = useMemo(() => {
    let presets = activeCategory === 'all'
      ? LABEL_PRESET_LIST
      : PRESETS_BY_CATEGORY[activeCategory] || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.includes(query) ||
          p.aiPromptHints.some((hint) => hint.includes(query))
      );
    }

    // Exclude already added labels
    return presets.filter((p) => !currentLabels.includes(p.id));
  }, [searchQuery, activeCategory, currentLabels]);

  // Filter existing labels by search
  const filteredExistingLabels = useMemo(() => {
    if (!searchQuery) return existingLabels.slice(0, 5);

    const query = searchQuery.toLowerCase();
    return existingLabels.filter((l) => l.toLowerCase().includes(query));
  }, [searchQuery, existingLabels]);

  // Check if search query is a new label
  const isNewLabel = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const normalized = searchQuery.toLowerCase().trim();

    // Check if it matches an existing label
    const existingMatch = labels.some((l) => l.name.toLowerCase() === normalized);
    if (existingMatch) return false;

    // Check if it matches a preset
    const presetMatch = getPresetForLabel(normalized);
    if (presetMatch) return false;

    return true;
  }, [searchQuery, labels]);

  const handleAddLabel = (labelName: string) => {
    addLabelToNote(noteId, labelName);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleRemoveLabel = (labelName: string) => {
    removeLabelFromNote(noteId, labelName);
  };

  const handleCreateNew = () => {
    if (searchQuery.trim()) {
      addLabelToNote(noteId, searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Labels</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <PhosphorIcons.X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <PhosphorIcons.MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isNewLabel) {
                handleCreateNew();
              }
            }}
            placeholder="Search or create label..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Current labels */}
      {currentLabels.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Current labels</p>
          <div className="flex flex-wrap gap-1">
            {currentLabels.map((label) => (
              <LabelPill
                key={label}
                label={label}
                size="sm"
                onRemove={() => handleRemoveLabel(label)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-1">
          <CategoryTab
            label="All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {CATEGORY_ORDER.map((cat) => (
            <CategoryTab
              key={cat}
              label={CATEGORY_LABELS[cat]}
              color={CATEGORY_COLORS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Preset suggestions */}
      <div className="max-h-64 overflow-y-auto">
        {/* Create new label option */}
        {isNewLabel && (
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <PhosphorIcons.Plus size={16} className="text-purple-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Create <span className="font-medium">#{searchQuery.trim()}</span>
            </span>
          </button>
        )}

        {/* Existing labels section */}
        {filteredExistingLabels.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500 mb-2">Your labels</p>
            {filteredExistingLabels.map((label) => (
              <PresetRow
                key={label}
                label={label}
                onClick={() => handleAddLabel(label)}
              />
            ))}
          </div>
        )}

        {/* Presets section */}
        {filteredPresets.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500 mb-2">Suggested presets</p>
            {filteredPresets.map((preset) => (
              <PresetRow
                key={preset.id}
                preset={preset}
                onClick={() => handleAddLabel(preset.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredPresets.length === 0 && filteredExistingLabels.length === 0 && !isNewLabel && (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <PhosphorIcons.Tag size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No matching labels found</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, color, active, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
        active
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
      style={active && color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {label}
    </button>
  );
}

interface PresetRowProps {
  label?: string;
  preset?: LabelPreset;
  onClick: () => void;
}

function PresetRow({ label, preset, onClick }: PresetRowProps) {
  // Get icon component
  const iconName = preset?.noteIcon || 'Tag';
  const IconComponent = (PhosphorIcons as unknown as Record<string, React.ComponentType<{ size?: number; weight?: string; className?: string; style?: React.CSSProperties }>>)[iconName] || PhosphorIcons.Tag;

  const bgColor = preset?.colors.bg || 'transparent';
  const textColor = preset?.colors.text || 'inherit';
  const accentColor = preset?.colors.primary || '#6B7280';

  return (
    <button
      onClick={onClick}
      className="w-full px-2 py-1.5 flex items-center gap-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{ backgroundColor: bgColor }}
      >
        <IconComponent size={14} weight="fill" style={{ color: accentColor }} />
      </span>
      <span className="flex-1 text-left">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          #{preset?.id || label}
        </span>
        {preset && (
          <span className="ml-2 text-xs text-gray-500">
            {preset.description}
          </span>
        )}
      </span>
    </button>
  );
}

// Export a hook for easy access to preset info
export function usePresetForLabel(labelName: string): LabelPreset | undefined {
  return useMemo(() => getPresetForLabel(labelName), [labelName]);
}
