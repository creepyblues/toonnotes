'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore, useNoteStore } from '@/stores';
import { NoteColor } from '@toonnotes/types';

interface KeyboardShortcutOptions {
  enabled?: boolean;
}

/**
 * Hook for managing global keyboard shortcuts throughout the webapp.
 *
 * Supported shortcuts:
 * - Cmd/Ctrl+N: Create new note
 * - Cmd/Ctrl+K: Open command palette
 * - Cmd/Ctrl+E: Archive current note (when in editor)
 * - Escape: Close modal/editor
 * - Cmd/Ctrl+/: Show keyboard shortcuts help
 * - G then N: Navigate to Notes
 * - G then B: Navigate to Boards
 * - G then D: Navigate to Designs
 * - G then S: Navigate to Settings
 */
export function useKeyboardShortcuts(options: KeyboardShortcutOptions = {}) {
  const { enabled = true } = options;
  const router = useRouter();
  const pathname = usePathname();

  // Store actions
  const toggleCommandPalette = useUIStore((state) => state.toggleCommandPalette);
  const closeCommandPalette = useUIStore((state) => state.closeCommandPalette);
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const addNote = useNoteStore((state) => state.addNote);
  const archiveNote = useNoteStore((state) => state.archiveNote);

  // State for keyboard shortcuts modal
  const setShortcutsModalOpen = useUIStore((state) => state.setShortcutsModalOpen);
  const shortcutsModalOpen = useUIStore((state) => state.shortcutsModalOpen);

  // Track "G" key prefix for navigation shortcuts
  const gKeyPressed = useRef(false);
  const gKeyTimer = useRef<NodeJS.Timeout | null>(null);

  // Extract note ID from pathname if we're in the editor
  const getCurrentNoteId = useCallback(() => {
    const match = pathname.match(/\/notes\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Create new note and navigate to it
  const handleNewNote = useCallback(() => {
    const newNote = addNote({
      title: '',
      content: '',
      color: NoteColor.White,
      labels: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
    });
    router.push(`/notes/${newNote.id}`);
  }, [addNote, router]);

  // Archive current note (only when in editor)
  const handleArchiveNote = useCallback(() => {
    const noteId = getCurrentNoteId();
    if (noteId) {
      archiveNote(noteId);
      router.push('/');
    }
  }, [archiveNote, getCurrentNoteId, router]);

  // Handle escape key
  const handleEscape = useCallback(() => {
    // Close command palette if open
    if (commandPaletteOpen) {
      closeCommandPalette();
      return;
    }

    // Close shortcuts modal if open
    if (shortcutsModalOpen) {
      setShortcutsModalOpen(false);
      return;
    }

    // If in note editor, go back to notes list
    if (pathname.startsWith('/notes/')) {
      router.push('/');
    }
  }, [commandPaletteOpen, closeCommandPalette, shortcutsModalOpen, setShortcutsModalOpen, pathname, router]);

  // Navigation helpers
  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Clear G key state
  const clearGKeyState = useCallback(() => {
    gKeyPressed.current = false;
    if (gKeyTimer.current) {
      clearTimeout(gKeyTimer.current);
      gKeyTimer.current = null;
    }
  }, []);

  // Main keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if disabled
    if (!enabled) return;

    // Skip if user is typing in an input/textarea (except for specific shortcuts)
    const target = event.target as HTMLElement;
    const isInputFocused =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    const isMod = event.metaKey || event.ctrlKey;

    // Handle Escape - always works
    if (event.key === 'Escape') {
      handleEscape();
      return;
    }

    // Handle Cmd/Ctrl shortcuts
    if (isMod) {
      switch (event.key.toLowerCase()) {
        case 'n':
          // New note
          event.preventDefault();
          handleNewNote();
          return;

        case 'k':
          // Command palette
          event.preventDefault();
          toggleCommandPalette();
          return;

        case 'e':
          // Archive note (only in editor)
          if (pathname.startsWith('/notes/')) {
            event.preventDefault();
            handleArchiveNote();
          }
          return;

        case '/':
          // Show keyboard shortcuts help
          event.preventDefault();
          setShortcutsModalOpen(!shortcutsModalOpen);
          return;
      }
    }

    // Skip G-prefixed shortcuts if in input
    if (isInputFocused) return;

    // Handle G-prefixed navigation shortcuts
    if (event.key.toLowerCase() === 'g' && !isMod) {
      gKeyPressed.current = true;
      // Clear after 1 second
      gKeyTimer.current = setTimeout(clearGKeyState, 1000);
      return;
    }

    // If G was pressed, handle the second key
    if (gKeyPressed.current && !isMod) {
      clearGKeyState();

      switch (event.key.toLowerCase()) {
        case 'n':
          // Go to Notes
          event.preventDefault();
          navigateTo('/');
          return;

        case 'b':
          // Go to Boards
          event.preventDefault();
          navigateTo('/boards');
          return;

        case 'd':
          // Go to Designs
          event.preventDefault();
          navigateTo('/designs');
          return;

        case 's':
          // Go to Settings
          event.preventDefault();
          navigateTo('/settings');
          return;
      }
    }
  }, [
    enabled,
    handleEscape,
    handleNewNote,
    handleArchiveNote,
    toggleCommandPalette,
    pathname,
    setShortcutsModalOpen,
    shortcutsModalOpen,
    clearGKeyState,
    navigateTo,
  ]);

  // Attach event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearGKeyState();
    };
  }, [enabled, handleKeyDown, clearGKeyState]);

  return {
    handleNewNote,
    handleArchiveNote,
    handleEscape,
    navigateTo,
  };
}

/**
 * List of all keyboard shortcuts for display in help modal
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'N'], description: 'Create new note', category: 'Notes' },
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['⌘', 'E'], description: 'Archive current note', category: 'Notes' },
  { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'Close modal / Go back', category: 'Navigation' },
  { keys: ['G', 'N'], description: 'Go to Notes', category: 'Navigation' },
  { keys: ['G', 'B'], description: 'Go to Boards', category: 'Navigation' },
  { keys: ['G', 'D'], description: 'Go to Designs', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },
] as const;
