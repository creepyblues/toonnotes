'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  Plus,
  List,
  SquaresFour,
  Command,
} from '@phosphor-icons/react';
import { useUIStore, useNoteStore } from '@/stores';
import { cn } from '@/lib/utils';
import { NoteColor } from '@toonnotes/types';

interface TopBarProps {
  title?: string;
  showViewToggle?: boolean;
  showNewButton?: boolean;
  showSearch?: boolean;
}

export function TopBar({
  title = 'Notes',
  showViewToggle = true,
  showNewButton = true,
  showSearch = true,
}: TopBarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);

  const addNote = useNoteStore((state) => state.addNote);

  // Focus search on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      // Cmd+N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette]);

  const handleNewNote = () => {
    const newNote = addNote({
      title: '',
      content: '',
      labels: [],
      color: NoteColor.White,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
    });
    router.push(`/notes/${newNote.id}`);
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-20 py-2 rounded-lg',
                'bg-gray-100 dark:bg-gray-800',
                'border border-transparent focus:border-purple-500 dark:focus:border-purple-400',
                'text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
                'text-sm outline-none transition-colors'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 text-xs">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-medium">
                <Command size={10} className="inline" />K
              </kbd>
            </div>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              aria-label="Grid view"
            >
              <SquaresFour size={18} weight={viewMode === 'grid' ? 'fill' : 'bold'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              aria-label="List view"
            >
              <List size={18} weight={viewMode === 'list' ? 'fill' : 'bold'} />
            </button>
          </div>
        )}

        {/* New Note Button */}
        {showNewButton && (
          <button
            onClick={handleNewNote}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
              'text-white font-medium text-sm',
              'transition-colors'
            )}
          >
            <Plus size={18} weight="bold" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        )}
      </div>
    </header>
  );
}
