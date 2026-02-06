'use client';

import { cn } from '@/lib/utils';
import {
  MODE_TAB_CONFIGS,
  type ModeTabId,
  type ModeTabConfig,
} from '@/constants/modeConfig';

interface ModeTabBarProps {
  selectedTab: ModeTabId;
  onTabChange: (tab: ModeTabId) => void;
  counts: Record<ModeTabId, number>;
}

export function ModeTabBar({ selectedTab, onTabChange, counts }: ModeTabBarProps) {
  return (
    <div
      className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
      role="tablist"
      aria-label="Filter boards by mode"
    >
      <div className="flex gap-1 px-4 py-2 overflow-x-auto">
        {MODE_TAB_CONFIGS.map((config) => (
          <ModeTab
            key={config.id}
            config={config}
            isActive={selectedTab === config.id}
            count={counts[config.id] || 0}
            onClick={() => onTabChange(config.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ModeTabProps {
  config: ModeTabConfig;
  isActive: boolean;
  count: number;
  onClick: () => void;
}

function ModeTab({ config, isActive, count, onClick }: ModeTabProps) {
  const Icon = config.icon;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
        isActive
          ? 'border-2 font-semibold'
          : 'border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
      style={
        isActive
          ? {
              backgroundColor: `${config.color}15`,
              borderColor: `${config.color}60`,
              color: config.color,
            }
          : undefined
      }
    >
      <Icon
        size={16}
        weight={isActive ? 'fill' : 'regular'}
        color={isActive ? config.color : undefined}
      />
      <span>{config.label}</span>
      {count > 0 && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            isActive
              ? 'text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          )}
          style={isActive ? { backgroundColor: config.color } : undefined}
        >
          {count}
        </span>
      )}
    </button>
  );
}
