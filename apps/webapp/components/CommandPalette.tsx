'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass, NotePencil, Clock, X } from '@phosphor-icons/react';
import { useUIStore, useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Note } from '@toonnotes/types';

/**
 * Highlights matching text in a string by wrapping matches in <mark> tags
 */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncates text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Store state
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);
  const notes = useNoteStore((state) => state.notes);
  const searchNotes = useNoteStore((state) => state.searchNotes);

  // Local state
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get search results or recent notes
  const results = useMemo(() => {
    if (query.trim()) {
      return searchNotes(query).slice(0, 10);
    }
    // Show recent notes when no query
    return notes
      .filter((n) => !n.isArchived && !n.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [query, searchNotes, notes]);

  // Reset state when opening/closing
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after mount
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandPaletteOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Navigate to note and close palette
  const navigateToNote = useCallback(
    (note: Note) => {
      closeCommandPalette();
      router.push(`/notes/${note.id}`);
    },
    [closeCommandPalette, router]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            navigateToNote(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeCommandPalette();
          break;
      }
    },
    [results, selectedIndex, navigateToNote, closeCommandPalette]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeCommandPalette();
      }
    },
    [closeCommandPalette]
  );

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <MagnifyingGlass
            size={20}
            className="text-gray-400 dark:text-gray-500 flex-shrink-0"
            weight="bold"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
            aria-label="Search notes"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
              aria-label="Clear search"
            >
              <X size={16} weight="bold" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <NotePencil
                size={40}
                className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
                weight="thin"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {query ? 'No notes found' : 'No recent notes'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {query
                  ? 'Try a different search term'
                  : 'Create a note to get started'}
              </p>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                {query ? (
                  <>
                    <MagnifyingGlass size={12} className="inline mr-1" />
                    Results
                  </>
                ) : (
                  <>
                    <Clock size={12} className="inline mr-1" />
                    Recent Notes
                  </>
                )}
              </div>

              {/* Note items */}
              {results.map((note, index) => (
                <button
                  key={note.id}
                  data-index={index}
                  onClick={() => navigateToNote(note)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors',
                    'focus:outline-none',
                    index === selectedIndex
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="flex items-start gap-3">
                    <NotePencil
                      size={18}
                      className={cn(
                        'flex-shrink-0 mt-0.5',
                        index === selectedIndex
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-400 dark:text-gray-500'
                      )}
                      weight={index === selectedIndex ? 'fill' : 'regular'}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          index === selectedIndex
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        {note.title
                          ? highlightText(note.title, query)
                          : 'Untitled'}
                      </p>
                      {note.content && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {highlightText(truncateText(note.content, 80), query)}
                        </p>
                      )}
                      {note.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.labels.slice(0, 3).map((label) => (
                            <span
                              key={label}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
                            >
                              #{label}
                            </span>
                          ))}
                          {note.labels.length > 3 && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              +{note.labels.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        Enter
                      </kbd>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  ↑
                </kbd>{' '}
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  ↓
                </kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Enter
                </kbd>{' '}
                Open
              </span>
            </div>
            <span>
              <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to highlight search matches - exported for testing
 */
export { highlightText, escapeRegex, truncateText };
