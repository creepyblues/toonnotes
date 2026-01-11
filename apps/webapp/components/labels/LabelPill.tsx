'use client';

import * as PhosphorIcons from '@phosphor-icons/react';
import { getPresetForLabelFuzzy, type LabelPreset } from '@toonnotes/constants';
import { cn } from '@/lib/utils';

interface LabelPillProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function LabelPill({
  label,
  size = 'sm',
  showIcon = true,
  onClick,
  onRemove,
  className,
}: LabelPillProps) {
  const preset = getPresetForLabelFuzzy(label);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Get the Phosphor icon component dynamically
  const IconComponent = preset?.noteIcon
    ? (PhosphorIcons as unknown as Record<string, React.ComponentType<{ size?: number; weight?: string; className?: string }>>)[preset.noteIcon]
    : PhosphorIcons.Tag;

  const backgroundColor = preset?.colors.bg || 'rgba(229, 231, 235, 0.6)';
  const textColor = preset?.colors.text || '#374151';
  const accentColor = preset?.colors.primary || '#6B7280';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all',
        onClick && 'cursor-pointer hover:opacity-80',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
      onClick={onClick}
    >
      {showIcon && IconComponent && (
        <IconComponent
          size={iconSizes[size]}
          weight="fill"
          className="flex-shrink-0"
          style={{ color: accentColor }}
        />
      )}
      <span>#{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label={`Remove ${label} label`}
        >
          <PhosphorIcons.X size={iconSizes[size]} />
        </button>
      )}
    </span>
  );
}

// Get preset info for a label (exported for use in other components)
export function getLabelPresetInfo(labelName: string): LabelPreset | undefined {
  return getPresetForLabelFuzzy(labelName);
}
