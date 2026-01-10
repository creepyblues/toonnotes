'use client';

import { useEffect, useRef } from 'react';
import { X, Keyboard } from '@phosphor-icons/react';
import { useUIStore } from '@/stores';
import { KEYBOARD_SHORTCUTS } from '@/lib/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

export function KeyboardShortcutsModal() {
  const shortcutsModalOpen = useUIStore((state) => state.shortcutsModalOpen);
  const setShortcutsModalOpen = useUIStore((state) => state.setShortcutsModalOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShortcutsModalOpen(false);
      }
    };

    if (shortcutsModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shortcutsModalOpen, setShortcutsModalOpen]);

  if (!shortcutsModalOpen) return null;

  // Group shortcuts by category
  const shortcutsByCategory = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS[number][]>);

  const categories = Object.keys(shortcutsByCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Keyboard size={24} className="text-purple-600 dark:text-purple-400" weight="bold" />
            <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcutsByCategory[category].map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd
                              className={cn(
                                'inline-flex items-center justify-center min-w-[28px] h-7 px-2',
                                'text-xs font-medium',
                                'bg-gray-100 dark:bg-gray-800',
                                'text-gray-700 dark:text-gray-300',
                                'border border-gray-200 dark:border-gray-700',
                                'rounded-md shadow-sm'
                              )}
                            >
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">/</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
