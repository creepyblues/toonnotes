'use client';

import * as ContextMenu from '@radix-ui/react-context-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DotsThree, Check, X } from '@phosphor-icons/react';
import { MODE_TAB_CONFIGS } from '@/constants/modeConfig';
import type { Mode } from '@toonnotes/types';

interface ModeContextMenuProps {
  children: React.ReactNode;
  currentMode?: Mode;
  onModeChange: (mode: Mode | undefined) => void;
}

/**
 * Wraps children with a right-click context menu for mode assignment.
 */
export function ModeContextMenu({ children, currentMode, onModeChange }: ModeContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[220px] rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-1.5 animate-in fade-in zoom-in-95"
        >
          <ContextMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            Assign Mode
          </ContextMenu.Label>
          {MODE_TAB_CONFIGS.filter((c) => c.id !== 'uncategorized').map((config) => {
            const Icon = config.icon;
            const isSelected = currentMode === config.id;
            return (
              <ContextMenu.Item
                key={config.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onSelect={() => onModeChange(config.id as Mode)}
              >
                <Icon size={18} color={config.color} weight={isSelected ? 'fill' : 'regular'} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
                {isSelected && (
                  <Check size={16} className="text-green-500" weight="bold" />
                )}
              </ContextMenu.Item>
            );
          })}
          {currentMode && (
            <>
              <ContextMenu.Separator className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
              <ContextMenu.Item
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onSelect={() => onModeChange(undefined)}
              >
                <X size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remove mode</span>
              </ContextMenu.Item>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

/**
 * Three-dot dropdown button for mode assignment (hover/touch fallback).
 */
interface ModeDropdownButtonProps {
  currentMode?: Mode;
  onModeChange: (mode: Mode | undefined) => void;
  alwaysVisible?: boolean;
}

export function ModeDropdownButton({ currentMode, onModeChange, alwaysVisible }: ModeDropdownButtonProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`p-1.5 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors ${alwaysVisible ? '' : 'opacity-0 group-hover:opacity-100'}`}
          aria-label="Change mode"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <DotsThree size={18} weight="bold" className="text-white" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-1.5 z-50 animate-in fade-in zoom-in-95"
          sideOffset={4}
          align="end"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            Assign Mode
          </DropdownMenu.Label>
          {MODE_TAB_CONFIGS.filter((c) => c.id !== 'uncategorized').map((config) => {
            const Icon = config.icon;
            const isSelected = currentMode === config.id;
            return (
              <DropdownMenu.Item
                key={config.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onSelect={() => onModeChange(config.id as Mode)}
              >
                <Icon size={18} color={config.color} weight={isSelected ? 'fill' : 'regular'} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
                {isSelected && (
                  <Check size={16} className="text-green-500" weight="bold" />
                )}
              </DropdownMenu.Item>
            );
          })}
          {currentMode && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onSelect={() => onModeChange(undefined)}
              >
                <X size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remove mode</span>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
